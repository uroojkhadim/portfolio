// Auth middleware — verifies JWT Bearer token
import jwt from 'jsonwebtoken'

const MIN_JWT_SECRET_LENGTH = 32

export function isAuthConfigured() {
  return typeof process.env.JWT_SECRET === 'string'
    && process.env.JWT_SECRET.length >= MIN_JWT_SECRET_LENGTH
}

export function requireAuth(req, res, next) {
  if (!isAuthConfigured()) {
    return res.status(503).json({ error: 'Admin authentication is not configured.' })
  }

  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' })
  }
  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin permission is required.' })
    }
    req.admin = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' })
  }
}

export function signToken(payload) {
  if (!isAuthConfigured()) {
    throw new Error('Admin authentication is not configured.')
  }
  return jwt.sign({ ...payload, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' })
}
