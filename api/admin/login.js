import { authenticateAdmin } from '../../server/services/authService.js'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} not allowed` })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const { email, password } = body

    const clientIp =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.socket?.remoteAddress ||
      '127.0.0.1'

    const result = await authenticateAdmin({
      email,
      password,
      clientIp: String(clientIp).split(',')[0].trim(),
    })

    if (result.status !== 200) {
      return res.status(result.status).json({ error: result.error })
    }

    return res.status(200).json(result.data)
  } catch (error) {
    console.error('[API /api/admin/login] Internal Error:', error)
    return res.status(500).json({ error: 'Internal server error during login.' })
  }
}
