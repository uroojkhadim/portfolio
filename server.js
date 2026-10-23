/**
 * Portfolio Production Server — Express Edition
 * Serves the built frontend, admin panel, and all API routes.
 * Usage: node server.js
 */
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
const PORT = process.env.PORT || 3000
const DIST_DIR = path.join(__dirname, 'dist')
const UPLOADS_DIR = path.join(__dirname, 'uploads')

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── Static: Uploaded files ───────────────────────────────────────────────────
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '1d' }))

// ─── API Routes ───────────────────────────────────────────────────────────────

// Existing APIs (contact form + chatbot)
app.post('/api/contact', async (req, res) => {
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return res }
  return contactHandler(req, res)
})

app.post('/api/chat', async (req, res) => {
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return res }
  return chatHandler(req, res)
})

// CMS API routes
app.use('/api/public', publicRoutes)
app.use('/api/admin', authRoutes)
app.use('/api/admin', adminRoutes)

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
app.listen(PORT, () => {
  console.log(`[Portfolio Server] Running at http://localhost:${PORT}`)
  console.log(`[Portfolio Server] Admin panel at http://localhost:${PORT}/admin`)
})
