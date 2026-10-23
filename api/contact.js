import { saveMessage, validateSubmissionSpam } from '../server/services/storage.js'
import { sendWhatsAppNotification } from '../server/services/whatsapp.js'
import { sendNewMessageNotification } from '../server/services/email.js'

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { name, email, subject, message, _honeypot } = body

    // 1. Bot Honeypot check (hidden field)
    if (_honeypot) {
      console.warn('[Contact API] Bot honeypot triggered. Silently dropping.')
      return res.status(200).json({ success: true, message: 'Message submitted successfully' })
    }

    // 2. Field Validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter a valid full name (at least 2 characters).' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' })
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      return res.status(400).json({ error: 'Please enter a subject (at least 3 characters).' })
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'Please provide a message with at least 10 characters.' })
    }

    // 3. Spam & Rate Limiting check
    const clientIp =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1'

    const spamCheck = validateSubmissionSpam(clientIp, email, message)
    if (!spamCheck.allowed) {
      return res.status(429).json({ error: spamCheck.reason })
    }

    // 4. Save to Persistent Storage
    const savedRecord = await saveMessage({
      name,
      email,
      subject,
      message,
      clientIp: String(clientIp).split(',')[0].trim(),
    })

    // 5. Trigger Real-Time WhatsApp Notification (Non-blocking / resilient)
    sendWhatsAppNotification(savedRecord).catch((err) => {
      console.error('[Contact API] Error triggering WhatsApp notification:', err)
    })

    // 6. Trigger Real-Time Email Notification (Non-blocking / resilient if SMTP configured)
    sendNewMessageNotification(savedRecord).catch((err) => {
      console.error('[Contact API] Error triggering Email notification:', err)
    })

    return res.status(200).json({
      success: true,
      messageId: savedRecord.id,
      message: 'Thank you! Your message has been received and Urooj will be notified.',
    })
  } catch (error) {
    console.error('[Contact API] Internal Server Error:', error)
    return res.status(500).json({
      error: 'An unexpected error occurred while saving your message. Please try again or email directly.',
    })
  }
}
