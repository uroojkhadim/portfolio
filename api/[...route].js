import app from '../server.js'

export default function handler(req, res) {
  // Normalize req.url for Express routing on Vercel
  if (req.query && req.query.route) {
    const routeParts = Array.isArray(req.query.route)
      ? req.query.route.join('/')
      : req.query.route
    const urlObj = new URL(req.url, 'http://localhost')
    urlObj.searchParams.delete('route')
    const qs = urlObj.searchParams.toString()
    req.url = `/api/${routeParts}${qs ? '?' + qs : ''}`
  } else if (!req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url)
  }

  return app(req, res)
}
