// Multer file upload configuration
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serverless platforms only allow writes under /tmp; local and Node hosts use ./uploads.
const UPLOADS_DIR = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : process.env.VERCEL
    ? path.join('/tmp', 'portfolio-uploads')
    : path.join(__dirname, '..', '..', 'uploads')
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
} catch (err) {
  console.warn('[Uploads] Could not create upload directory:', err.message)
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
]

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = req.uploadSubdir || ''
    const dir = path.join(UPLOADS_DIR, subdir)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 60)
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e4)}`
    cb(null, `${unique}-${base}${ext}`)
  },
})

function fileFilter(allowedTypes) {
  return (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedTypes.join(', ')}`))
    }
  }
}

export const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
})

export const uploadDoc = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter: fileFilter(ALLOWED_DOC_TYPES),
})

export const UPLOADS_URL_PREFIX = '/uploads'
