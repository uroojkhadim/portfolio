// Admin CRUD routes — all protected by requireAuth
import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadImage, uploadDoc } from '../middleware/upload.js'
import { isEmailConfigured, sendReplyEmail } from '../services/email.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads')

const router = Router()
router.use(requireAuth)

function safeParseJson(str, fallback = []) {
  try { return JSON.parse(str) } catch { return fallback }
}

function safeCount(table, where = '') {
  try {
    const q = where ? `SELECT COUNT(*) as c FROM ${table} WHERE ${where}` : `SELECT COUNT(*) as c FROM ${table}`
    return db.prepare(q).get()?.c || 0
  } catch {
    return 0
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const stats = {
      total_projects: safeCount('projects'),
      published_projects: safeCount('projects', 'published=1'),
      total_skills: safeCount('skills'),
      total_experience: safeCount('experience'),
      total_education: safeCount('education'),
      total_documents: safeCount('documents'),
      published_documents: safeCount('documents', 'published=1'),
      total_certificates: safeCount('certificates'),
      unpublished_projects: safeCount('projects', 'published=0'),
      total_messages: safeCount('contact_messages'),
      unread_messages: safeCount('contact_messages', "status='unread'"),
    }
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY category, display_order ASC').all()
  res.json(rows.map(r => ({ ...r, technologies: safeParseJson(r.technologies) })))
})

