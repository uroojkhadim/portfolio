import { saveMessage, validateSubmissionSpam, updateMessageNotificationStatus } from '../server/services/storage.js'
import { sendWhatsAppNotification } from '../server/services/whatsapp.js'
import { sendNewMessageNotification, isEmailConfigured } from '../server/services/email.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normaliseBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return req.body
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve({ sent: false, reason: 'timeout', label }), ms)),
  ])
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const body = normaliseBody(req)
    const { name, email, subject, message, _honeypot } = body

    // 1. Bot honeypot (hidden field)
    if (_honeypot) {
      console.warn('[Contact API] Bot honeypot triggered. Silently dropping.')
      return res.status(200).json({ success: true, message: 'Message submitted successfully' })
    }

    // 2. Validate every field on the server
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name (at least 2 characters).' })
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' })
    }
    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return res.status(400).json({ error: 'Please enter a subject (at least 3 characters).' })
    }
    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a message with at least 10 characters.' })
    }
    if (name.length > 120 || email.length > 200 || subject.length > 200 || message.length > 8000) {
      return res.status(400).json({ error: 'One of the fields is too long. Please shorten your message.' })
    }

    // 3. Spam and rate limiting
    const forwarded = req.headers['x-forwarded-for'] || req.headers['x-real-ip']
    const clientIp = String(forwarded || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim()

    const spamCheck = validateSubmissionSpam(clientIp, email, message)
    if (!spamCheck.allowed) {
      return res.status(429).json({ error: spamCheck.reason })
    }

    // 4. Persist first — a success response must never precede the durable write
    let savedRecord
    try {
      savedRecord = await saveMessage({
        name,
        email,
        subject,
        message,
        clientIp,
      })
    } catch (saveError) {
      console.error('[Contact API] Message could not be saved:', saveError)
      return res.status(503).json({
        error: 'Your message could not be saved right now. Please try again in a moment, or email uroojkhadim505@gmail.com directly.',
      })
    }

    // 5. Notifications (best effort, never blocks confirmation of the saved message)
    const emailPromise = isEmailConfigured()
      ? withTimeout(sendNewMessageNotification(savedRecord), 12000, 'email')
      : Promise.resolve({ sent: false, reason: 'not_configured' })

    const whatsappPromise = withTimeout(sendWhatsAppNotification(savedRecord), 12000, 'whatsapp')

    const [emailResult, whatsappResult] = await Promise.all([emailPromise, whatsappPromise])

    const emailState = emailResult.sent ? 'sent' : (emailResult.reason || 'failed')
    const whatsappState = whatsappResult.success ? (whatsappResult.provider || 'sent') : (whatsappResult.reason || 'failed')
    const notificationStatus = [`email:${emailState}`, `whatsapp:${whatsappState}`].join(', ')
    const notified = Boolean(emailResult.sent || whatsappResult.success)

    updateMessageNotificationStatus(
      savedRecord.id,
      notificationStatus,
      emailResult.error || whatsappResult.error || null
    )

    return res.status(200).json({
      success: true,
      messageId: savedRecord.id,
      message: notified
        ? 'Thank you! Your message has been saved and Urooj has been notified.'
        : 'Thank you! Your message has been saved to the inbox. Email notifications are not configured yet, so it will be waiting in the admin dashboard.',
      notification: {
        email: emailState,
        whatsapp: whatsappState,
      },
    })
  } catch (error) {
    console.error('[Contact API] Internal Server Error:', error)
    return res.status(500).json({
      error: 'An unexpected error occurred while saving your message. Please try again or email directly.',
    })
  }
}
