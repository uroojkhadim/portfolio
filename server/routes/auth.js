// Admin auth routes
import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { signToken, requireAuth } from '../middleware/auth.js'
import { loginRateLimit, clearLoginAttempts } from '../middleware/rateLimiter.js'

const router = Router()

// POST /api/admin/login
router.post('/login', loginRateLimit, (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const user = db.prepare('SELECT * FROM admin_users WHERE email = ?').get(email.trim().toLowerCase())
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const valid = bcrypt.compareSync(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    // Clear rate limit on success
    const ip = req.ip || '127.0.0.1'
    clearLoginAttempts(ip)

    const token = signToken({ id: user.id, email: user.email, name: user.name })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    console.error('[Auth] Login error:', err)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// GET /api/admin/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.admin })
})

// POST /api/admin/logout (client-side, just confirm)
router.post('/logout', requireAuth, (req, res) => {
  res.json({ success: true })
})

export default router
