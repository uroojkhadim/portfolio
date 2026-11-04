// Admin CRUD routes — all protected by requireAuth
import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import db from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadImage, uploadDoc } from '../middleware/upload.js'
import { isEmailConfigured, getEmailServiceInfo, sendReplyEmail } from '../services/email.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : process.env.VERCEL
    ? path.join('/tmp', 'portfolio-uploads')
    : path.join(__dirname, '..', '..', 'uploads')

const router = Router()
router.use(requireAuth)

function safeParseJson(str, fallback = []) {
  try { return JSON.parse(str) } catch { return fallback }
}

function countRows(table, where = '') {
  const query = where
    ? `SELECT COUNT(*) as count FROM ${table} WHERE ${where}`
    : `SELECT COUNT(*) as count FROM ${table}`
  return db.prepare(query).get().count
}

function getDashboardStats(segment = 'all') {
  const projectFilter = segment === 'all' ? '' : `show_in_${segment}=1`
  const whereProjects = (condition) => [projectFilter, condition].filter(Boolean).join(' AND ')
  const totalProjects = countRows('projects', projectFilter)
  const publishedProjects = countRows('projects', whereProjects('published=1'))

  return {
    total_projects: totalProjects,
    published_projects: publishedProjects,
    total_skills: countRows('skills'),
    total_experience: countRows('experience'),
    total_education: countRows('education'),
    total_documents: countRows('documents'),
    published_documents: countRows('documents', 'published=1'),
    total_certificates: countRows('certificates'),
    total_services: countRows('services'),
    total_chatbot_entries: countRows('chatbot_knowledge'),
    unpublished_projects: totalProjects - publishedProjects,
    total_messages: countRows('contact_messages'),
    unread_messages: countRows('contact_messages', "status='unread'"),
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    res.json(getDashboardStats())
  } catch (err) {
    console.error('[Admin API] Dashboard stats failed:', err)
    res.status(500).json({ error: 'Failed to load dashboard statistics.' })
  }
})

router.get('/stats/:segment', (req, res) => {
  const segment = String(req.params.segment || '').toLowerCase()
  if (!['career', 'freelance'].includes(segment)) {
    return res.status(400).json({ error: 'segment must be either career or freelance.' })
  }

  try {
    res.json(getDashboardStats(segment))
  } catch (err) {
    console.error(`[Admin API] ${segment} dashboard stats failed:`, err)
    res.status(500).json({ error: 'Failed to load dashboard statistics.' })
  }
})

// ─── Projects (career + freelance visibility) ──────────────────────────────────────────────
router.get('/projects', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY category, display_order ASC').all()
  res.json(rows.map(r => ({ ...r, technologies: safeParseJson(r.technologies) })))
})

