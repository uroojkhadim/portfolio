/**
 * Portfolio Production Server — Express Edition
 * Serves the built frontend, admin panel, and all API routes.
 * Usage: node server.js
 */
import 'dotenv/config'
import express from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import cors from 'cors'

// Initialize DB (creates tables + seeds data on first run)
import './server/db.js'

import contactHandler from './api/contact.js'
import chatHandler from './api/chat.js'
import publicRoutes from './server/routes/public.js'
import authRoutes from './server/routes/auth.js'
import adminRoutes from './server/routes/admin.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const parsedPort = Number.parseInt(process.env.PORT || '', 10)
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3000
const DIST_DIR = path.join(__dirname, 'dist')
// Serverless platforms only allow writes under /tmp; local and Node hosts use ./uploads.
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : process.env.VERCEL
    ? path.join('/tmp', 'portfolio-uploads')
    : path.join(__dirname, 'uploads')

// Ensure uploads directory exists
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
} catch (err) {
  console.warn('[Uploads] Could not create upload directory:', err.message)
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── Static: Uploaded files ───────────────────────────────────────────────────
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '1d' }))

// ─── API Routes ───────────────────────────────────────────────────────────────

// Existing APIs (contact form + chatbot)
app.post('/api/contact', contactHandler)
app.post('/api/chat', chatHandler)

// Health/diagnostic endpoint (no secrets)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'sqlite',
    time: new Date().toISOString(),
  })
})

// CMS API routes
app.use('/api/public', publicRoutes)
app.use('/api/admin', authRoutes)
app.use('/api/admin', adminRoutes)

// Unmatched API routes must return JSON, never the SPA HTML.
// This must stay after the routers above, otherwise it swallows them.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` })
})

// ─── Static: Built frontend ───────────────────────────────────────────────────
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR, { maxAge: '1h', index: false }))

  // Admin SPA — serve admin.html for /admin and /admin/*
  app.get(['/admin', '/admin/*splat'], (req, res) => {
    const adminHtml = path.join(DIST_DIR, 'admin.html')
    if (fs.existsSync(adminHtml)) {
      res.sendFile(adminHtml)
    } else {
      res.status(404).send('Admin panel not built. Run: npm run build')
    }
  })

  // Public SPA root & fallback
  app.get('/', (req, res) => {
    const indexHtml = path.join(DIST_DIR, 'index.html')
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml)
    } else {
      res.status(404).send('Not Found. Run: npm run build')
    }
  })

  app.get('/*splat', (req, res) => {
    const indexHtml = path.join(DIST_DIR, 'index.html')
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml)
    } else {
      res.status(404).send('Not Found. Run: npm run build')
    }
  })
} else {
  app.get('/', (req, res) => {
    res.status(503).send('Site not built. Run: npm run build')
  })
  app.get('/*splat', (req, res) => {
    res.status(503).send('Site not built. Run: npm run build')
  })
}

// ─── Start Server ─────────────────────────────────────────────────────────────
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Portfolio Server] Running at http://localhost:${PORT}`)
    console.log(`[Portfolio Server] Admin panel at http://localhost:${PORT}/admin`)
  })
}

export default app
