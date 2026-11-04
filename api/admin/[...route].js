import app from '../../server.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req, res) {
  const routeParts = req.query?.route
  const routePath = Array.isArray(routeParts)
    ? routeParts.join('/')
    : typeof routeParts === 'string'
      ? routeParts
      : ''
  const url = new URL(req.url, 'http://localhost')
  url.searchParams.delete('route')
  const query = url.searchParams.toString()
  const path = routePath
    ? `/api/admin/${routePath}`
    : url.pathname.startsWith('/api/admin/')
      ? url.pathname
      : '/api/admin'

  req.url = `${path}${query ? `?${query}` : ''}`
  return app(req, res)
}
