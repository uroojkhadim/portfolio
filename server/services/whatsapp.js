/**
 * WhatsApp Real-Time Notification Service
 * 
 * Supports 3 production-ready WhatsApp delivery providers:
 * 1. Meta WhatsApp Business Cloud API (Official)
 * 2. Twilio WhatsApp API
 * 3. CallMeBot Free Personal Gateway (Popular for developer portfolio alerts)
 * 
 * Never crashes the contact submission if WhatsApp delivery fails.
 * Original messages are always preserved in persistent storage.
 */

import { updateMessageNotificationStatus } from './storage.js'

export async function sendWhatsAppNotification({ id, name, email, subject, message }) {
  const recipient =
    process.env.WHATSAPP_RECIPIENT_PHONE ||
    process.env.WHATSAPP_TO ||
    '+923136576128' // Default recipient phone (configurable via env)

  const preview =
    message.length > 140 ? `${message.substring(0, 140)}...` : message

  const notificationText = [
    `🔔 *New Portfolio Contact Message*`,
    `*From:* ${name} (${email})`,
    `*Subject:* ${subject}`,
    `*Message Preview:*\n"${preview}"`,
    `*Ref ID:* ${id}`,
    `*Received:* ${new Date().toLocaleString()}`,
  ].join('\n\n')

  console.log(`[WhatsApp Service] Processing real-time notification for message ${id}...`)

  // --- Provider 1: Meta WhatsApp Business Cloud API ---
  const metaToken = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN
  const metaPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (metaToken && metaPhoneNumberId) {
    try {
      // Clean recipient phone to E.164 without '+'
      const cleanPhone = recipient.replace(/[^0-9]/g, '')
      const url = `https://graph.facebook.com/v18.0/${metaPhoneNumberId}/messages`

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { preview_url: false, body: notificationText },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error?.message || `HTTP ${response.status}`)
      }

      console.log(`[WhatsApp Service] Meta Cloud API notification delivered successfully for ${id}:`, data)
      updateMessageNotificationStatus(id, 'delivered_meta_cloud')
      return { success: true, provider: 'meta_cloud' }
    } catch (err) {
      console.error(`[WhatsApp Service] Meta Cloud API notification failed for ${id}:`, err.message)
      updateMessageNotificationStatus(id, 'failed_meta_cloud', err.message)
      return { success: false, provider: 'meta_cloud', error: err.message }
    }
  }

  // --- Provider 2: Twilio WhatsApp API ---
  const twilioSid = process.env.TWILIO_ACCOUNT_SID
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

  if (twilioSid && twilioAuth) {
    try {
      const cleanTo = recipient.startsWith('whatsapp:')
        ? recipient
        : `whatsapp:${recipient}`
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`

      const params = new URLSearchParams()
      params.append('From', twilioFrom)
      params.append('To', cleanTo)
      params.append('Body', notificationText)

      const basicAuth = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64')

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`)
      }

      console.log(`[WhatsApp Service] Twilio WhatsApp notification delivered for ${id}:`, data.sid)
      updateMessageNotificationStatus(id, 'delivered_twilio')
      return { success: true, provider: 'twilio' }
    } catch (err) {
      console.error(`[WhatsApp Service] Twilio WhatsApp notification failed for ${id}:`, err.message)
      updateMessageNotificationStatus(id, 'failed_twilio', err.message)
      return { success: false, provider: 'twilio', error: err.message }
    }
  }

  // --- Provider 3: CallMeBot Free Personal Gateway ---
  const callmebotKey = process.env.CALLMEBOT_API_KEY
  const callmebotPhone = process.env.CALLMEBOT_PHONE || recipient

  if (callmebotKey) {
    try {
      const cleanPhone = callmebotPhone.replace(/[^0-9]/g, '')
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodeURIComponent(
        notificationText
      )}&apikey=${encodeURIComponent(callmebotKey)}`

      const response = await fetch(url)
      const text = await response.text()

      if (text.includes('Message queued') || text.includes('Success')) {
        console.log(`[WhatsApp Service] CallMeBot notification delivered for ${id}`)
        updateMessageNotificationStatus(id, 'delivered_callmebot')
        return { success: true, provider: 'callmebot' }
      } else {
        throw new Error(text || 'CallMeBot unexpected response')
      }
    } catch (err) {
      console.error(`[WhatsApp Service] CallMeBot delivery failed for ${id}:`, err.message)
      updateMessageNotificationStatus(id, 'failed_callmebot', err.message)
      return { success: false, provider: 'callmebot', error: err.message }
    }
  }

  // --- No Provider Configured ---
  console.log(`[WhatsApp Service] WhatsApp provider not configured in environment variables.
=========================================
[SIMULATED NOTIFICATION PAYLOAD]
Recipient: ${recipient}
${notificationText}
=========================================
Message ${id} is securely stored in persistent messages.json.
To activate live WhatsApp alerts on your phone, configure WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID or CALLMEBOT_API_KEY.`)

  updateMessageNotificationStatus(id, 'not_configured_logged')
  return { success: true, provider: 'logged_to_server', note: 'Credentials pending in env' }
}
