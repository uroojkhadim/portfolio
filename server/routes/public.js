// Public API routes — returns only published content
import { Router } from 'express'
import db from '../db.js'

const router = Router()

function safeParseJson(str, fallback = []) {
  try { return JSON.parse(str) } catch { return fallback }
}

// GET /api/public/projects — career projects the recruiter sees
router.get('/projects', (req, res) => {
  try {
    const projects = db.prepare(`
      SELECT id, slug, title, description, category, image, alt_text, live_url, github_url,
             technologies, featured, display_order
      FROM projects
      WHERE published = 1
      ORDER BY category, display_order ASC, id ASC
    `).all().map(project => ({
      ...project,
      technologies: safeParseJson(project.technologies),
    }))

    res.json({
      web: projects.filter(p => p.category === 'web'),
      mobile: projects.filter(p => p.category === 'mobile'),
    })
  } catch (err) {
    console.error('/api/public/projects error:', err)
    res.status(500).json({ error: 'Failed to load projects' })
  }
})

// GET /api/public/projects — the full portfolio, mirrored in the admin panel.
// Used by the admin service/project editor so every field (incl. visibility)
// and every live project appears in the CMS.
router.get('/projects/all', (req, res) => {
  try {
    const projects = db.prepare(`
      SELECT id, slug, title, description, category, image, alt_text, live_url, github_url,
             technologies, featured, display_order, published,
             show_in_career, show_in_freelance
      FROM projects
      ORDER BY category, display_order ASC, id ASC
    `).all().map(project => ({
      ...project,
      technologies: safeParseJson(project.technologies),
    }))
    res.json(projects)
  } catch (err) {
    console.error('/api/public/projects/all error:', err)
    res.status(500).json({ error: 'Failed to load all projects' })
  }
})

// GET /api/public/freelance-categories — the six bucket tags shown on the
// freelancing portfolio, in the order the admin set them.
router.get('/freelance-categories', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, title, description, icon_name, display_order
      FROM freelance_categories
      WHERE published = 1
      ORDER BY display_order ASC, id ASC
    `).all()
    res.json(rows)
  } catch (err) {
    console.error('/api/public/freelance-categories error:', err)
    res.status(500).json({ error: 'Failed to load freelance categories' })
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

    res.json(categories.map(category => ({
      id: category.id,
      category_key: category.category_key,
      title: category.title,
      description: category.description,
      gradient: category.gradient,
      icon_name: category.icon_name,
      skills: skills.filter(skill => skill.category_id === category.id),
    })))
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
             description, responsibilities, skills_list, certificate_url, certificate_type,
             company_logo, featured
      FROM experience
      WHERE published = 1
      ORDER BY display_order ASC
    `).all()

    res.json(rows.map(row => ({
      ...row,
      skills: safeParseJson(row.skills_list),
      responsibilities: row.responsibilities
        ? row.responsibilities.split(/\r?\n|;/).map(v => v.trim()).filter(Boolean)
        : [],
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
      SELECT id, institution, degree, field_of_study, campus, start_date, end_date, is_current,
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

// GET /api/public/services
router.get('/services', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, title, description, icon_name, technologies, availability, display_order
      FROM services
      WHERE published = 1
      ORDER BY display_order ASC
    `).all()
    res.json(rows.map(row => ({
      ...row,
      technologies: safeParseJson(row.technologies),
    })))
  } catch (err) {
    console.error('/api/public/services error:', err)
    res.status(500).json({ error: 'Failed to load services' })
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
      SELECT key, label, value, href, visible
      FROM contact_info
      WHERE visible = 1
      ORDER BY display_order ASC
    `).all()
    const obj = {}
    rows.forEach(row => { obj[row.key] = row })
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
    rows.forEach(row => { obj[row.key] = row.value })
    res.json(obj)
  } catch (err) {
    console.error('/api/public/settings error:', err)
    res.status(500).json({ error: 'Failed to load settings' })
  }
})

// GET /api/public/chatbot-config — greeting + suggested prompts (no secrets)
router.get('/chatbot-config', (req, res) => {
  try {
    const settings = {}
    db.prepare("SELECT key, value FROM site_settings WHERE key IN ('chatbot_enabled','chatbot_greeting','chatbot_suggestions')")
      .all()
      .forEach(row => { settings[row.key] = row.value })
    res.json({
      enabled: settings.chatbot_enabled !== '0',
      greeting: settings.chatbot_greeting || "Hello! I'm Urooj Khadim's portfolio assistant. Ask me about her skills, services, projects, experience, or how to get in touch.",
      suggestions: (settings.chatbot_suggestions || '')
        .split(/\r?\n|,/)
        .map(s => s.trim())
        .filter(Boolean)
        .slice(0, 6),
    })
  } catch (err) {
    console.error('/api/public/chatbot-config error:', err)
    res.status(500).json({ error: 'Failed to load chatbot configuration' })
  }
})

export default router
