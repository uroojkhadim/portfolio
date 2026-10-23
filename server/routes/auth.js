// Admin auth routes
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { authenticateAdmin } from '../services/authService.js'

const router = Router()

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1'

    const result = await authenticateAdmin({ email, password, clientIp })
    if (result.status !== 200) {
      return res.status(result.status).json({ error: result.error })
    }

    res.json(result.data)
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