// Segment-filtered projects for the admin CMS and the route-aware chatbot.
// /api/admin/projects?segment=career  -> career fields only
// /api/admin/projects?segment=freelance -> freelance fields only
// /api/admin/projects (default) -> every project, for the full-grid editor
router.get('/projects/segment', (req, res) => {
  try {
    const segment = String(req.query.segment || 'both').toLowerCase()
    const valid = ['career', 'freelance', 'both']
    if (!valid.includes(segment)) return res.status(400).json({ error: 'segment must be one of: ' + valid.join(', ') })
    const rows = db.prepare('SELECT * FROM projects ORDER BY category, display_order ASC').all()
    const filtered = rows.filter(p => {
      if (segment === 'career') return p.show_in_career === 1
      if (segment === 'freelance') return p.show_in_freelance === 1
      return true
    })
    res.json(filtered.map(r => ({ ...r, technologies: safeParseJson(r.technologies) })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/projects', (req, res) => {
  try {
    const { slug, title, description, category, image, alt_text, live_url, github_url, technologies, featured, display_order, published, show_in_career, show_in_freelance } = req.body
    if (!title || !category) return res.status(400).json({ error: 'Title and category are required.' })
    const safeSlug = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const showInCareer = (show_in_career === undefined ? 1 : Number(show_in_career) || 0)
    const showInFreelance = (show_in_freelance === undefined ? 0 : Number(show_in_freelance) || 0)
    const stmt = db.prepare(`INSERT INTO projects (slug, title, description, category, image, alt_text, live_url, github_url, technologies, featured, display_order, published, show_in_career, show_in_freelance, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
    const r = stmt.run(safeSlug, title, description || null, category, image || null, alt_text || null, live_url || null, github_url || null, JSON.stringify(technologies || []), featured ? 1 : 0, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1, showInCareer, showInFreelance)
    res.json({ id: r.lastInsertRowid, message: 'Project created.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/projects/:id', (req, res) => {
  try {
    const { title, description, category, image, alt_text, live_url, github_url, technologies, featured, display_order, published, show_in_career, show_in_freelance } = req.body
    if (!title || !category) return res.status(400).json({ error: 'Title and category are required.' })
    const showInCareer = (show_in_career === undefined ? 1 : Number(show_in_career) || 0)
    const showInFreelance = (show_in_freelance === undefined ? 0 : Number(show_in_freelance) || 0)
    const result = db.prepare(`UPDATE projects SET title=?, description=?, category=?, image=?, alt_text=?, live_url=?, github_url=?, technologies=?, featured=?, display_order=?, published=?, show_in_career=?, show_in_freelance=?, updated_at=datetime('now') WHERE id=?`).run(
      title, description || null, category, image || null, alt_text || null, live_url || null, github_url || null, JSON.stringify(technologies || []), featured ? 1 : 0, display_order || 0, published ? 1 : 0, showInCareer, showInFreelance, req.params.id
    )
    if (!result.changes) return res.status(404).json({ error: 'Project not found.' })
    res.json({ message: 'Project updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/projects/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Project not found.' })
    res.json({ message: 'Project deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Server-side route-switch guard for upload-image. The admin panel carries
// one upload route for both portfolios; the folder whitelist tells the
// server which audience the file belongs to.
router.post('/projects/:id/upload-image', (req, res) => {
  const segment = String(req.body?.segment || req.query.segment || '').toLowerCase()
  const allowed = new Set(['career', 'freelance', 'projects', 'profile', 'certificates', 'documents', 'logos', 'services', 'misc'])
  if (!allowed.has(segment)) return res.status(400).json({ error: 'Invalid segment. Allowed: career, freelance, projects, profile, certificates, documents, logos, services, misc.' })
  req.uploadSubdir = segment === 'freelance' ? 'projects' : segment
  uploadImage.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const folder = segment === 'freelance' ? 'projects' : segment
    const url = `/uploads/${folder}/${req.file.filename}`
    res.json({ url, segment })
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
    const { company, role, location, type, start_date, end_date, is_current, description, responsibilities, skills, certificate_url, certificate_type, company_logo, featured, display_order, published } = req.body
    if (!company || !role) return res.status(400).json({ error: 'Company and role are required.' })
    const r = db.prepare('INSERT INTO experience (company, role, location, type, start_date, end_date, is_current, description, responsibilities, skills_list, certificate_url, certificate_type, company_logo, featured, display_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(company, role, location || null, type || 'Professional Experience', start_date || null, end_date || null, is_current ? 1 : 0, description || null, responsibilities || null, JSON.stringify(skills || []), certificate_url || null, certificate_type || 'pdf', company_logo || null, featured ? 1 : 0, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
    res.json({ id: r.lastInsertRowid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/experience/:id', (req, res) => {
  const { company, role, location, type, start_date, end_date, is_current, description, responsibilities, skills, certificate_url, certificate_type, company_logo, featured, display_order, published } = req.body
  db.prepare('UPDATE experience SET company=?, role=?, location=?, type=?, start_date=?, end_date=?, is_current=?, description=?, responsibilities=?, skills_list=?, certificate_url=?, certificate_type=?, company_logo=?, featured=?, display_order=?, published=? WHERE id=?').run(company, role, location || null, type, start_date || null, end_date || null, is_current ? 1 : 0, description || null, responsibilities || null, JSON.stringify(skills || []), certificate_url || null, certificate_type || 'pdf', company_logo || null, featured ? 1 : 0, display_order || 0, published ? 1 : 0, req.params.id)
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
    const { institution, degree, field_of_study, campus, start_date, end_date, is_current, cgpa, description, status_label, display_order, published } = req.body
    if (!institution || !degree) return res.status(400).json({ error: 'Institution and degree are required.' })
    const r = db.prepare('INSERT INTO education (institution, degree, field_of_study, campus, start_date, end_date, is_current, cgpa, description, status_label, display_order, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(institution, degree, field_of_study || null, campus || null, start_date || null, end_date || null, is_current ? 1 : 0, cgpa || null, description || null, status_label || null, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
    res.json({ id: r.lastInsertRowid })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/education/:id', (req, res) => {
  const { institution, degree, field_of_study, campus, start_date, end_date, is_current, cgpa, description, status_label, display_order, published } = req.body
  db.prepare('UPDATE education SET institution=?, degree=?, field_of_study=?, campus=?, start_date=?, end_date=?, is_current=?, cgpa=?, description=?, status_label=?, display_order=?, published=? WHERE id=?').run(institution, degree, field_of_study || null, campus || null, start_date || null, end_date || null, is_current ? 1 : 0, cgpa || null, description || null, status_label || null, display_order || 0, published ? 1 : 0, req.params.id)
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
      const existing = db.prepare('SELECT * FROM about_content LIMIT 1').get() || {}
      const body = req.body || {}
      const valueFor = (key) => (body[key] !== undefined ? body[key] : (existing[key] ?? ''))
      const profileImage = req.file
        ? `/uploads/profile/${req.file.filename}`
        : (body.profile_image !== undefined ? body.profile_image : (existing.profile_image || '/profile.png'))
      const availabilityActive = ['1', 'true', 'on', 'yes', true, 1].includes(body.availability_active) ? 1 : 0

      if (existing.id) {
        db.prepare(`UPDATE about_content SET name=?, title=?, role=?, bio=?, hero_heading=?, hero_description=?, about_heading=?, about_description=?, availability_status=?, availability_active=?, profile_image=?, university=?, degree=?, location=?, updated_at=datetime('now') WHERE id=?`).run(
          valueFor('name'), valueFor('title'), valueFor('role'), valueFor('bio'),
          valueFor('hero_heading'), valueFor('hero_description'), valueFor('about_heading'), valueFor('about_description'),
          valueFor('availability_status'), availabilityActive,
          profileImage, valueFor('university'), valueFor('degree'), valueFor('location'), existing.id
        )
      } else {
        db.prepare(`INSERT INTO about_content
          (name, title, role, bio, hero_heading, hero_description, about_heading, about_description, availability_status, availability_active, profile_image, university, degree, location)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
          valueFor('name'), valueFor('title'), valueFor('role'), valueFor('bio'),
          valueFor('hero_heading'), valueFor('hero_description'), valueFor('about_heading'), valueFor('about_description'),
          valueFor('availability_status'), availabilityActive,
          profileImage, valueFor('university'), valueFor('degree'), valueFor('location')
        )
      }
      const updated = db.prepare('SELECT * FROM about_content LIMIT 1').get()
      res.json({ message: 'About content updated.', profile_image: profileImage, about: updated })
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
    const stmt = db.prepare('UPDATE contact_info SET label=?, value=?, href=?, visible=?, display_order=? WHERE key=?')
    const update = db.transaction((rows) => {
      rows.forEach((item, index) => {
        if (!item || typeof item.key !== 'string' || !item.key.trim()) {
          throw new Error('Every contact item needs a key.')
        }
        stmt.run(
          String(item.label || item.key).trim(),
          String(item.value || '').trim(),
          item.href ? String(item.href).trim() : null,
          item.visible ? 1 : 0,
          item.display_order !== undefined ? Number(item.display_order) || 0 : index,
          item.key.trim()
        )
      })
    })
    update(items)
    res.json({ message: 'Contact info updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/admin/contact — add a new contact method or social link
router.post('/contact', (req, res) => {
  try {
    const { key, label, value, href, visible, display_order } = req.body || {}
    const cleanKey = String(key || label || '').toLowerCase().trim().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-|-$)/g, '')
    if (!cleanKey) return res.status(400).json({ error: 'A key or label is required.' })
    if (!value || !String(value).trim()) return res.status(400).json({ error: 'A contact value is required.' })
    const exists = db.prepare('SELECT id FROM contact_info WHERE key = ?').get(cleanKey)
    if (exists) return res.status(409).json({ error: `A contact item with the key "${cleanKey}" already exists.` })
    const maxOrder = db.prepare('SELECT COALESCE(MAX(display_order), -1) as m FROM contact_info').get().m
    db.prepare('INSERT INTO contact_info (key, label, value, href, visible, display_order) VALUES (?, ?, ?, ?, ?, ?)')
      .run(cleanKey, String(label || cleanKey).trim(), String(value).trim(), href ? String(href).trim() : null, visible === false || visible === 0 ? 0 : 1, display_order !== undefined ? Number(display_order) || 0 : maxOrder + 1)
    res.json({ message: 'Contact item added.', key: cleanKey })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/admin/contact/:key
router.delete('/contact/:key', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM contact_info WHERE key = ?').run(req.params.key)
    if (!result.changes) return res.status(404).json({ error: 'Contact item not found.' })
    res.json({ message: 'Contact item deleted.' })
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

// GET /api/admin/messages-email-status — check if email service is configured
router.get('/messages-email-status', (req, res) => {
  res.json(getEmailServiceInfo())
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

// ─── Freelance services categories ──────────────────────────────────────────────
router.get('/services-categories', (req, res) => {
  const rows = db.prepare('SELECT * FROM services_categories ORDER BY display_order ASC, id ASC').all()
  res.json(rows.map(r => ({ ...r, technologies: safeParseJson(r.technologies) })))
})

router.post('/services-categories', (req, res) => {
  try {
    const { title, description, technologies, icon_name, display_order, published } = req.body || {}
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'Category title is required.' })
    const tech = Array.isArray(technologies)
      ? technologies
      : String(technologies || '').split(',').map(t => t.trim()).filter(Boolean)
    const result = db.prepare(`INSERT INTO services_categories (title, description, icon_name, technologies, display_order, published, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`).run(String(title).trim(), description || null, icon_name || 'LayerGroup', JSON.stringify(tech), display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
    if (!result.changes) return res.status(404).json({ error: 'Category not found.' })
    res.json({ id: result.lastInsertRowid, message: 'Services category created.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/services-categories/:id', (req, res) => {
  try {
    const { title, description, technologies, icon_name, display_order, published } = req.body || {}
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'Category title is required.' })
    const tech = Array.isArray(technologies)
      ? technologies
      : String(technologies || '').split(',').map(t => t.trim()).filter(Boolean)
    const result = db.prepare(`UPDATE services_categories SET title=?, description=?, icon_name=?, technologies=?, display_order=?, published=?, updated_at=datetime('now') WHERE id=?`).run(String(title).trim(), description || null, icon_name || 'LayerGroup', JSON.stringify(tech), display_order || 0, published ? 1 : 0, req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Category not found.' })
    res.json({ message: 'Services category updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/services-categories/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM services_categories WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Category not found.' })
    res.json({ message: 'Services category deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Services ─────────────────────────────────────────────────────────────────
router.get('/services', (req, res) => {
  const rows = db.prepare('SELECT * FROM services ORDER BY display_order ASC, id ASC').all()
  res.json(rows.map(row => ({ ...row, technologies: safeParseJson(row.technologies) })))
})

router.post('/services', (req, res) => {
  try {
    const { title, description, icon_name, technologies, availability, display_order, published } = req.body || {}
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'Service title is required.' })
    const tech = Array.isArray(technologies)
      ? technologies
      : String(technologies || '').split(',').map(t => t.trim()).filter(Boolean)
    const r = db.prepare(`INSERT INTO services (title, description, icon_name, technologies, availability, display_order, published, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`).run(
      String(title).trim(), description || null, icon_name || 'Code2', JSON.stringify(tech),
      availability || 'Available', display_order || 0, published !== undefined ? (published ? 1 : 0) : 1
    )
    res.json({ id: r.lastInsertRowid, message: 'Service created.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/services/:id', (req, res) => {
  try {
    const { title, description, icon_name, technologies, availability, display_order, published } = req.body || {}
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'Service title is required.' })
    const tech = Array.isArray(technologies)
      ? technologies
      : String(technologies || '').split(',').map(t => t.trim()).filter(Boolean)
    const result = db.prepare(`UPDATE services SET title=?, description=?, icon_name=?, technologies=?, availability=?, display_order=?, published=?, updated_at=datetime('now') WHERE id=?`).run(
      String(title).trim(), description || null, icon_name || 'Code2', JSON.stringify(tech),
      availability || 'Available', display_order || 0, published ? 1 : 0, req.params.id
    )
    if (!result.changes) return res.status(404).json({ error: 'Service not found.' })
    res.json({ message: 'Service updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/services/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Service not found.' })
    res.json({ message: 'Service deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Freelance service categories ───────────────────────────────────────────────────────
router.get('/services-categories', (req, res) => {
  const rows = db.prepare('SELECT * FROM services_categories ORDER BY display_order ASC, id ASC').all()
  res.json(rows.map(r => ({ ...r, technologies: safeParseJson(r.technologies) })))
})

router.post('/services-categories', (req, res) => {
  try {
    const { title, description, technologies, icon_name, display_order, published } = req.body || {}
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'Category title is required.' })
    const tech = Array.isArray(technologies)
      ? technologies
      : String(technologies || '').split(',').map(t => t.trim()).filter(Boolean)
    const result = db.prepare(`INSERT INTO services_categories (title, description, icon_name, technologies, display_order, published, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`).run(String(title).trim(), description || null, icon_name || 'LayerGroup', JSON.stringify(tech), display_order || 0, published !== undefined ? (published ? 1 : 0) : 1)
    if (!result.changes) return res.status(404).json({ error: 'Category not found.' })
    res.json({ id: result.lastInsertRowid, message: 'Services category created.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/services-categories/:id', (req, res) => {
  try {
    const { title, description, technologies, icon_name, display_order, published } = req.body || {}
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'Category title is required.' })
    const tech = Array.isArray(technologies)
      ? technologies
      : String(technologies || '').split(',').map(t => t.trim()).filter(Boolean)
    const result = db.prepare(`UPDATE services_categories SET title=?, description=?, icon_name=?, technologies=?, display_order=?, published=?, updated_at=datetime('now') WHERE id=?`).run(String(title).trim(), description || null, icon_name || 'LayerGroup', JSON.stringify(tech), display_order || 0, published ? 1 : 0, req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Category not found.' })
    res.json({ message: 'Services category updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/services-categories/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM services_categories WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Category not found.' })
    res.json({ message: 'Services category deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Projects ─────────────────────────────────────────────────────────────────
router.get('/projects', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects ORDER BY category, display_order ASC').all()
  res.json(rows.map(r => ({ ...r, technologies: safeParseJson(r.technologies) })))
})

router.get('/projects/segment', (req, res) => {
  try {
    const segment = String(req.query.segment || 'both').toLowerCase()
    const valid = ['career', 'freelance', 'both']
    if (!valid.includes(segment)) return res.status(400).json({ error: 'segment must be one of: ' + valid.join(', ') })
    const rows = db.prepare('SELECT * FROM projects ORDER BY category, display_order ASC').all()
    const filtered = rows.filter(p => {
      if (segment === 'career') return p.show_in_career === 1
      if (segment === 'freelance') return p.show_in_freelance === 1
      return true
    })
    res.json(filtered.map(r => ({ ...r, technologies: safeParseJson(r.technologies) })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/projects', (req, res) => {
  try {
    const { slug, title, description, category, image, alt_text, live_url, github_url, technologies, featured, display_order, published, show_in_career, show_in_freelance } = req.body
    if (!title || !category) return res.status(400).json({ error: 'Title and category are required.' })
    const safeSlug = (slug || title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const showInCareer = (show_in_career === undefined ? 1 : Number(show_in_career) || 0)
    const showInFreelance = (show_in_freelance === undefined ? 0 : Number(show_in_freelance) || 0)
    const stmt = db.prepare(`INSERT INTO projects (slug, title, description, category, image, alt_text, live_url, github_url, technologies, featured, display_order, published, show_in_career, show_in_freelance, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
    const r = stmt.run(safeSlug, title, description || null, category, image || null, alt_text || null, live_url || null, github_url || null, JSON.stringify(technologies || []), featured ? 1 : 0, display_order || 0, published !== undefined ? (published ? 1 : 0) : 1, showInCareer, showInFreelance)
    res.json({ id: r.lastInsertRowid, message: 'Project created.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/projects/:id', (req, res) => {
  try {
    const { title, description, category, image, alt_text, live_url, github_url, technologies, featured, display_order, published, show_in_career, show_in_freelance } = req.body
    if (!title || !category) return res.status(400).json({ error: 'Title and category are required.' })
    const showInCareer = (show_in_career === undefined ? 1 : Number(show_in_career) || 0)
    const showInFreelance = (show_in_freelance === undefined ? 0 : Number(show_in_freelance) || 0)
    const result = db.prepare(`UPDATE projects SET title=?, description=?, category=?, image=?, alt_text=?, live_url=?, github_url=?, technologies=?, featured=?, display_order=?, published=?, show_in_career=?, show_in_freelance=?, updated_at=datetime('now') WHERE id=?`).run(
      title, description || null, category, image || null, alt_text || null, live_url || null, github_url || null, JSON.stringify(technologies || []), featured ? 1 : 0, display_order || 0, published ? 1 : 0, showInCareer, showInFreelance, req.params.id
    )
    if (!result.changes) return res.status(404).json({ error: 'Project not found.' })
    res.json({ message: 'Project updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/projects/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Project not found.' })
    res.json({ message: 'Project deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/projects/:id/upload-image', (req, res) => {
  const segment = String(req.body?.segment || req.query.segment || '').toLowerCase()
  const allowed = new Set(['career', 'freelance', 'projects', 'profile', 'certificates', 'documents', 'logos', 'services', 'misc'])
  if (!allowed.has(segment)) return res.status(400).json({ error: 'Invalid segment. Allowed: career, freelance, projects, profile, certificates, documents, logos, services, misc.' })
  req.uploadSubdir = segment === 'freelance' ? 'projects' : segment
  uploadImage.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const folder = segment === 'freelance' ? 'projects' : segment
    const url = `/uploads/${folder}/${req.file.filename}`
    res.json({ url, segment })
  })
})

// ─── Testimonials ─────────────────────────────────────────────────────────────────
router.get('/testimonials', (req, res) => {
  const rows = db.prepare('SELECT * FROM testimonials ORDER BY display_order ASC, id ASC').all()
  res.json(rows.map(r => ({ ...r })))
})

router.post('/testimonials', (req, res) => {
  try {
    const { client_name, client_role, client_company, quote, relation, sentiment, display_order, published } = req.body || {}
    if (!client_name || !quote) return res.status(400).json({ error: 'Client name and quote are required.' })
    const r = db.prepare(`INSERT INTO testimonials (client_name, client_role, client_company, quote, relation, sentiment, display_order, published, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`).run(
      String(client_name).trim(), client_role || null, client_company || null, String(quote).trim(),
      relation || 'Client', sentiment || 'Trusted', display_order || 0, published !== undefined ? (published ? 1 : 0) : 1
    )
    res.json({ id: r.lastInsertRowid, message: 'Testimonial added.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/testimonials/:id', (req, res) => {
  try {
    const { client_name, client_role, client_company, quote, relation, sentiment, display_order, published } = req.body || {}
    if (!client_name || !quote) return res.status(400).json({ error: 'Client name and quote are required.' })
    const result = db.prepare(`UPDATE testimonials SET client_name=?, client_role=?, client_company=?, quote=?, relation=?, sentiment=?, display_order=?, published=? WHERE id=?`).run(
      String(client_name).trim(), client_role || null, client_company || null, String(quote).trim(),
      relation || 'Client', sentiment || 'Trusted', display_order || 0, published ? 1 : 0, req.params.id
    )
    if (!result.changes) return res.status(404).json({ error: 'Testimonial not found.' })
    res.json({ message: 'Testimonial updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/testimonials/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM testimonials WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Testimonial not found.' })
    res.json({ message: 'Testimonial deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Packages ─────────────────────────────────────────────────────────────────
router.get('/packages', (req, res) => {
  const rows = db.prepare('SELECT * FROM packages ORDER BY display_order ASC, id ASC').all()
  res.json(rows.map(r => ({ ...r })))
})

router.post('/packages', (req, res) => {
  try {
    const { service_id, service_title, title, description, price, price_period, features, call_to_action, display_order, published } = req.body || {}
    if (!title) return res.status(400).json({ error: 'Package title is required.' })
    const r = db.prepare(`INSERT INTO packages (service_id, service_title, title, description, price, price_period, features, call_to_action, display_order, published, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`).run(
      service_id || null, service_title || null, String(title).trim(), description || null,
      price ? Number(price) : null, price_period || null, features || null, call_to_action || 'Get a Custom Quote',
      display_order || 0, published !== undefined ? (published ? 1 : 0) : 1
    )
    res.json({ id: r.lastInsertRowid, message: 'Package created.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/packages/:id', (req, res) => {
  try {
    const { service_id, service_title, title, description, price, price_period, features, call_to_action, display_order, published } = req.body || {}
    if (!title) return res.status(400).json({ error: 'Package title is required.' })
    const result = db.prepare(`UPDATE packages SET service_id=?, service_title=?, title=?, description=?, price=?, price_period=?, features=?, call_to_action=?, display_order=?, published=? WHERE id=?`).run(
      service_id || null, service_title || null, String(title).trim(), description || null,
      price ? Number(price) : null, price_period || null, features || null, call_to_action || 'Get a Custom Quote',
      display_order || 0, published ? 1 : 0, req.params.id
    )
    if (!result.changes) return res.status(404).json({ error: 'Package not found.' })
    res.json({ message: 'Package updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/packages/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM packages WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Package not found.' })
    res.json({ message: 'Package deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Chatbot route settings ─────────────────────────────────────────────────────
router.get('/chatbot-routes', (req, res) => {
  const rows = db.prepare('SELECT * FROM chatbot_routes ORDER BY id ASC').all()
  res.json(rows.map(r => ({ ...r })))
})

router.post('/chatbot-routes', (req, res) => {
  try {
    const { route, enabled, greeting, suggested_questions } = req.body || {}
    if (!route || !String(route).trim()) return res.status(400).json({ error: 'Route is required.' })
    const r = db.prepare(`INSERT INTO chatbot_routes (route, enabled, greeting, suggested_questions)
      VALUES (?, ?, ?, ?)`).run(String(route).trim(), enabled ? 1 : 0, greeting || null, suggested_questions || null)
    res.json({ id: r.lastInsertRowid, message: 'Chatbot route created/overridden.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/chatbot-routes/:id', (req, res) => {
  try {
    const { route, enabled, greeting, suggested_questions } = req.body || {}
    if (!route || !String(route).trim()) return res.status(400).json({ error: 'Route is required.' })
    const result = db.prepare(`UPDATE chatbot_routes SET route=?, enabled=?, greeting=?, suggested_questions=? WHERE id=?`).run(
      String(route).trim(), enabled ? 1 : 0, greeting || null, suggested_questions || null, req.params.id
    )
    if (!result.changes) return res.status(404).json({ error: 'Route not found.' })
    res.json({ message: 'Chatbot route updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/chatbot-routes/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM chatbot_routes WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Route not found.' })
    res.json({ message: 'Chatbot route deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Freelance site settings (hero headline, description, CTA, process) ───────
router.get('/freelance-settings', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM freelancer_settings ORDER BY id ASC').all()
  const obj = {}
  rows.forEach(r => { obj[r.key] = r.value })
  res.json(obj)
})

router.put('/freelance-settings', (req, res) => {
  try {
    const body = req.body || {}
    const upsert = db.prepare(`INSERT INTO freelancer_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`)
    Object.entries(body).forEach(([key, value]) => {
      if (typeof value === 'string' || value === null || value === undefined) upsert.run(key, String(value ?? ''))
    })
    res.json({ message: 'Freelance settings saved.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Chatbot route-filter setting ─────────────────────────────────────────────
router.get('/chatbot-settings', (req, res) => {
  const row = db.prepare('SELECT key, value FROM site_settings WHERE key IN (\'chatbot_route_filter\')').get()
  res.json({ chatbot_route_filter: row?.value || 'shared' })
})

router.put('/chatbot-settings', (req, res) => {
  try {
    const { chatbot_route_filter } = req.body || {}
    const valid = ['career', 'freelance', 'shared']
    if (!valid.includes(String(chatbot_route_filter || '').toLowerCase())) return res.status(400).json({ error: 'chatbot_route_filter must be one of: ' + valid.join(', ') })
    db.prepare(`INSERT INTO site_settings (key, value, updated_at) VALUES ('chatbot_route_filter', ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at`).run(String(chatbot_route_filter),)
    res.json({ message: 'Chatbot route filter saved.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Chatbot knowledge ───────────────────────────────────────────────────────
router.get('/chatbot-knowledge', (req, res) => {
  const rows = db.prepare('SELECT * FROM chatbot_knowledge ORDER BY display_order ASC, id ASC').all()
  res.json(rows.map(row => ({ ...row, keywords: safeParseJson(row.keywords) })))
})

router.post('/chatbot-knowledge', (req, res) => {
  try {
    const { topic, question, answer, keywords, display_order, published } = req.body || {}
    if (!topic || !String(topic).trim()) return res.status(400).json({ error: 'Topic is required.' })
    if (!answer || !String(answer).trim()) return res.status(400).json({ error: 'Answer is required.' })
    const kw = Array.isArray(keywords)
      ? keywords
      : String(keywords || '').split(',').map(k => k.trim()).filter(Boolean)
    const r = db.prepare(`INSERT INTO chatbot_knowledge (topic, question, answer, keywords, display_order, published, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`).run(
      String(topic).trim(), question || null, String(answer).trim(), JSON.stringify(kw),
      display_order || 0, published !== undefined ? (published ? 1 : 0) : 1
    )
    res.json({ id: r.lastInsertRowid, message: 'Chatbot knowledge entry created.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/chatbot-knowledge/:id', (req, res) => {
  try {
    const { topic, question, answer, keywords, display_order, published } = req.body || {}
    if (!topic || !String(topic).trim()) return res.status(400).json({ error: 'Topic is required.' })
    if (!answer || !String(answer).trim()) return res.status(400).json({ error: 'Answer is required.' })
    const kw = Array.isArray(keywords)
      ? keywords
      : String(keywords || '').split(',').map(k => k.trim()).filter(Boolean)
    const result = db.prepare(`UPDATE chatbot_knowledge SET topic=?, question=?, answer=?, keywords=?, display_order=?, published=?, updated_at=datetime('now') WHERE id=?`).run(
      String(topic).trim(), question || null, String(answer).trim(), JSON.stringify(kw),
      display_order || 0, published ? 1 : 0, req.params.id
    )
    if (!result.changes) return res.status(404).json({ error: 'Chatbot entry not found.' })
    res.json({ message: 'Chatbot knowledge entry updated.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/chatbot-knowledge/:id', (req, res) => {
  try {
    const result = db.prepare('DELETE FROM chatbot_knowledge WHERE id = ?').run(req.params.id)
    if (!result.changes) return res.status(404).json({ error: 'Chatbot entry not found.' })
    res.json({ message: 'Chatbot knowledge entry deleted.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Generic uploads ────────────────────────────────────────────────────────
const UPLOAD_FOLDERS = new Set(['projects', 'profile', 'certificates', 'documents', 'logos', 'services', 'misc'])

router.post('/uploads/image', (req, res) => {
  const folder = String(req.query.folder || 'misc')
  if (!UPLOAD_FOLDERS.has(folder)) return res.status(400).json({ error: 'Invalid upload folder. Allowed: ' + [...UPLOAD_FOLDERS].join(', ') })
  req.uploadSubdir = folder
  uploadImage.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    res.json({ url: `/uploads/${folder}/${req.file.filename}`, filename: req.file.originalname })
  })
})

router.post('/uploads/document', (req, res) => {
  const folder = String(req.query.folder || 'documents')
  if (!UPLOAD_FOLDERS.has(folder)) return res.status(400).json({ error: 'Invalid upload folder. Allowed: ' + [...UPLOAD_FOLDERS].join(', ') })
  req.uploadSubdir = folder
  uploadDoc.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message })
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' })
    const ext = path.extname(req.file.filename).toLowerCase()
    res.json({
      url: `/uploads/${folder}/${req.file.filename}`,
      filename: req.file.originalname,
      type: ext === '.pdf' ? 'pdf' : 'image',
    })
  })
})

// ─── Diagnostics ─────────────────────────────────────────────────────────────
router.get('/system-status', (req, res) => {
  res.json({
    email: getEmailServiceInfo(),
    authenticated: true,
  })
})

export default router
