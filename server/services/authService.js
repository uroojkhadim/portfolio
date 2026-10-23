import bcrypt from 'bcryptjs'
import db from '../db.js'
import { signToken } from '../middleware/auth.js'
import { checkRateLimit, recordAttempt, clearLoginAttempts } from '../middleware/rateLimiter.js'

/**
 * Validates admin login credentials against SQLite database and/or configured environment variables.
 * Enforces rate limiting (max 5 attempts per 15 minutes per IP).
 */
export async function authenticateAdmin({ email, password, clientIp = '127.0.0.1' }) {
  if (!email || !password) {
    return { status: 400, error: 'Email and password are required.' }
  }

  const cleanEmail = email.trim().toLowerCase()

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(clientIp)
  if (!rateLimit.allowed) {
    return {
      status: 429,
      error: `Too many login attempts. Try again in ${rateLimit.retryAfter} minute(s).`
    }
  }

  // Record this attempt against the IP
  recordAttempt(clientIp)

  // 2. Check Database if available
  let user = null
  try {
    if (db && typeof db.prepare === 'function') {
      user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(cleanEmail)
    }
  } catch (err) {
    console.warn('[Auth Service] Database lookup notice:', err.message)
  }

  // 3. If user is in database, verify password hash
  if (user && user.password_hash) {
    const valid = bcrypt.compareSync(password, user.password_hash)
    if (valid) {
      clearLoginAttempts(clientIp)
      const token = signToken({ id: user.id, email: user.email, name: user.name })
      return {
        status: 200,
        data: { token, user: { id: user.id, email: user.email, name: user.name } }
      }
    }
    return { status: 401, error: 'Invalid email or password.' }
  }

  // 4. Fallback verification against server-side configured admin credentials (e.g. on serverless/Vercel)
  const configuredEmail = (process.env.ADMIN_EMAIL || 'uroojkhadim505@gmail.com').trim().toLowerCase()
  if (cleanEmail === configuredEmail) {
    const configuredHash = process.env.ADMIN_PASSWORD_HASH
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'khadim123'

    let valid = false
    if (configuredHash) {
      valid = bcrypt.compareSync(password, configuredHash)
    } else {
      valid = password === defaultPassword || bcrypt.compareSync(password, bcrypt.hashSync(defaultPassword, 10))
    }

    if (valid) {
      clearLoginAttempts(clientIp)
      const token = signToken({ id: 1, email: configuredEmail, name: 'Urooj Khadim' })
      return {
        status: 200,
        data: { token, user: { id: 1, email: configuredEmail, name: 'Urooj Khadim' } }
      }
    }
  }

  return { status: 401, error: 'Invalid email or password.' }
}
