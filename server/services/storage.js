import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import db from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function getStoragePaths() {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY)
  let dir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(__dirname, '../data')
  if (isServerless && !process.env.DATA_DIR) {
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

/** Ensure the legacy JSON mirror directory exists */
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

/**
 * Save a new message to SQLite.
 * Throws when the durable write fails so the API never reports a false success.
 */
export async function saveMessage({ name, email, subject, message, clientIp = '127.0.0.1' }) {
  const id = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const createdAt = new Date().toISOString()
  const record = {
    id,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    createdAt,
    clientIp: String(clientIp).split(',')[0].trim(),
    status: 'unread',
  }

  // Primary (required): durable SQLite write
  const result = db.prepare(
    `INSERT INTO contact_messages (id, name, email, subject, message, status, client_ip, created_at)
     VALUES (?, ?, ?, ?, ?, 'unread', ?, ?)`
  ).run(id, record.name, record.email, record.subject, record.message, record.clientIp, createdAt)

  if (!result || result.changes !== 1) {
    throw new Error('The message could not be written to the database.')
  }

  // Verify the row is readable before confirming delivery to the visitor.
  const persisted = db.prepare('SELECT id FROM contact_messages WHERE id = ?').get(id)
  if (!persisted) {
    throw new Error('The message could not be verified in the database.')
  }

  // Secondary (best effort): JSON mirror kept for backward compatibility
  try {
    ensureStorage()
    const { file: messagesFile } = getStoragePaths()
    let messages = []
    if (fs.existsSync(messagesFile)) {
      const content = fs.readFileSync(messagesFile, 'utf-8')
      messages = JSON.parse(content || '[]')
    }
    messages.unshift(record)
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf-8')
  } catch (err) {
    console.warn('[Storage Service] Notice saving message to JSON mirror:', err.message)
  }

  return record
}

/** Persist notification delivery state for a message (SQLite + JSON mirror) */
export function updateMessageNotificationStatus(id, status, error = null) {
  try {
    db.prepare('UPDATE contact_messages SET notification_status = ?, notification_error = ? WHERE id = ?')
      .run(status, error ? String(error).slice(0, 500) : null, id)
  } catch (err) {
    console.warn(`[Storage Service] Notice updating notification status for ${id}:`, err.message)
  }

  try {
    const { file: messagesFile } = getStoragePaths()
    if (!fs.existsSync(messagesFile)) return
    const content = fs.readFileSync(messagesFile, 'utf-8')
    const messages = JSON.parse(content || '[]')
    const idx = messages.findIndex((m) => m.id === id)
    if (idx !== -1) {
      messages[idx].notificationStatus = status
      messages[idx].notificationError = error ? String(error) : null
      messages[idx].notifiedAt = new Date().toISOString()
      fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2), 'utf-8')
    }
  } catch (err) {
    console.warn(`[Storage Service] Notice updating JSON status for ${id}:`, err.message)
  }
}
