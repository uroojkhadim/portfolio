import { useAuth } from '../context/AuthContext'

export function useApi() {
  const { token, logout } = useAuth()

  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    }
    // Don't set Content-Type for FormData (let browser set boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(url, { ...options, headers })
    if (res.status === 401) { logout(); throw new Error('Session expired. Please log in again.') }
    
    const text = await res.text()
    let data = {}
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: res.ok ? 'Invalid response from server' : `Server responded with ${res.status}: ${res.statusText || 'Not Found'}` }
    }

    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
    return data
  }

  const get = (url) => apiFetch(url)
  const post = (url, body) => apiFetch(url, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) })
  const put = (url, body) => apiFetch(url, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) })
  const del = (url) => apiFetch(url, { method: 'DELETE' })

  return { get, post, put, del, apiFetch }
}
