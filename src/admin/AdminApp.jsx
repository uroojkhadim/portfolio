import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Skills from './pages/Skills'
import Experience from './pages/Experience'
import Education from './pages/Education'
import Documents from './pages/Documents'
import Certificates from './pages/Certificates'
import About from './pages/About'
import Contact from './pages/Contact'
import Settings from './pages/Settings'
import Messages from './pages/Messages'
import AdminLayout from './components/AdminLayout'
import LoadingSpinner from './components/LoadingSpinner'

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '') || 'dashboard'
  return hash
}

function AdminRouter() {
  const { isAuthenticated, loading } = useAuth()
  const [route, setRoute] = useState(getRoute())

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Login />
  }

  const renderPage = () => {
    switch (route) {
      case 'dashboard': return <Dashboard />
      case 'messages': return <Messages />
      case 'projects': return <Projects />
      case 'skills': return <Skills />
      case 'experience': return <Experience />
      case 'education': return <Education />
      case 'documents': return <Documents />
      case 'certificates': return <Certificates />
      case 'about': return <About />
      case 'contact': return <Contact />
      case 'settings': return <Settings />
      default: return <Dashboard />
    }
  }

  return (
    <AdminLayout currentRoute={route} onNavigate={r => { window.location.hash = r }}>
      {renderPage()}
    </AdminLayout>
  )
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <AdminRouter />
    </AuthProvider>
  )
}
