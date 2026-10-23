import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) return null
        const text = await r.text()
        try { return JSON.parse(text) } catch { return null }
      })
      .then(data => {
        if (data?.user) { setUser(data.user) }
        else { setToken(null); localStorage.removeItem('admin_token') }
      })
      .catch(() => { setToken(null); localStorage.removeItem('admin_token') })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (email, password) => {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const text = await res.text()
    let data = {}
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: res.ok ? 'Invalid response from server' : `Server error (${res.status}): ${res.statusText || 'Unable to connect to login API.'}` }
    }

    if (!res.ok) throw new Error(data.error || `Login failed (${res.status}).`)
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('admin_token', data.token)
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('admin_token')
    window.location.hash = 'login'
  }

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token && !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be within AuthProvider')
  return ctx
}
