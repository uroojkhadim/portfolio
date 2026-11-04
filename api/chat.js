import { loadPortfolioKnowledge, answerPortfolioQuestion } from '../server/services/portfolioKnowledge.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { message, history = [] } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' })
    }
    if (message.length > 1500) {
      return res.status(400).json({ error: 'Please keep your question under 1500 characters.' })
    }

    // Built fresh from the CMS database on every request, so admin edits are
    // immediately reflected in the assistant's answers.
    let knowledge
    try {
      knowledge = loadPortfolioKnowledge()
    } catch (err) {
      console.error('[Chat API] Could not load portfolio knowledge:', err.message)
      knowledge = null
    }

    if (knowledge?.settings?.chatbot_enabled === '0') {
      return res.status(200).json({
        reply: 'The portfolio assistant is currently disabled. Please contact Urooj directly by email or WhatsApp.',
        provider: 'disabled',
      })
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter(item => item && typeof (item.content || item.text) === 'string')
          .slice(-6)
          .map(item => ({
            role: item.role === 'model' || item.sender === 'bot' ? 'model' : 'user',
            content: String(item.content || item.text).slice(0, 2000),
          }))
      : []

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    if (geminiKey && knowledge) {
      try {
        const contents = safeHistory.map(item => ({
          role: item.role,
          parts: [{ text: item.content }],
        }))
        contents.push({ role: 'user', parts: [{ text: message }] })

        const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`

        const response = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: buildSystemInstruction(knowledge) }],
            },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 900,
            },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const reply = data?.candidates?.[0]?.content?.parts?.map(part => part.text).filter(Boolean).join('')
          if (reply && reply.trim()) {
            return res.status(200).json({ reply: reply.trim(), provider: `gemini:${model}` })
          }
        } else {
          const detail = await response.text().catch(() => '')
          console.warn(`[Chat API] Gemini responded ${response.status}: ${detail.slice(0, 300)}`)
        }
      } catch (geminiError) {
        console.warn('[Chat API] Gemini request failed, using the portfolio knowledge engine:', geminiError.message)
      }
    }

    const reply = answerPortfolioQuestion(message, safeHistory, knowledge || undefined)
    return res.status(200).json({ reply, provider: 'portfolio-knowledge-engine' })
  } catch (error) {
    console.error('[Chat API] Unexpected error:', error)
    return res.status(500).json({
      reply: 'Something went wrong while answering that. Please try again, or contact Urooj at uroojkhadim505@gmail.com.',
    })
  }
}
