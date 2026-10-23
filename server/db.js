/**
 * SQLite Database Layer — Portfolio CMS
 * Uses better-sqlite3 (synchronous, zero-config, file-based)
 */
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY)

let DATA_DIR = path.join(__dirname, 'data')
let DB_PATH = path.join(DATA_DIR, 'portfolio.db')

if (isServerless) {
  DATA_DIR = '/tmp/portfolio-data'
  DB_PATH = path.join(DATA_DIR, 'portfolio.db')
}

// Ensure data directory exists (with fallback to /tmp if read-only)
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
} catch (err) {
  DATA_DIR = '/tmp/portfolio-data'
  DB_PATH = path.join(DATA_DIR, 'portfolio.db')
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

// If on serverless, copy any pre-seeded database to writable /tmp
const bundledDb = path.join(__dirname, 'data', 'portfolio.db')
if (DB_PATH !== bundledDb && fs.existsSync(bundledDb) && !fs.existsSync(DB_PATH)) {
  try {
    fs.copyFileSync(bundledDb, DB_PATH)
    console.log('[DB] Copied bundled database to writable location:', DB_PATH)
  } catch (e) {
    console.warn('[DB] Notice on copying bundled DB:', e.message)
  }
}

let db
try {
  db = new Database(DB_PATH)
  // Enable WAL mode for better performance
  try {
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  } catch {}
} catch (dbErr) {
  console.error('[DB] Failed to open SQLite database:', dbErr.message)
  // Fallback in-memory DB so app won't crash on serverless
  db = new Database(':memory:')
}

// ─── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT DEFAULT 'Admin',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS about_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    title TEXT,
    role TEXT,
    bio TEXT,
    hero_heading TEXT,
    hero_description TEXT,
    availability_status TEXT DEFAULT 'Available for Remote Roles & Internships',
    availability_active INTEGER DEFAULT 1,
    profile_image TEXT DEFAULT '/profile.png',
    university TEXT,
    degree TEXT,
    location TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    label TEXT,
    value TEXT,
    href TEXT,
    visible INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS skill_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    gradient TEXT DEFAULT 'from-indigo-500 to-violet-600',
    icon_name TEXT DEFAULT 'Code2',
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER REFERENCES skill_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    tag TEXT,
    highlight INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS experience (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT,
    type TEXT DEFAULT 'Professional Experience',
    start_date TEXT,
    end_date TEXT,
    is_current INTEGER DEFAULT 0,
    description TEXT,
    skills_list TEXT DEFAULT '[]',
    certificate_url TEXT,
    certificate_type TEXT DEFAULT 'pdf',
    featured INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS education (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    institution TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT,
    start_date TEXT,
    end_date TEXT,
    is_current INTEGER DEFAULT 0,
    cgpa TEXT,
    description TEXT,
    status_label TEXT,
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'web',
    image TEXT,
    alt_text TEXT,
    live_url TEXT,
    github_url TEXT,
    technologies TEXT DEFAULT '[]',
    featured INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'cv',
    version TEXT,
    file_path TEXT,
    filename TEXT,
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    issuer TEXT,
    issue_date TEXT,
    credential_url TEXT,
    description TEXT,
    image_url TEXT,
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread',
    client_ip TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    replied_at TEXT,
    archived_at TEXT
  );
`)

// ─── Seed Data ────────────────────────────────────────────────────────────────

function seedDatabase() {
  // Admin user
  const existingAdmin = db.prepare('SELECT id FROM admin_users WHERE email = ?').get('uroojkhadim505@gmail.com')
  if (!existingAdmin) {
    const hash = bcrypt.hashSync('khadim123', 12)
    db.prepare('INSERT INTO admin_users (email, password_hash, name) VALUES (?, ?, ?)').run(
      'uroojkhadim505@gmail.com', hash, 'Urooj Khadim'
    )
    console.log('[DB] Admin user created.')
  }

  // Site Settings
  const defaultSettings = [
    { key: 'site_title', value: 'Urooj Khadim | Software Engineering Student & Developer' },
    { key: 'site_description', value: 'Full Stack / Web & Mobile Developer portfolio — projects, skills, and contact.' },
    { key: 'footer_text', value: '© {year} Urooj Khadim. All rights reserved · Software Engineering Student & Developer' },
    { key: 'copyright_name', value: 'Urooj Khadim' },
    { key: 'seo_title', value: 'Urooj Khadim | Software Engineering Student & Developer' },
    { key: 'seo_description', value: 'Urooj Khadim — Software Engineering Student & Full Stack Web & Mobile Developer. Portfolio showcasing projects, skills, and experience.' },
    { key: 'seo_keywords', value: 'Urooj Khadim, Software Engineer, Web Developer, React, Flutter, Portfolio' },
    { key: 'navbar_brand', value: 'UK' },
    { key: 'chatbot_enabled', value: '1' },
  ]
  const insertSetting = db.prepare('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)')
  defaultSettings.forEach(s => insertSetting.run(s.key, s.value))

  // About Content
  const existingAbout = db.prepare('SELECT id FROM about_content LIMIT 1').get()
  if (!existingAbout) {
    db.prepare(`INSERT INTO about_content 
      (name, title, role, bio, hero_heading, hero_description, availability_status, availability_active, profile_image, university, degree, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'Urooj Khadim',
      'Software Engineering Student',
      'Full Stack / Web & Mobile Developer',
      `I am a Senior Software Engineering student at COMSATS University Islamabad (Vehari Campus). My journey in technology centers on architecting scalable software, crafting intuitive user interfaces, and solving real-world challenges through clean, maintainable code.

Over the course of my academic and practical career, I have developed full-stack web applications using React, modern JavaScript, and RESTful backends, alongside cross-platform mobile apps using Flutter and Dart.`,
      "Hi, I'm Urooj Khadim",
      'Passionate about building responsive web applications, cross-platform Flutter mobile solutions, and intelligent digital tools.',
      'Available for Remote Roles & Internships',
      1,
      '/profile.png',
      'COMSATS University Islamabad, Vehari Campus',
      'Bachelor of Software Engineering (BS SE)',
      'Vehari, Pakistan · Available for Remote & Internships'
    )
    console.log('[DB] About content seeded.')
  }

  // Contact Info
  const contactItems = [
    { key: 'email', label: 'Email', value: 'uroojkhadim505@gmail.com', href: 'mailto:uroojkhadim505@gmail.com', visible: 1, display_order: 0 },
    { key: 'phone', label: 'Phone / WhatsApp', value: '0313-6576128', href: 'tel:03136576128', visible: 1, display_order: 1 },
    { key: 'github', label: 'GitHub', value: 'github.com/uroojkhadim', href: 'https://github.com/uroojkhadim', visible: 1, display_order: 2 },
    { key: 'linkedin', label: 'LinkedIn', value: 'Connect on LinkedIn', href: 'https://www.linkedin.com/in/urooj-khadim-26a334364', visible: 1, display_order: 3 },
    { key: 'location', label: 'Location', value: 'Vehari, Pakistan', href: null, visible: 1, display_order: 4 },
    { key: 'contact_heading', label: 'Contact Heading', value: "Let's build something exceptional", href: null, visible: 1, display_order: 5 },
    { key: 'contact_description', label: 'Contact Description', value: 'Have an internship opportunity, project collaboration, or inquiry? Send a message directly and I\'ll be notified in real time.', href: null, visible: 1, display_order: 6 },
  ]
  const insertContact = db.prepare('INSERT OR IGNORE INTO contact_info (key, label, value, href, visible, display_order) VALUES (?, ?, ?, ?, ?, ?)')
  contactItems.forEach(c => insertContact.run(c.key, c.label, c.value, c.href, c.visible, c.display_order))

  // Skill Categories
  const existingCats = db.prepare('SELECT COUNT(*) as cnt FROM skill_categories').get()
  if (existingCats.cnt === 0) {
    const cats = [
      { category_key: 'programming', title: 'Programming Languages', description: 'Core languages used for algorithms, software design, and system development.', gradient: 'from-blue-500 to-indigo-600', icon_name: 'Code2', display_order: 0 },
      { category_key: 'web-development', title: 'Web & Full-Stack Development', description: 'Building modern, responsive frontend interfaces and secure backend APIs.', gradient: 'from-indigo-500 to-violet-600', icon_name: 'Globe2', display_order: 1 },
      { category_key: 'mobile-development', title: 'Mobile Development', description: 'Cross-platform and native mobile app development with clean UI architecture.', gradient: 'from-purple-500 to-fuchsia-600', icon_name: 'Smartphone', display_order: 2 },
      { category_key: 'databases', title: 'Databases & Cloud Storage', description: 'Relational, document, and cloud-native database solutions.', gradient: 'from-emerald-500 to-teal-600', icon_name: 'Database', display_order: 3 },
      { category_key: 'ai-ml', title: 'AI & Machine Learning', description: 'Practical machine learning workflows, preprocessing, and predictive analytics.', gradient: 'from-amber-500 to-rose-600', icon_name: 'BrainCircuit', display_order: 4 },
      { category_key: 'tools', title: 'Development Tools & Platforms', description: 'Version control, developer environments, and cloud deployment platforms.', gradient: 'from-slate-600 to-zinc-700', icon_name: 'Wrench', display_order: 5 },
    ]
    const insertCat = db.prepare('INSERT INTO skill_categories (category_key, title, description, gradient, icon_name, display_order) VALUES (?, ?, ?, ?, ?, ?)')
    cats.forEach(c => insertCat.run(c.category_key, c.title, c.description, c.gradient, c.icon_name, c.display_order))

    // Skills
    const catRows = db.prepare('SELECT id, category_key FROM skill_categories').all()
    const catMap = {}
    catRows.forEach(r => { catMap[r.category_key] = r.id })

    const skillsData = [
      { cat: 'programming', name: 'Python', tag: 'Core', highlight: 1, order: 0 },
      { cat: 'programming', name: 'Java', tag: 'Core', highlight: 0, order: 1 },
      { cat: 'programming', name: 'C++', tag: 'Foundational', highlight: 0, order: 2 },
      { cat: 'programming', name: 'Dart', tag: 'Core', highlight: 1, order: 3 },
      { cat: 'programming', name: 'Kotlin', tag: 'Mobile', highlight: 0, order: 4 },
      { cat: 'programming', name: 'JavaScript (ES6+)', tag: 'Core', highlight: 1, order: 5 },
      { cat: 'web-development', name: 'HTML5 & CSS3', tag: 'Core', highlight: 0, order: 0 },
      { cat: 'web-development', name: 'JavaScript', tag: 'Core', highlight: 0, order: 1 },
      { cat: 'web-development', name: 'React', tag: 'Advanced', highlight: 1, order: 2 },
      { cat: 'web-development', name: 'Laravel', tag: 'Backend', highlight: 0, order: 3 },
      { cat: 'web-development', name: 'Backend Development', tag: 'Full-Stack', highlight: 0, order: 4 },
      { cat: 'web-development', name: 'RESTful API Design', tag: 'Architecture', highlight: 0, order: 5 },
      { cat: 'web-development', name: 'Full-Stack Architecture', tag: 'Practical', highlight: 1, order: 6 },
      { cat: 'mobile-development', name: 'Flutter', tag: 'Primary', highlight: 1, order: 0 },
      { cat: 'mobile-development', name: 'Dart', tag: 'Primary', highlight: 0, order: 1 },
      { cat: 'mobile-development', name: 'Android Development', tag: 'Mobile', highlight: 0, order: 2 },
      { cat: 'mobile-development', name: 'Kotlin', tag: 'Native Android', highlight: 0, order: 3 },
      { cat: 'mobile-development', name: 'Android XML', tag: 'Layouts', highlight: 0, order: 4 },
      { cat: 'mobile-development', name: 'Responsive Mobile UI', tag: 'Design', highlight: 0, order: 5 },
      { cat: 'databases', name: 'MySQL', tag: 'Relational', highlight: 0, order: 0 },
      { cat: 'databases', name: 'MongoDB', tag: 'NoSQL', highlight: 1, order: 1 },
      { cat: 'databases', name: 'SQLite', tag: 'Embedded Mobile', highlight: 0, order: 2 },
      { cat: 'databases', name: 'Supabase', tag: 'Cloud Database', highlight: 1, order: 3 },
      { cat: 'databases', name: 'Firebase Firestore', tag: 'Realtime', highlight: 0, order: 4 },
      { cat: 'ai-ml', name: 'Python-based ML', tag: 'Applied', highlight: 1, order: 0 },
      { cat: 'ai-ml', name: 'scikit-learn', tag: 'Algorithms', highlight: 0, order: 1 },
      { cat: 'ai-ml', name: 'Data Preprocessing', tag: 'Data Pipeline', highlight: 0, order: 2 },
      { cat: 'ai-ml', name: 'Model Training', tag: 'Evaluation', highlight: 0, order: 3 },
      { cat: 'ai-ml', name: 'Predictive Analytics', tag: 'Domain Modeling', highlight: 1, order: 4 },
      { cat: 'tools', name: 'Git & GitHub', tag: 'Version Control', highlight: 1, order: 0 },
      { cat: 'tools', name: 'Visual Studio Code', tag: 'IDE', highlight: 0, order: 1 },
      { cat: 'tools', name: 'Android Studio', tag: 'Mobile IDE', highlight: 0, order: 2 },
      { cat: 'tools', name: 'Cursor', tag: 'AI IDE', highlight: 0, order: 3 },
      { cat: 'tools', name: 'Dev C++', tag: 'Environment', highlight: 0, order: 4 },
      { cat: 'tools', name: 'Vercel & Netlify', tag: 'Deployment', highlight: 0, order: 5 },
    ]
    const insertSkill = db.prepare('INSERT INTO skills (category_id, name, tag, highlight, display_order) VALUES (?, ?, ?, ?, ?)')
    skillsData.forEach(s => insertSkill.run(catMap[s.cat], s.name, s.tag, s.highlight, s.order))
    console.log('[DB] Skills seeded.')
  }

  // Experience
  const existingExp = db.prepare('SELECT COUNT(*) as cnt FROM experience').get()
  if (existingExp.cnt === 0) {
    const exps = [
      {
        company: 'The GamiTron (PVT) Ltd', role: 'Android Developer',
        location: 'Lahore Division, Punjab, Pakistan', type: 'Professional Experience',
        start_date: '2026-07', end_date: '2026-08', is_current: 0,
        description: 'Learned Android development fundamentals, including Kotlin, Jetpack Compose, and XML-based UI layouts.',
        skills_list: JSON.stringify(['Android Development', 'Kotlin', 'Jetpack Compose', 'XML Layouts']),
        display_order: 0
      },
      {
        company: 'Rhombix Technologies', role: 'Frontend Developer',
        location: 'Remote', type: 'Professional Experience',
        start_date: '2026-03', end_date: '2026-07', is_current: 0,
        description: 'Worked in a frontend development role, building and refining user-facing web interfaces.',
        skills_list: JSON.stringify(['Frontend Development', 'Web Interfaces', 'HTML/CSS', 'JavaScript']),
        display_order: 1
      },
      {
        company: 'DevelopersHub Corporation©', role: 'Intern — Android App Developer',
        location: 'Remote', type: 'Internship',
        start_date: '2025-12', end_date: '2026-04', is_current: 0,
        description: 'Gained internship experience in Android application development and mobile app workflows.',
        skills_list: JSON.stringify(['Android Development', 'Mobile App Workflows', 'Kotlin', 'UI Design']),
        display_order: 2
      },
    ]
    const insertExp = db.prepare(`INSERT INTO experience 
      (company, role, location, type, start_date, end_date, is_current, description, skills_list, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    exps.forEach(e => insertExp.run(e.company, e.role, e.location, e.type, e.start_date, e.end_date, e.is_current, e.description, e.skills_list, e.display_order))
    console.log('[DB] Experience seeded.')
  }

  // Education
  const existingEdu = db.prepare('SELECT COUNT(*) as cnt FROM education').get()
  if (existingEdu.cnt === 0) {
    db.prepare(`INSERT INTO education 
      (institution, degree, field_of_study, start_date, is_current, description, status_label, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'COMSATS University Islamabad, Vehari Campus',
      'Bachelor of Software Engineering (BS SE)',
      'Software Engineering',
      '2021',
      1,
      'Pursuing a comprehensive curriculum in software engineering, combining foundational computing theory with practical development across web, mobile, and intelligent systems.',
      'Senior Student · Currently Enrolled',
      0
    )
    console.log('[DB] Education seeded.')
  }

  // Projects (Web)
  const existingProjects = db.prepare('SELECT COUNT(*) as cnt FROM projects').get()
  if (existingProjects.cnt === 0) {
    const webProjects = [
      { slug: 'snapback-conversation-builder', title: 'Snapback Conversation Builder', category: 'web', image: '/images/projects/snapback-conversation-builder.svg', alt_text: 'Snapback Conversation Builder AI conversation flow editor with interactive node logic and canvas', live_url: 'https://snapback-conversation-builder.lovable.app/', display_order: 0 },
      { slug: 'techars', title: 'Techars', category: 'web', image: '/images/projects/techars.svg', alt_text: 'Techars modern software engineering and digital solutions agency web platform', live_url: 'https://techars.vercel.app', display_order: 1 },
      { slug: '6-star-hospitality', title: '6 Star Hospitality', category: 'web', image: '/images/projects/6-star-hospitality.svg', alt_text: '6 Star Hospitality luxury hotel reservation and concierge suite management web portal', live_url: 'https://6starhospitality.online/', display_order: 2 },
      { slug: 'cui-plagiarism', title: 'CUI Plagiarism Portal', category: 'web', image: '/images/projects/cui-plagiarism-portal.svg', alt_text: 'CUI Plagiarism Portal web application dashboard for document submission and originality verification', live_url: 'https://cui-plagiarism-portal-frontend.vercel.app/', display_order: 3 },
      { slug: 'flickcom-isp', title: 'FlickCom ISP Website', category: 'web', image: '/images/projects/flickcom-isp.svg', alt_text: 'FlickCom high-speed internet service provider website with broadband packages and coverage portal', live_url: 'https://flickcom-isp.vercel.app/', display_order: 4 },
      { slug: 'cafeteria-management', title: 'Cafeteria Management System', category: 'web', image: '/images/projects/cafeteria-management.svg', alt_text: 'Cafeteria Management System web interface with online food ordering and live kitchen queue', live_url: 'https://cafeteria-management-main.firebaseapp.com', display_order: 5 },
      { slug: 'quiz-website', title: 'Quiz Website', category: 'web', image: '/images/projects/quiz-website.svg', alt_text: 'Quiz Website interactive learning web application with timed software engineering challenges', live_url: 'https://quiz-website-blush-xi.vercel.app/', display_order: 6 },
      { slug: 'healthcare-website', title: 'Healthcare Website', category: 'web', image: '/images/projects/healthcare-website.svg', alt_text: 'Healthcare Website medical clinic portal with online doctor appointment booking and specialty services', live_url: 'https://healthcare-website-gold.vercel.app/', display_order: 7 },
    ]
    const mobileProjects = [
      { slug: 'cv-maker-app', title: 'CV Maker App', category: 'mobile', description: 'A mobile application for creating and managing professional CVs and resumes with customizable design templates, real-time preview, and high-quality PDF document export.', image: '/images/projects/cv-maker-app.svg', alt_text: 'CV Maker App mobile interface for creating and managing professional resumes and CVs', display_order: 0 },
      { slug: 'predictive-healthcare', title: 'Predictive Healthcare & Recommendation System', category: 'mobile', description: 'A healthcare mobile application built with Flutter that monitors daily vital health metrics, generates risk predictions using machine learning models, and offers personalized clinical wellness recommendations.', image: '/images/projects/predictive-healthcare.svg', alt_text: 'Predictive Healthcare mobile application interface with diagnostic metrics and ML risk assessment', display_order: 1 },
      { slug: 'task-management-mobile', title: 'Task Management Mobile App', category: 'mobile', description: 'A productivity-focused mobile application designed to help users organize daily tasks, set priorities with due-date reminders, track completion metrics, and maintain offline-ready productivity.', image: '/images/projects/task-management.svg', alt_text: 'Task Management mobile application interface with task cards and completion metrics', display_order: 2 },
      { slug: 'musify', title: 'Musify App', category: 'mobile', description: 'A modern mobile music streaming application featuring custom playlist curation, an audio equalizer, interactive sound wave controls, and a high-performance dark audio playback interface.', image: '/images/projects/musify-app.svg', alt_text: 'Musify music playback mobile interface with audio scrubber and playlist controls', display_order: 3 },
      { slug: 'wemuslim', title: 'WeMuslim App', category: 'mobile', description: 'A feature-rich Islamic mobile utility offering precise prayer time notifications, Qibla direction finder, daily Quranic supplications, and an interactive digital Tasbeeh counter.', image: '/images/projects/wemuslim-app.svg', alt_text: 'WeMuslim Islamic mobile utility with digital Tasbeeh counter and prayer times schedule', display_order: 4 },
      { slug: 'pos-coffee-shop', title: 'POS Coffee Shop Inventory Management System', category: 'mobile', description: 'A specialized point-of-sale and stock management mobile solution built for cafe workflows, featuring rapid order processing, inventory thresholds, and digital checkout summaries.', image: '/images/projects/pos-coffee-shop.svg', alt_text: 'POS Coffee Shop inventory management system interface with product catalog and checkout terminal', display_order: 5 },
    ]
    const insertProject = db.prepare(`INSERT INTO projects 
      (slug, title, description, category, image, alt_text, live_url, display_order, published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`)
    webProjects.forEach(p => insertProject.run(p.slug, p.title, p.description || null, p.category, p.image, p.alt_text, p.live_url || null, p.display_order))
    mobileProjects.forEach(p => insertProject.run(p.slug, p.title, p.description || null, p.category, p.image, p.alt_text, p.live_url || null, p.display_order))
    console.log('[DB] Projects seeded.')
  }

  // Documents
  const existingDocs = db.prepare('SELECT COUNT(*) as cnt FROM documents').get()
  if (existingDocs.cnt === 0) {
    const insertDoc = db.prepare(`INSERT INTO documents (title, description, category, file_path, filename, display_order) VALUES (?, ?, ?, ?, ?, ?)`)
    insertDoc.run('Curriculum Vitae', 'Detailed overview of academic coursework, projects, technical skills, and background.', 'cv', '/cv/Urooj_Khadim_CV.pdf', 'Urooj_Khadim_CV.pdf', 0)
    insertDoc.run('Professional Resume', 'Concise, industry-focused summary of development roles, technical competencies, and impact.', 'resume', '/cv/Urooj_Khadim_Resume.pdf', 'Urooj_Khadim_Resume.pdf', 1)
    console.log('[DB] Documents seeded.')
  }

  // Migrate existing messages from messages.json into contact_messages table if empty
  try {
    const existingMsgs = db.prepare('SELECT COUNT(*) as cnt FROM contact_messages').get()
    if (existingMsgs.cnt === 0) {
      const messagesJsonPath = path.join(DATA_DIR, 'messages.json')
      if (fs.existsSync(messagesJsonPath)) {
        const raw = fs.readFileSync(messagesJsonPath, 'utf-8')
        const msgs = JSON.parse(raw || '[]')
        const insertMsg = db.prepare(`INSERT OR IGNORE INTO contact_messages (id, name, email, subject, message, status, client_ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
        msgs.forEach(m => {
          insertMsg.run(m.id, m.name, m.email, m.subject, m.message, 'unread', m.clientIp || null, m.createdAt || new Date().toISOString())
        })
        console.log(`[DB] Migrated ${msgs.length} messages from messages.json.`)
      }
    }
  } catch (err) {
    console.warn('[DB] Messages migration notice:', err.message)
  }
}

// Run seed
try {
  seedDatabase()
  console.log('[DB] Database initialized at', DB_PATH)
} catch (err) {
  console.error('[DB] Seed error:', err.message)
}

export default db
