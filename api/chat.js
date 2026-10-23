import { VERIFIED_PORTFOLIO_FACTS, getKnowledgeBaseAnswer } from '../src/data/chatbotKnowledge.js'

const SYSTEM_INSTRUCTION = `You are the official Personal AI Assistant for Urooj Khadim's developer portfolio.
Your role is to answer questions from recruiters, clients, and visitors warmly, concisely, and accurately based strictly on Urooj's verified portfolio information.

CORE VERIFIED FACTS ABOUT UROOJ KHADIM:
- Identity: Software Engineering student at COMSATS University Islamabad (Vehari Campus) and a Full Stack Web & Mobile Developer.
- Location: Vehari, Pakistan. Open to remote work, internships, and freelance projects.
- Education: Bachelor of Software Engineering (BS SE), Currently Enrolled. Key coursework: Object-Oriented Programming, Data Structures, Mobile App Development, Web Development, Software Quality Engineering, Databases.
- Contact: Email: uroojkhadim505@gmail.com | Phone: 0313-6576128 | GitHub: github.com/uroojkhadim | LinkedIn: linkedin.com/in/urooj-khadim-26a334364 | Resume path: /cv/Urooj_Khadim_CV.pdf
- Technical Skills:
  * Programming: Python, Java, C++, Dart, Kotlin, JavaScript (ES6+)
  * Web & Full-Stack: HTML5, CSS3, JavaScript, React, Laravel, Node.js, RESTful APIs
  * Mobile: Flutter, Dart, Android Development, Kotlin, Android XML
  * Databases: MySQL, MongoDB, SQLite, Supabase, Firebase
  * AI / ML: Python-based Machine Learning, scikit-learn, data preprocessing, model training, predictive analytics
  * Tools: Git, GitHub, VS Code, Android Studio, Cursor, Dev C++, Vercel, Netlify
- Flutter / Mobile Projects:
  1. Predictive Healthcare & Recommendation System (health vital predictions & recommendations using ML)
  2. Task Management Mobile App (productivity & offline task tracking)
  3. Musify App (music audio player and playlist management)
  4. WeMuslim App (prayer times & digital Tasbeeh counter)
  5. POS Coffee Shop Inventory Management System (point-of-sale and cafe inventory tracking)
- Web Projects with Live Demos:
  1. CUI Plagiarism Portal: https://cui-plagiarism-portal-frontend.vercel.app/
  2. FlickCom ISP Website: https://flickcom-isp.vercel.app/
  3. Cafeteria Management System: https://cafeteria-management-main.firebaseapp.com
  4. Quiz Website: https://quiz-website-blush-xi.vercel.app/
  5. Healthcare Website: https://healthcare-website-gold.vercel.app/
- Experience & Internships: Currently a dedicated BS Software Engineering student seeking internships and remote software development roles. Verified projects include the CUI Plagiarism Portal for library administration. Certificates can be viewed in the Experience section.

RULES:
1. Provide concise, direct, helpful answers.
2. Link to relevant portfolio sections (e.g., [About Me](#about), [Skills](#skills), [Projects](#projects), [Experience](#experience), [Resume](#resume), [Contact](#contact)) or actual project live demo links where appropriate.
3. NEVER invent companies, dates, qualifications, certificates, contact details, or achievements.
4. If asked about something not in the knowledge base, politely state that the information is not available and recommend contacting Urooj directly.`

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

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

    // If Gemini API Key is available, use Gemini 1.5 Flash
    if (geminiKey) {
      try {
        const contents = []

        // Convert history
        for (const item of history.slice(-4)) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.content || item.text || '' }],
          })
        }

        // Add current user prompt
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        })

        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`

        const response = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 600,
            },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (reply) {
            return res.status(200).json({ reply, provider: 'gemini-1.5-flash' })
          }
        } else {
          console.warn('[Chat API] Gemini API responded with status:', response.status)
        }
      } catch (geminiError) {
        console.warn('[Chat API] Error calling Gemini API:', geminiError.message)
      }
    }

    // High-fidelity Knowledge-Base Engine fallback (guaranteed response)
    const fallbackReply = getKnowledgeBaseAnswer(message, history)
    return res.status(200).json({ reply: fallbackReply, provider: 'knowledge-base-engine' })
  } catch (error) {
    console.error('[Chat API] Unexpected Error:', error)
    return res.status(500).json({
      reply: 'An error occurred while processing your question. Please try again or contact Urooj at uroojkhadim505@gmail.com.',
    })
  }
}
