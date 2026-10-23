import nodemailer from 'nodemailer'

/**
 * Creates an SMTP transporter if environment variables are provided.
 * Returns null if SMTP is not configured.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user,
      pass,
    },
  })
}

/**
 * Check if SMTP email service is configured
 */
export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

/**
 * Send an email notification to admin when a new contact form message is received.
 * Non-blocking, fails gracefully without throwing.
 */
export async function sendNewMessageNotification(messageRecord) {
  try {
    const transporter = getTransporter()
    if (!transporter) {
      return { sent: false, reason: 'SMTP not configured' }
    }

    const recipient = process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER
    const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER

    const subject = `[Portfolio Contact] New message from ${messageRecord.name}: ${messageRecord.subject}`
    const text = `You have received a new contact message on your portfolio:\n\n` +
      `Sender: ${messageRecord.name} (${messageRecord.email})\n` +
      `Subject: ${messageRecord.subject}\n` +
      `Date: ${new Date(messageRecord.createdAt || Date.now()).toLocaleString()}\n` +
      `IP: ${messageRecord.clientIp || 'Unknown'}\n\n` +
      `Message:\n${messageRecord.message}\n\n` +
      `---\nView and respond in the Admin Dashboard: /admin#messages`

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-top: 0;">New Contact Form Message</h2>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p style="margin: 4px 0;"><strong>From:</strong> ${escapeHtml(messageRecord.name)} (&lt;<a href="mailto:${escapeHtml(messageRecord.email)}">${escapeHtml(messageRecord.email)}</a>&gt;)</p>
          <p style="margin: 4px 0;"><strong>Subject:</strong> ${escapeHtml(messageRecord.subject)}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(messageRecord.createdAt || Date.now()).toLocaleString()}</p>
        </div>
        <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #6366f1; background-color: #f1f5f9; white-space: pre-wrap;">${escapeHtml(messageRecord.message)}</div>
        <p style="margin-top: 25px; font-size: 13px; color: #64748b;">
          Submitted via your portfolio website.
        </p>
      </div>
    `

    const info = await transporter.sendMail({
      from: `"Portfolio Contact Form" <${fromAddress}>`,
      to: recipient,
      replyTo: `"${messageRecord.name}" <${messageRecord.email}>`,
      subject,
      text,
      html,
    })

    console.log(`[Email Service] Notification sent for message ${messageRecord.id} (messageId: ${info.messageId})`)
    return { sent: true, messageId: info.messageId }
  } catch (err) {
    console.error('[Email Service] Failed to send notification email:', err.message)
    return { sent: false, error: err.message }
  }
}

/**
 * Send an email reply from admin to a contact sender.
 * Throws if sending fails so caller can accurately report success/failure.
 */
export async function sendReplyEmail({ to, subject, replyBody }) {
  const transporter = getTransporter()
  if (!transporter) {
    throw new Error('SMTP email service is not configured on the server. Please check SMTP environment variables.')
  }

  const fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER

  const info = await transporter.sendMail({
    from: `"Urooj Khadim" <${fromAddress}>`,
    to,
    subject: subject.startsWith('Re:') ? subject : `Re: ${subject}`,
    text: replyBody,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #1e293b;">${escapeHtml(replyBody)}</div>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 15px 0;" />
        <p style="font-size: 13px; color: #64748b; margin: 0;">
          Urooj Khadim &middot; Software Engineering Student &amp; Developer<br />
          <a href="mailto:${fromAddress}" style="color: #6366f1;">${fromAddress}</a>
        </p>
      </div>
    `,
  })

  return { success: true, messageId: info.messageId }
}

function escapeHtml(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
