import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useThemeAdmin } from '../hooks/useThemeAdmin'
import { useApi } from '../hooks/useApi'
import {
  LayoutDashboard, FolderKanban, Cpu, Briefcase, GraduationCap,
  FileText, Award, User, Phone, Settings, LogOut, Menu, X,
  Sun, Moon, ChevronRight, Inbox
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages / Inbox', icon: Inbox, badgeKey: 'unreadMessages' },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'skills', label: 'Skills', icon: Cpu },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'documents', label: 'My Documents', icon: FileText },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'about', label: 'About / Hero', icon: User },
  { id: 'contact', label: 'Contact & Social', icon: Phone },
  { id: 'settings', label: 'Website Settings', icon: Settings },
]

export default function AdminLayout({ children, currentRoute, onNavigate }) {
  const { user, logout } = useAuth()
  const { get } = useApi()
  const { theme, toggle } = useThemeAdmin()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    const fetchUnread = () => {
      get('/api/admin/messages/stats')
        .then(data => {
          if (mounted && data && typeof data.unread === 'number') {
            setUnreadCount(data.unread)
          }
        })
        .catch(() => {})
    }

    fetchUnread()
    // Poll every 30 seconds for new messages
    const interval = setInterval(fetchUnread, 30000)

    // Listen to custom update event from Messages page
    const handleRefresh = () => fetchUnread()
    window.addEventListener('messages-updated', handleRefresh)

    return () => {
      mounted = false
      clearInterval(interval)
      window.removeEventListener('messages-updated', handleRefresh)
    }
  }, [currentRoute])

  const NavLink = ({ item }) => {
    const Icon = item.icon
    const isActive = currentRoute === item.id
    const badge = item.badgeKey === 'unreadMessages' ? unreadCount : 0

    return (
      <button
        onClick={() => { onNavigate(item.id); setSidebarOpen(false) }}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`}
      >
        <Icon size={17} />
        <span className="flex-1">{item.label}</span>
        {badge > 0 && (
          <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold leading-none ${
            isActive ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white shadow-sm'
          }`}>
            {badge}
          </span>
        )}
        {isActive && !badge && <ChevronRight size={14} className="ml-auto opacity-70" />}
      </button>
    )
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-black text-white shadow-sm">UK</span>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Admin Panel</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{user?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(item => <NavLink key={item.id} item={item} />)}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-slate-200/80 p-3 space-y-1 dark:border-slate-800">
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">
              {NAV_ITEMS.find(n => n.id === currentRoute)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              View Portfolio ↗
            </a>
            <button onClick={toggle} className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
