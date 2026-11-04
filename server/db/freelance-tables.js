// Freelance content tables (SQL as it will be executed inside db.exec).
// Kept in a plain string so Node does not choke on template literals. The
// /career and /freelance implementations call patchFreelanceTables with an
// existing better-sqlite3 handle.

const CREATE_FREELANCE_TABLES = `
  -- Grouped, curated service offerings shown on the freelancing portfolio
  CREATE TABLE IF NOT EXISTS freelance_service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'Layers',
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Project bucket categories the client referenced (website development,
  -- web applications, mobile applications, digital marketing, graphic design,
  -- other). Admin-managed, shared by the two portfolios when appropriate.
  CREATE TABLE IF NOT EXISTS freelance_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'FolderKanban',
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Genuine client testimonials, managed only in the admin panel. The public
  -- site renders them and hides the section when the table is empty.
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

  -- Optional, admin-managed service packages. Prices live here, never in the
  -- public UI. If a package is unpublished or missing, the site shows
  -- "Request a Custom Quote" instead of inventing a figure.
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

  -- Freelance-facing settings. One place to edit; read by the /freelance SPA;
  -- mirrored into site_settings so admin Settings can also edit them.
  CREATE TABLE IF NOT EXISTS freelancer_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Per-route chatbot overrides. When enabled=1 the assistant answers the
  -- freelancing audience about services, projects, deliverables, hiring and
  -- contact; when disabled, it keeps the career answer set. Unset routes fall
  -- back to the DB-backed knowledge engine.
  CREATE TABLE IF NOT EXISTS chatbot_routes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route TEXT UNIQUE NOT NULL,
    enabled INTEGER DEFAULT 0,
    greeting TEXT,
    suggested_questions TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- When set, every answer is filtered to the current route's audience.
  -- key='mode' = 'route' (audience-filtered) or 'both' (career+freelance).
  CREATE TABLE IF NOT EXISTS chatbot_filter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT
  );
`

const MIGRATE_PROJECTS = `
  -- Give the existing projects table the dual-portfolio visibility columns so
  -- legacy content keeps working unchanged.
  ALTER TABLE projects ADD COLUMN show_in_career INTEGER DEFAULT 1;
  ALTER TABLE projects ADD COLUMN show_in_freelance INTEGER DEFAULT 1;
  UPDATE projects SET show_in_career = CASE published WHEN 1 THEN 1 ELSE 0 END;
  UPDATE projects SET show_in_freelance = CASE published WHEN 1 THEN 1 ELSE 0 END;
`

function patchFreelanceTables(db) {
  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
  ).all().map((r) => r.name)

  const needed = [
    'freelance_service_categories',
    'freelance_categories',
    'testimonials',
    'packages',
    'freelancer_settings',
    'chatbot_routes',
    'chatbot_filter',
  ]
  const missing = needed.filter((t) => !tables.includes(t))
  if (missing.length) {
    db.exec(CREATE_FREELANCE_TABLES)
    console.log(`[DB] Created freelance tables: ${missing.join(', ')}`)
  }

  if (!tables.includes('projects')) {
    db.exec(MIGRATE_PROJECTS)
    console.log('[DB] Created projects visibility columns')
  } else if (
    !tables.includes('show_in_career') ||
    !tables.includes('show_in_freelance')
  ) {
    db.exec(MIGRATE_PROJECTS)
    console.log('[DB] Patched projects visibility columns')
  }

  const existingFilter = db
    .prepare('SELECT COUNT(*) as c FROM chatbot_filter')
    .get().c
  if (!existingFilter) {
    db.prepare("INSERT INTO chatbot_filter (key, value) VALUES ('mode', 'route')").run()
    db.prepare(
      "INSERT INTO chatbot_filter (key, value) VALUES ('career_keywords', 'education,experience,skills,internship,certification,career project,resume,vacancy,hiring')"
    ).run()
    db.prepare(
      "INSERT INTO chatbot_filter (key, value) VALUES ('freelance_keywords', 'service,project,deliverables,technology,hiring,inquiry,budget,deadline')"
    ).run()
    console.log('[DB] Seeded chatbot_filter defaults')
  }
}

function cols(table, dbHandle) {
  const q = dbHandle || db
  return q.prepare(`PRAGMA table_info(${table})`).all().map((r) => r.name)
}

export { patchFreelanceTables, cols }
