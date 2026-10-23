// In-memory rate limiter for login attempts
export const attempts = new Map()

export const MAX_ATTEMPTS = 5
export const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export function checkRateLimit(ip) {
  const now = Date.now()
  const record = attempts.get(ip)
  if (record) {
    record.timestamps = record.timestamps.filter(t => now - t < WINDOW_MS)
    if (record.timestamps.length >= MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((record.timestamps[0] + WINDOW_MS - now) / 1000 / 60)
      return { allowed: false, retryAfter }
    }
  }
  return { allowed: true }
}

export function recordAttempt(ip) {
  const now = Date.now()
  const record = attempts.get(ip)
  if (record) {
    record.timestamps.push(now)
  } else {
    attempts.set(ip, { timestamps: [now] })
  }
}

export function loginRateLimit(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1'
  const check = checkRateLimit(ip)
  if (!check.allowed) {
    return res.status(429).json({
      error: `Too many login attempts. Try again in ${check.retryAfter} minute(s).`
    })
  }
  recordAttempt(ip)
  next()
}

export function clearLoginAttempts(ip) {
  attempts.delete(ip)
}
