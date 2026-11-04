// Freelance content tables
// - freelance_service_categories: grouped, curated service offerings shown on the
//   freelancing portfolio (e.g. "Web & App Development", "Digital Marketing").
// - freelance_categories: flexible tags used to bucket projects into the six
//   portfolio categories requested by the client (Website Development, Web
//   Applications, Mobile Applications, Digital Marketing, Graphic Design,
//   Other).
// - testimonials: genuine client reviews managed in the admin panel. The
//   chatbot renders them and the public site hides the section when empty.
// - packages: optional, admin-managed service packages (no hardcoded prices).
// - freelancer_settings: shared freelancer-facing settings (hero headline,
//   description, contact hints, FAQ, process steps) — edited once, used by the
//   /freelance SPA, and mirrored back to site_settings so the admin panel can
//   edit them on the Settings page without a second DB write.
// - chatbot_routes: optional per-route chat overrides. When set, the chatbot
//   answers the freelancing audience's questions about services, projects,
//   deliverables and hiring on /freelance; on /career it answers about
//   education, experience, skills, internships, certifications and career
//   projects. Unset values fall back to the DB-backed knowledge engine.
// - chatbot_filter: when 'route' every answer is filtered to the current
//   route's audience; 'both' means every answer can mention career or
//   freelancing data.

const CREATE_FREELANCE_TABLES = `
  -- Grouped service offerings shown on the freelancing portfolio
  CREATE TABLE IF NOT EXISTS freelance_service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'Layers',
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Flexible project bucket categories (the six portfolio categories)
  CREATE TABLE IF NOT EXISTS freelance_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'FolderKanban',
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Genuine client testimonials (admin-managed). The site hides the
  -- testimonials section when no genuine entry exists.
  CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    client_role TEXT,
    client_company TEXT,
    quote TEXT NOT NULL,
    relation TEXT DEFAULT 'Client',
    sentiment TEXT DEFAULT 'Trusted',
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Optional, admin-managed service packages. Prices are stored here, never
  // hardcoded in the public UI. If a package is unpublished or missing, the
  // public site shows "Request a Custom Quote" instead.
  CREATE TABLE IF NOT EXISTS packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER,
    service_title TEXT,
    title TEXT NOT NULL,
    description TEXT,
    price INTEGER,
    price_period TEXT,
    features TEXT,
    call_to_action TEXT DEFAULT 'Get a Custom Quote',
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Freelance-facing site settings (hero headline, description, CTA, process,
  -- FAQ). One place to edit, read by the /freelance SPA, and mirrored into
  -- site_settings so the admin Settings page can also edit them.
  CREATE TABLE IF NOT EXISTS freelancer_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Chatbot route routing / filtering options
  CREATE TABLE IF NOT EXISTS chatbot_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route TEXT UNIQUE NOT NULL,
    enabled INTEGER DEFAULT 0,
    greeting TEXT,
    suggested_questions TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- When enabled='1' the chatbot filters every answer to the current route's
  -- audience: /career -> education, experience, skills, internships,
  -- certifications, career projects; /freelance -> services, projects,
  -- deliverables, process, hiring/contact.
  CREATE TABLE IF NOT EXISTS chatbot_filter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );
`

const MIGRATE_PROJECTS = `
  -- Port the original published projects into the dual-portfolio visibility
  -- columns so the site lands with at least one project in each audience.
  ALTER TABLE projects ADD COLUMN show_in_career INTEGER DEFAULT 1;
  ALTER TABLE projects ADD COLUMN show_in_freelance INTEGER DEFAULT 1;
  UPDATE projects SET show_in_career = CASE published WHEN 1 THEN 1 ELSE 0 END;
  UPDATE projects SET show_in_freelance = CASE published WHEN 1 THEN 1 ELSE 0 END;
`

function patchSchema(db) {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(r => r.name)
  const needed = [
    'freelance_service_categories',
    'freelance_categories',
    'testimonials',
    'packages',
    'freelancer_settings',
    'chatbot_routes',
    'chatbot_filter',
  ]
  const missing = needed.filter(t => !tables.includes(t))
  if (missing.length) {
    db.exec(CREATE_FREELANCE_TABLES)
    console.log(`[DB] Created freelance tables: ${missing.join(', ')}`)
  }

  if (!tables.includes('projects')) {
    db.exec(MIGRATE_PROJECTS)
    console.log('[DB] Created projects visibility columns')
  } else if (!cols('projects').includes('show_in_career') || !cols('projects').includes('show_in_freelance')) {
    db.exec(MIGRATE_PROJECTS)
    console.log('[DB] Patched projects visibility columns')
  }

  

function cols(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map(r => r.name)
}

export { CREATE_FREELANCE_TABLES, MIGRATE_PROJECTS, patchSchema, cols }
