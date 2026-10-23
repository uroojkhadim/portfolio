import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getStoragePaths() {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY)
  let dir = path.resolve(__dirname, '../data')
  if (isServerless) {
    dir = '/tmp/portfolio-data'
  }
  return {
    dir,
    file: path.join(dir, 'messages.json'),
  }
}

// In-memory rate limiting and deduplication cache
const recentSubmissions = new Map() // key: ip or email -> timestamp
const ipSubmissionCounts = new Map() // key: ip -> [timestamps]

/** Ensure persistent storage file exists */
function ensureStorage() {
  try {
    const { dir, file } = getStoragePaths()
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([], null, 2), 'utf-8')
    }
  } catch (err) {
    console.warn('[Storage Service] Notice initializing messages directory:', err.message)
  }
}

/** Check rate limits and prevent spam/duplicate submissions */
export function validateSubmissionSpam(clientIp, email, messageText) {
  const now = Date.now()

  // 1. Duplicate check (same email + same message within 60 seconds)
  const dupKey = `${email.toLowerCase()}_${messageText.trim().substring(0, 40)}`
  const lastTime = recentSubmissions.get(dupKey)
  if (lastTime && now - lastTime < 60000) {
    return {
      allowed: false,
      reason: 'Duplicate message detected. Please wait a moment before sending again.',
    }
  }

  // 2. IP Rate limit (Max 6 messages per 10 minutes)
  const timestamps = (ipSubmissionCounts.get(clientIp) || []).filter(
    (t) => now - t < 10 * 60 * 1000
  )
  if (timestamps.length >= 6) {
    return {
      allowed: false,
      reason: 'Too many messages sent from this network. Please try again in a few minutes.',
    }
  }

  // Record submission attempt
  recentSubmissions.set(dupKey, now)
  timestamps.push(now)
  ipSubmissionCounts.set(clientIp, timestamps)

  return { allowed: true }
}

/** Save a new message to SQLite (primary) and also write to JSON fallback */
export async function saveMessage({ name, email, subject, message, clientIp = '127.0.0.1' }) {
  ensureStorage()

  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const record = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    createdAt: new Date().toISOString(),
    clientIp,
    whatsappNotificationStatus: 'pending',
    whatsappNotificationError: null,
  }

  // Primary: save to SQLite
  try {
    db.prepare(
      `INSERT INTO contact_messages (id, name, email, subject, message, status, client_ip, created_at)
       VALUES (?, ?, ?, ?, ?, 'unread', ?, datetime('now'))`
    ).run(id, record.name, record.email, record.subject, record.message, String(clientIp).split(',')[0].trim())
    console.log(`[Storage Service] Message ${id} saved to SQLite.`)
  } catch (err) {
    console.error('[Storage Service] Failed to save message to SQLite:', err)
  }

  // Secondary: also write JSON for backward compat / WhatsApp notification status tracking
  try {
    const { file: messagesFile } = getStoragePaths()
    let messages = []
    if (fs.existsSync(messagesFile)) {
      const content = fs.readFileSync(messagesFile, 'utf-8')
      messages = JSON.parse(content || '[]')
    }
    messages.unshift(record) // newest first
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf-8')
    console.log(`[Storage Service] Message ${id} also written to ${messagesFile}`)
  } catch (err) {
    console.warn('[Storage Service] Notice saving message to JSON fallback:', err.message)
  }

  return record
}

/** Update the WhatsApp notification status for a stored message */
export function updateMessageNotificationStatus(id, status, error = null) {
  ensureStorage()
  try {
    const { file: messagesFile } = getStoragePaths()
    if (!fs.existsSync(messagesFile)) return
    const content = fs.readFileSync(messagesFile, 'utf-8')
    const messages = JSON.parse(content || '[]')
    const idx = messages.findIndex((m) => m.id === id)
    if (idx !== -1) {
      messages[idx].whatsappNotificationStatus = status
      messages[idx].whatsappNotificationError = error ? String(error) : null
      messages[idx].notifiedAt = new Date().toISOString()
      fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf-8')
    }
  } catch (err) {
    console.warn(`[Storage Service] Notice updating status for ${id}:`, err.message)
  }
}
