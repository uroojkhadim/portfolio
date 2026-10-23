// Public API routes — returns only published content
import { Router } from 'express'
import db from '../db.js'

const router = Router()

// GET /api/public/projects
router.get('/projects', (req, res) => {
  try {
    const projects = db.prepare(`
      SELECT id, slug, title, description, category, image, alt_text, live_url, github_url,
             technologies, featured, display_order
      FROM projects
      WHERE published = 1
      ORDER BY category, display_order ASC, id ASC
    `).all()

    const web = projects.filter(p => p.category === 'web').map(p => ({
      ...p,
      technologies: safeParseJson(p.technologies, [])
    }))
    const mobile = projects.filter(p => p.category === 'mobile').map(p => ({
      ...p,
      technologies: safeParseJson(p.technologies, [])
    }))

    res.json({ web, mobile })
  } catch (err) {
    console.error('/api/public/projects error:', err)
    res.status(500).json({ error: 'Failed to load projects' })
  }
})

// GET /api/public/skills
router.get('/skills', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT id, category_key, title, description, gradient, icon_name, display_order
      FROM skill_categories
      WHERE published = 1
      ORDER BY display_order ASC
    `).all()

    const skills = db.prepare(`
      SELECT id, category_id, name, tag, highlight, display_order
      FROM skills
      WHERE published = 1
      ORDER BY display_order ASC
    `).all()

    const grouped = categories.map(cat => ({
      id: cat.id,
      category_key: cat.category_key,
      title: cat.title,
      description: cat.description,
      gradient: cat.gradient,
      icon_name: cat.icon_name,
      skills: skills.filter(s => s.category_id === cat.id)
    }))

    res.json(grouped)
  } catch (err) {
    console.error('/api/public/skills error:', err)
    res.status(500).json({ error: 'Failed to load skills' })
  }
})

// GET /api/public/experience
router.get('/experience', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, company, role, location, type, start_date, end_date, is_current,
             description, skills_list, certificate_url, certificate_type, featured
      FROM experience
      WHERE published = 1
      ORDER BY display_order ASC
    `).all()

    res.json(rows.map(r => ({
      ...r,
      skills: safeParseJson(r.skills_list, [])
    })))
  } catch (err) {
    console.error('/api/public/experience error:', err)
    res.status(500).json({ error: 'Failed to load experience' })
  }
})

// GET /api/public/education
router.get('/education', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, institution, degree, field_of_study, start_date, end_date, is_current,
             cgpa, description, status_label, display_order
      FROM education
      WHERE published = 1
      ORDER BY display_order ASC
    `).all()
    res.json(rows)
  } catch (err) {
    console.error('/api/public/education error:', err)
    res.status(500).json({ error: 'Failed to load education' })
  }
})

// GET /api/public/documents
router.get('/documents', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, title, description, category, version, file_path, filename, display_order
      FROM documents
      WHERE published = 1
      ORDER BY display_order ASC
    `).all()
    res.json(rows)
  } catch (err) {
    console.error('/api/public/documents error:', err)
    res.status(500).json({ error: 'Failed to load documents' })
  }
})

// GET /api/public/certificates
router.get('/certificates', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, title, issuer, issue_date, credential_url, description, image_url, display_order
      FROM certificates
      WHERE published = 1
      ORDER BY display_order ASC
    `).all()
    res.json(rows)
  } catch (err) {
    console.error('/api/public/certificates error:', err)
    res.status(500).json({ error: 'Failed to load certificates' })
  }
})

// GET /api/public/about
router.get('/about', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM about_content LIMIT 1').get()
    res.json(row || {})
  } catch (err) {
    console.error('/api/public/about error:', err)
    res.status(500).json({ error: 'Failed to load about content' })
  }
})

// GET /api/public/contact
router.get('/contact', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT key, label, value, href
      FROM contact_info
      WHERE visible = 1
      ORDER BY display_order ASC
    `).all()
    const obj = {}
    rows.forEach(r => { obj[r.key] = r })
    res.json(obj)
  } catch (err) {
    console.error('/api/public/contact error:', err)
    res.status(500).json({ error: 'Failed to load contact info' })
  }
})

// GET /api/public/settings
router.get('/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value FROM site_settings').all()
    const obj = {}
    rows.forEach(r => { obj[r.key] = r.value })
    res.json(obj)
  } catch (err) {
    console.error('/api/public/settings error:', err)
    res.status(500).json({ error: 'Failed to load settings' })
  }
})

function safeParseJson(str, fallback) {
  try { return JSON.parse(str) } catch { return fallback }
}

export default router