router.post('/projects', (req, res) => {
  try {
    const { slug, title, description, category, image, alt_text, live_url, github_url, technologies, featured, display_order, published } = req.body
    if (!title || !category) return res.status(400).json({ error: 'Title and category are required.' })
    const safeSlug = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const stmt = db.prepare(`INSERT INTO projects (slug, title, description, category, image, alt_text, live_url, github_url, technologies, featured, display_order, published, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
    const r = stmt.run(safeSlug, title, description || null, category, image || null, alt_text || null, live_url || null, github_url || null, JSON.stringify(technologies || []), featured ? 1 : 0, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
    res.json({ id: r.lastInsertRowid, message: 'Project created.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/projects/:id', (req, res) => {
  try {
    const { title, description, category, image, alt_text, live_url, github_url, technologies, featured, display_order, published } = req.body
    db.prepare(`UPDATE projects SET title=?, description=?, category=?, image=?, alt_text=?, live_url=?, github_url=?, technologies=?, featured=?, display_order=?, published=?, updated_at=datetime('now') WHERE id=?`)
      .run(title, description || null, category, image || null, alt_text || null, live_url || null, github_url || null, JSON.stringify(technologies || []), featured ? 1 : 0, display_order || 0, published ? 1 : 0, req.params.id)
    res.json({ message: 'Project updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/projects/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
    res.json({ message: 'Project deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/projects/:id/upload-image', (req, res) => {
  req.uploadSubdir = 'projects'
  uploadImage.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const url = `/uploads/projects/${req.file.filename}`
    res.json({ url })
  })
})

// ─── Skill Categories ─────────────────────────────────────────────────────────
router.get('/skill-categories', (req, res) => {
  res.json(db.prepare('SELECT * FROM skill_categories ORDER BY display_order ASC').all())
})

router.post('/skill-categories', (req, res) => {
  try {
    const { category_key, title, description, gradient, icon_name, display_order } = req.body
    if (!title) return res.status(400).json({ error: 'Title is required.' })
    const key = category_key || title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const r = db.prepare('INSERT INTO skill_categories (category_key, title, description, gradient, icon_name, display_order) VALUES (?, ?, ?, ?, ?, ?)').run(key, title, description || null, gradient || 'from-indigo-500 to-violet-600', icon_name || 'Code2', display_order || 0)
    res.json({ id: r.lastInsertRowid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/skill-categories/:id', (req, res) => {
  const { title, description, gradient, icon_name, display_order, published } = req.body
  db.prepare('UPDATE skill_categories SET title=?, description=?, gradient=?, icon_name=?, display_order=?, published=? WHERE id=?').run(title, description || null, gradient, icon_name, display_order || 0, published ? 1 : 0, req.params.id)
  res.json({ message: 'Category updated.' })
})

router.delete('/skill-categories/:id', (req, res) => {
  db.prepare('DELETE FROM skill_categories WHERE id=?').run(req.params.id)
  res.json({ message: 'Category deleted.' })
})

// ─── Skills ──────────────────────────────────────────────────────────────────
router.get('/skills', (req, res) => {
  const cats = db.prepare('SELECT * FROM skill_categories ORDER BY display_order ASC').all()
  const skills = db.prepare('SELECT * FROM skills ORDER BY display_order ASC').all()
  res.json({ categories: cats, skills })
})

router.post('/skills', (req, res) => {
  try {
    const { category_id, name, tag, highlight, display_order, published } = req.body
    if (!name) return res.status(400).json({ error: 'Name is required.' })
    const r = db.prepare('INSERT INTO skills (category_id, name, tag, highlight, display_order, published) VALUES (?, ?, ?, ?, ?, ?)').run(category_id || null, name, tag || null, highlight ? 1 : 0, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
    res.json({ id: r.lastInsertRowid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/skills/:id', (req, res) => {
  const { category_id, name, tag, highlight, display_order, published } = req.body
  db.prepare('UPDATE skills SET category_id=?, name=?, tag=?, highlight=?, display_order=?, published=? WHERE id=?').run(category_id || null, name, tag || null, highlight ? 1 : 0, display_order || 0, published ? 1 : 0, req.params.id)
  res.json({ message: 'Skill updated.' })
})

router.delete('/skills/:id', (req, res) => {
  db.prepare('DELETE FROM skills WHERE id=?').run(req.params.id)
  res.json({ message: 'Skill deleted.' })
})

// ─── Experience ───────────────────────────────────────────────────────────────
router.get('/experience', (req, res) => {
  const rows = db.prepare('SELECT * FROM experience ORDER BY display_order ASC').all()
  res.json(rows.map(r => ({ ...r, skills: safeParseJson(r.skills_list) })))
})

router.post('/experience', (req, res) => {
  try {
    const { company, role, location, type, start_date, end_date, is_current, description, skills, featured, display_order, published } = req.body
    if (!company || !role) return res.status(400).json({ error: 'Company and role are required.' })
    const r = db.prepare('INSERT INTO experience (company, role, location, type, start_date, end_date, is_current, description, skills_list, featured, display_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company, role, location || null, type || 'Professional Experience', start_date || null, end_date || null, is_current ? 1 : 0, description || null, JSON.stringify(skills || []), featured ? 1 : 0, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
    res.json({ id: r.lastInsertRowid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/experience/:id', (req, res) => {
  const { company, role, location, type, start_date, end_date, is_current, description, skills, featured, display_order, published } = req.body
  db.prepare('UPDATE experience SET company=?, role=?, location=?, type=?, start_date=?, end_date=?, is_current=?, description=?, skills_list=?, featured=?, display_order=?, published=? WHERE id=?').run(company, role, location || null, type, start_date || null, end_date || null, is_current ? 1 : 0, description || null, JSON.stringify(skills || []), featured ? 1 : 0, display_order || 0, published ? 1 : 0, req.params.id)
  res.json({ message: 'Experience updated.' })
})

router.delete('/experience/:id', (req, res) => {
  db.prepare('DELETE FROM experience WHERE id=?').run(req.params.id)
  res.json({ message: 'Experience deleted.' })
})

router.post('/experience/:id/upload-certificate', (req, res) => {
  req.uploadSubdir = 'certificates'
  uploadDoc.single('certificate')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const url = `/uploads/certificates/${req.file.filename}`
    const ext = path.extname(req.file.filename).toLowerCase()
    const certType = ext === '.pdf' ? 'pdf' : 'image'
    db.prepare('UPDATE experience SET certificate_url=?, certificate_type=? WHERE id=?').run(url, certType, req.params.id)
    res.json({ url, certType })
  })
})

// ─── Education ────────────────────────────────────────────────────────────────
router.get('/education', (req, res) => {
  res.json(db.prepare('SELECT * FROM education ORDER BY display_order ASC').all())
})

router.post('/education', (req, res) => {
  try {
    const { institution, degree, field_of_study, start_date, end_date, is_current, cgpa, description, status_label, display_order, published } = req.body
    if (!institution || !degree) return res.status(400).json({ error: 'Institution and degree are required.' })
    const r = db.prepare('INSERT INTO education (institution, degree, field_of_study, start_date, end_date, is_current, cgpa, description, status_label, display_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(institution, degree, field_of_study || null, start_date || null, end_date || null, is_current ? 1 : 0, cgpa || null, description || null, status_label || null, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
    res.json({ id: r.lastInsertRowid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/education/:id', (req, res) => {
  const { institution, degree, field_of_study, start_date, end_date, is_current, cgpa, description, status_label, display_order, published } = req.body
  db.prepare('UPDATE education SET institution=?, degree=?, field_of_study=?, start_date=?, end_date=?, is_current=?, cgpa=?, description=?, status_label=?, display_order=?, published=? WHERE id=?').run(institution, degree, field_of_study || null, start_date || null, end_date || null, is_current ? 1 : 0, cgpa || null, description || null, status_label || null, display_order || 0, published ? 1 : 0, req.params.id)
  res.json({ message: 'Education updated.' })
})

router.delete('/education/:id', (req, res) => {
  db.prepare('DELETE FROM education WHERE id=?').run(req.params.id)
  res.json({ message: 'Education deleted.' })
})

// ─── Documents ────────────────────────────────────────────────────────────────
router.get('/documents', (req, res) => {
  res.json(db.prepare('SELECT * FROM documents ORDER BY display_order ASC').all())
})

router.post('/documents', (req, res) => {
  req.uploadSubdir = 'documents'
  uploadDoc.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    try {
      const { title, description, category, version, display_order, published } = req.body
      if (!title) return res.status(400).json({ error: 'Title is required.' })
      const filePath = req.file ? `/uploads/documents/${req.file.filename}` : (req.body.file_path || null)
      const filename = req.file ? req.file.originalname : (req.body.filename || null)
      const r = db.prepare('INSERT INTO documents (title, description, category, version, file_path, filename, display_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(title, description || null, category || 'cv', version || null, filePath, filename, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
      res.json({ id: r.lastInsertRowid, file_path: filePath })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
})

router.put('/documents/:id', (req, res) => {
  req.uploadSubdir = 'documents'
  uploadDoc.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    try {
      const { title, description, category, version, display_order, published } = req.body
      const existing = db.prepare('SELECT * FROM documents WHERE id=?').get(req.params.id)
      if (!existing) return res.status(404).json({ error: 'Document not found.' })
      const filePath = req.file ? `/uploads/documents/${req.file.filename}` : existing.file_path
      const filename = req.file ? req.file.originalname : existing.filename
      db.prepare(`UPDATE documents SET title=?, description=?, category=?, version=?, file_path=?, filename=?, display_order=?, published=?, updated_at=datetime('now') WHERE id=?`).run(title || existing.title, description ?? existing.description, category || existing.category, version || existing.version, filePath, filename, display_order ?? existing.display_order, published !== undefined ? (published ? 1 : 0) : existing.published, req.params.id)
      res.json({ message: 'Document updated.', file_path: filePath })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
})

router.delete('/documents/:id', (req, res) => {
  try {
    const doc = db.prepare('SELECT * FROM documents WHERE id=?').get(req.params.id)
    if (doc?.file_path?.startsWith('/uploads/')) {
      const fullPath = path.join(UPLOADS_DIR, doc.file_path.replace('/uploads/', ''))
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    }
    db.prepare('DELETE FROM documents WHERE id=?').run(req.params.id)
    res.json({ message: 'Document deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Certificates ─────────────────────────────────────────────────────────────
router.get('/certificates', (req, res) => {
  res.json(db.prepare('SELECT * FROM certificates ORDER BY display_order ASC').all())
})

router.post('/certificates', (req, res) => {
  req.uploadSubdir = 'certificates'
  uploadDoc.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    try {
      const { title, issuer, issue_date, credential_url, description, display_order, published } = req.body
      if (!title) return res.status(400).json({ error: 'Title is required.' })
      const imageUrl = req.file ? `/uploads/certificates/${req.file.filename}` : (req.body.image_url || null)
      const r = db.prepare('INSERT INTO certificates (title, issuer, issue_date, credential_url, description, image_url, display_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(title, issuer || null, issue_date || null, credential_url || null, description || null, imageUrl, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
      res.json({ id: r.lastInsertRowid })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
})

router.put('/certificates/:id', (req, res) => {
  req.uploadSubdir = 'certificates'
  uploadDoc.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    try {
      const { title, issuer, issue_date, credential_url, description, display_order, published } = req.body
      const existing = db.prepare('SELECT * FROM certificates WHERE id=?').get(req.params.id)
      const imageUrl = req.file ? `/uploads/certificates/${req.file.filename}` : (req.body.image_url || existing?.image_url || null)
      db.prepare('UPDATE certificates SET title=?, issuer=?, issue_date=?, credential_url=?, description=?, image_url=?, display_order=?, published=? WHERE id=?').run(title, issuer || null, issue_date || null, credential_url || null, description || null, imageUrl, display_order || 0, published ? 1 : 0, req.params.id)
      res.json({ message: 'Certificate updated.' })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
})

router.delete('/certificates/:id', (req, res) => {
  db.prepare('DELETE FROM certificates WHERE id=?').run(req.params.id)
  res.json({ message: 'Certificate deleted.' })
})

// ─── About Content ────────────────────────────────────────────────────────────
router.get('/about', (req, res) => {
  res.json(db.prepare('SELECT * FROM about_content LIMIT 1').get() || {})
})

router.put('/about', (req, res) => {
  req.uploadSubdir = 'profile'
  uploadImage.single('profile_image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    try {
      const existing = db.prepare('SELECT * FROM about_content LIMIT 1').get()
      const body = req.body
      const profileImage = req.file ? `/uploads/profile/${req.file.filename}` : (body.profile_image || existing?.profile_image || '/profile.png')
      if (existing) {
        db.prepare(`UPDATE about_content SET name=?, title=?, role=?, bio=?, hero_heading=?, hero_description=?, availability_status=?, availability_active=?, profile_image=?, university=?, degree=?, location=?, updated_at=datetime('now') WHERE id=?`).run(
          body.name || existing.name, body.title || existing.title, body.role || existing.role, body.bio || existing.bio,
          body.hero_heading || existing.hero_heading, body.hero_description || existing.hero_description,
          body.availability_status || existing.availability_status, body.availability_active !== undefined ? (body.availability_active ? 1 : 0) : existing.availability_active,
          profileImage, body.university || existing.university, body.degree || existing.degree, body.location || existing.location, existing.id
        )
      } else {
        db.prepare('INSERT INTO about_content (name, title, role, bio, hero_heading, hero_description, availability_status, availability_active, profile_image, university, degree, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(body.name, body.title, body.role, body.bio, body.hero_heading, body.hero_description, body.availability_status, body.availability_active ? 1 : 0, profileImage, body.university, body.degree, body.location)
      }
      res.json({ message: 'About content updated.', profile_image: profileImage })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
})

// ─── Contact Info ─────────────────────────────────────────────────────────────
router.get('/contact', (req, res) => {
  res.json(db.prepare('SELECT * FROM contact_info ORDER BY display_order ASC').all())
})

router.put('/contact', (req, res) => {
  try {
    const items = req.body
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array of contact items.' })
    const stmt = db.prepare('UPDATE contact_info SET label=?, value=?, href=?, visible=? WHERE key=?')
    items.forEach(item => {
      stmt.run(item.label, item.value, item.href || null, item.visible ? 1 : 0, item.key)
    })
    res.json({ message: 'Contact info updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Site Settings ────────────────────────────────────────────────────────────
router.get('/settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_settings').all()
  const obj = {}
  rows.forEach(r => { obj[r.key] = r.value })
  res.json(obj)
})

router.put('/settings', (req, res) => {
  try {
    const settings = req.body
    const upsert = db.prepare(`INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`)
    Object.entries(settings).forEach(([key, value]) => upsert.run(key, String(value ?? '')))
    res.json({ message: 'Settings updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Contact Messages (Inbox) ─────────────────────────────────────────────────

// GET /api/admin/messages — list all messages, newest first
router.get('/messages', (req, res) => {
  try {
    const { status } = req.query
    let query = 'SELECT * FROM contact_messages'
    const params = []
    if (status && ['unread', 'read', 'replied', 'archived'].includes(status)) {
      query += ' WHERE status = ?'
      params.push(status)
    }
    query += ' ORDER BY created_at DESC'
    const messages = db.prepare(query).all(...params)
    const unreadCount = db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status='unread'").get().c
    res.json({ messages, unreadCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/messages/stats — counts per status
router.get('/messages/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as c FROM contact_messages').get().c
    const unread = db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status='unread'").get().c
    const read = db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status='read'").get().c
    const replied = db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status='replied'").get().c
    const archived = db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE status='archived'").get().c
    res.json({ total, unread, read, replied, archived })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/messages/:id — fetch single message and mark as read
router.get('/messages/:id', (req, res) => {
  try {
    const msg = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id)
    if (!msg) return res.status(404).json({ error: 'Message not found.' })
    // Auto-mark as read when opened
    if (msg.status === 'unread') {
      db.prepare("UPDATE contact_messages SET status='read' WHERE id=?").run(req.params.id)
      msg.status = 'read'
    }
    res.json(msg)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/admin/messages/:id/status — update status
router.patch('/messages/:id/status', (req, res) => {
  try {
    const { status } = req.body
    const valid = ['unread', 'read', 'replied', 'archived']
    if (!valid.includes(status)) return res.status(400).json({ error: `Status must be one of: ${valid.join(', ')}` })
    const extra = {}
    if (status === 'replied') extra.replied_at = new Date().toISOString()
    if (status === 'archived') extra.archived_at = new Date().toISOString()
    const extraCols = Object.keys(extra).map(k => `${k}=?`).join(', ')
    const extraVals = Object.values(extra)
    const sql = extraCols
      ? `UPDATE contact_messages SET status=?, ${extraCols} WHERE id=?`
      : `UPDATE contact_messages SET status=? WHERE id=?`
    db.prepare(sql).run(status, ...extraVals, req.params.id)
    res.json({ message: `Status updated to '${status}'.` })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/admin/messages/email-status — check if email service is configured
router.get('/messages-email-status', (req, res) => {
  res.json({ configured: isEmailConfigured() })
})

// POST /api/admin/messages/:id/reply — send reply via configured SMTP
router.post('/messages/:id/reply', async (req, res) => {
  try {
    const { replyBody } = req.body
    if (!replyBody || !replyBody.trim()) {
      return res.status(400).json({ error: 'Reply message cannot be empty.' })
    }

    const msg = db.prepare('SELECT * FROM contact_messages WHERE id=?').get(req.params.id)
    if (!msg) return res.status(404).json({ error: 'Message not found.' })

    // Send email using real SMTP
    const result = await sendReplyEmail({
      to: msg.email,
      subject: msg.subject,
      replyBody: replyBody.trim(),
    })

    // Only mark replied if sending succeeded
    const repliedAt = new Date().toISOString()
    db.prepare("UPDATE contact_messages SET status='replied', replied_at=? WHERE id=?").run(repliedAt, req.params.id)

    res.json({
      success: true,
      message: `Reply sent successfully to ${msg.email}`,
      repliedAt,
      messageId: result.messageId,
    })
  } catch (err) {
    console.error('[Admin API] Reply failed:', err.message)
    res.status(500).json({ error: err.message || 'Failed to send reply email.' })
  }
})

// DELETE /api/admin/messages/:id — permanently delete
router.delete('/messages/:id', (req, res) => {
  try {
    const msg = db.prepare('SELECT id FROM contact_messages WHERE id=?').get(req.params.id)
    if (!msg) return res.status(404).json({ error: 'Message not found.' })
    db.prepare('DELETE FROM contact_messages WHERE id=?').run(req.params.id)
    res.json({ message: 'Message deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
