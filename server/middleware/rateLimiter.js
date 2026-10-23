// In-memory rate limiter for login attempts
const attempts = new Map()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export function loginRateLimit(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1'
  const now = Date.now()
  const record = attempts.get(ip)

  if (record) {
    // Clean old entries
    record.timestamps = record.timestamps.filter(t => now - t < WINDOW_MS)
    if (record.timestamps.length >= MAX_ATTEMPTS) {
      const retryAfter = Math.ceil((record.timestamps[0] + WINDOW_MS - now) / 1000 / 60)
      return res.status(429).json({
        error: `Too many login attempts. Try again in ${retryAfter} minute(s).`
      })
    }
    record.timestamps.push(now)
  } else {
    attempts.set(ip, { timestamps: [now] })
  }

  next()
}

export function clearLoginAttempts(ip) {
  attempts.delete(ip)
}
