import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Dashboard() {
  const { get } = useApi()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [segment, setSegment] = useState('all')

  // Load stats with a route-aware fallback so the route-scoped CMS panels work.
  // Tries /api/admin/stats, then /api/admin/stats/career, then /api/admin/stats/freelance.
  const load = () => {
    setLoading(true)
    const seg = segment === 'all' ? '' : '/' + segment
    const tryPath = () =>
      fetch('/api/admin/stats' + seg, { headers: { Authorization: 'Bearer ' + user.token } })
        .then(r => (r.status === 404 ? null : r.json()))
        .then(data => {
          if (data && data.error) throw new Error(data.error)
          setStats(data)
          setError('')
        })
        .catch(() => get('/api/admin/stats'))
        .catch(err => setError(err.message || 'Could not load dashboard statistics'))
    tryPath()
    // Poll every 30s so stats refresh when messages arrive
    setInterval(tryPath, 30000)
  }

  useEffect(() => { load() }, [])

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Everything on your public portfolio, managed from one place
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`px-3 py-1.5 text-sm rounded border ${
              segment === 'all'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => setSegment('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded border ${
              segment === 'career'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => setSegment('career')}
          >
            Career
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded border ${
              segment === 'freelance'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            onClick={() => setSegment('freelance')}
          >
            Freelance
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-rose-600 dark:text-rose-400">{error}</div>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Projects" value={stats?.total_projects} icon={FolderKanban} color="indigo" />
        <StatCard label="Total Skills" value={stats?.total_skills} icon={Cpu} color="violet" />
        <StatCard label="Experience Entries" value={stats?.total_experience} icon={Briefcase} color="emerald" />
        <StatCard label="Certifications" value={stats?.total_certificates} icon={Award} color="amber" />
        <StatCard label="Contact Messages" value={stats?.total_messages} icon={Inbox} color="rose" />
        <StatCard label="Unread Messages" value={stats?.unread_messages} icon={MailOpen} color="indigo" hint={stats?.unread_messages > 0 ? 'Open the inbox to respond' : 'Inbox is clear'} />
        <StatCard label="Services" value={stats?.total_services} icon={Wrench} color="emerald" />
        <StatCard label="Chatbot Entries" value={stats?.total_chatbot_entries} icon={Bot} color="violet" />
        <StatCard label="Published Projects" value={stats?.published_projects} icon={Box} color="emerald" />
        <StatCard label="Unpublished Projects" value={stats?.unpublished_projects} icon={FileQuestion} color="amber" />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, hint }) {
  const colorMap = {
    indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400',
    violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  }
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        <Icon size={16} />
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colorMap[color] || colorMap.indigo}`}>
          <Icon size={18} />
        </span>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{value ?? 0}</span>
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  )
}
