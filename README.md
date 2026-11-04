# Urooj Khadim — Developer Portfolio & CMS

A responsive developer portfolio plus a full admin CMS. The public site reads every section from SQLite through the API, and the admin panel edits the same data — no rebuild or code change is needed to publish content updates.

Built with **React 18**, **Vite 6**, **Tailwind CSS**, **Express 5**, and **better-sqlite3**.

---

## Features

### Public site
- Hero, About, Skills, Education, Experience, Projects (web and mobile), Certifications, Services, Resume/CV, and Contact sections.
- Contact form with server-side validation, honeypot/duplicate protection, and rate limiting.
- Floating chatbot grounded in the live CMS data (skills, services, projects, experience, education, contact details, custom knowledge entries).
- Accessible contact links: `mailto:` email, `https://wa.me/923136576128`, LinkedIn, and GitHub. External links open with `rel="noopener noreferrer"`.
- Content is loaded from `/api/public/*`; the bundled data files are only an offline fallback.

### Admin CMS (`/admin`)
- **Overview** — content counts, unread messages, quick actions.
- **Personal Information** — name, title, role, location, availability, profile image, contact details.
- **About Me / Hero** — headings, descriptions, bio, university, degree.
- **Skills**, **Education**, **Experience**, **Projects**, **Certifications**, **Services** — full create/edit/delete, ordering, publishing and file uploads.
- **Messages / Inbox** — full message details, status, search/filter, reply by email, delete, unread badge.
- **Chatbot Knowledge** — custom Q&A entries added to the chatbot's grounded knowledge.
- **Resume / CV Files** — document uploads and metadata.
- **Website Settings** — site identity, SEO, chatbot greeting/suggestions, notification settings.

---

## Tech stack

- **Frontend:** React 18, Vite 6, Tailwind CSS 3, Framer Motion, Lucide icons
- **Backend:** Express 5 (`server.js` locally, a Vercel catch-all function in `api/[...route].js`)
- **Database:** SQLite via `better-sqlite3` at `server/data/portfolio.db`
- **Uploads:** local `uploads/` folder (served at `/uploads`)
- **Auth:** bcrypt password hashing + JWT bearer tokens; all `/api/admin/*` routes are protected
- **Optional integrations:** SMTP email, WhatsApp (Meta Cloud API / Twilio / CallMeBot), Google Gemini

---

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env
```

Run the API/database server and the Vite frontend in two terminals:

```bash
# Terminal 1 — Express API on http://localhost:3000
npm start

# Terminal 2 — Vite frontend on http://localhost:5173
npm run dev
```

- Public site: `http://localhost:5173`
- Admin panel: `http://localhost:5173/admin`
- API health: `http://localhost:3000/api/health`

The Vite dev server proxies `/api` and `/uploads` to port 3000.

### Production build (single server)

```bash
npm run build
npm start
```

Open `http://localhost:3000` and `http://localhost:3000/admin`.

### Admin login

The first run seeds the admin account from `ADMIN_EMAIL` and `ADMIN_DEFAULT_PASSWORD` in `.env`. Change both, and set a unique `JWT_SECRET`, before exposing the site publicly.

```
ADMIN_EMAIL=uroojkhadim505@gmail.com
ADMIN_DEFAULT_PASSWORD=khadim123
```

---

## Data and storage

The SQLite database is the single source of truth for the portfolio:

- **Database:** `server/data/portfolio.db` (git-ignored; created and seeded on first run)
- **Uploads:** `uploads/` (git-ignored; created automatically)
- New contact messages are written to the database **before** a success response is returned.
- Notification delivery is recorded separately. If SMTP or WhatsApp is not configured, the message is still saved and the API reports the notification as `not_configured` instead of claiming it was sent.

Back up `server/data/portfolio.db` and `uploads/` together.

---

## Optional integrations

### Email notifications (SMTP)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_address@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_address@gmail.com
NOTIFY_EMAIL=uroojkhadim505@gmail.com
```

For Gmail, use an App Password, not the account password. Admin replies also require SMTP; without it the inbox still works but reply sending is disabled.

### WhatsApp notifications

Pick one provider in `.env`:

- **Meta Cloud API:** `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_RECIPIENT_PHONE`
- **Twilio:** `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `WHATSAPP_RECIPIENT_PHONE`
- **CallMeBot:** `CALLMEBOT_API_KEY`, `CALLMEBOT_PHONE`

### Gemini chatbot (optional)

Set `GEMINI_API_KEY` to let Gemini phrase replies. Without a key, the deterministic data-grounded engine answers directly from the CMS.

---

## Deployment

### Persistent Node host (recommended)

Render, Railway, Fly.io, a VPS, or any host with a persistent disk:

1. Build with `npm run build`.
2. Run `npm start`.
3. Mount a persistent volume and set `DATA_DIR` and `UPLOADS_DIR` to paths on it.
4. Set `JWT_SECRET`, admin credentials, and optional service keys.

This is the only setup where the inbox, CMS edits, and uploads are fully durable.

### Vercel

`vercel.json` rewrites the public and admin SPAs, and `api/[...route].js` forwards `/api/public/*` and `/api/admin/*` to the Express app. `api/contact.js` and `api/chat.js` remain dedicated functions.

> **Important persistence limitation:** Vercel's filesystem is read-only except `/tmp`, and `/tmp` is per-instance and ephemeral. On Vercel the database is copied to `/tmp/portfolio-data` and uploads go to `/tmp/portfolio-uploads`. Contact messages, CMS edits, and uploaded files can disappear on a cold start and are not shared between instances. The local `server/data/portfolio.db` is git-ignored, so your local content is not shipped either — the deployed instance starts from the seed data.
>
> Use Vercel for a read-only/seed-content preview only. For a working CMS inbox in production, deploy to a host with a persistent disk or migrate storage to a hosted database and object storage.

---

## API overview

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Health check |
| `POST` | `/api/contact` | No | Validate, persist and notify a contact message |
| `POST` | `/api/chat` | No | Answer a portfolio question from CMS data |
| `GET` | `/api/public/*` | No | Published content for the public site |
| `POST` | `/api/admin/login` | No | Admin login, returns JWT |
| `GET/POST/PUT/DELETE` | `/api/admin/*` | Bearer JWT | CMS CRUD, inbox, uploads, settings |

---

## Project structure

```
portfolio/
├── api/
│   ├── [...route].js        # Vercel catch-all for Express CMS routes
│   ├── chat.js              # Chatbot endpoint
│   └── contact.js           # Contact endpoint
├── server/
│   ├── db.js                # Schema, migrations and seed data
│   ├── routes/              # public, auth and admin routers
│   ├── services/            # storage, email, WhatsApp, chatbot knowledge
│   └── data/portfolio.db    # SQLite database (git-ignored)
├── src/
│   ├── admin/               # Admin app, layout, pages and auth context
│   ├── components/          # Public sections, chatbot and shared UI
│   ├── context/             # Public data provider
│   └── data/                # Offline fallback content
├── uploads/                 # Uploaded images/documents (git-ignored)
├── server.js                # Express production server
└── vite.config.js
```

## License

MIT License © Urooj Khadim
