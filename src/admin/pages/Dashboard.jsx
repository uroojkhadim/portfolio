import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  FolderKanban, Cpu, Briefcase, Award, Inbox, MailOpen,
  Wrench, Bot, GraduationCap,
} from 'lucide-react'

const STAT_STYLES = {
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400',
}

const StatCard = ({ label, value, icon: Icon, color = 'indigo', hint }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{value ?? 0}</p>
        {hint && <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${STAT_STYLES[color] || STAT_STYLES.indigo}`}>
        <Icon size={22} />
      </div>
    </div>
  </div>
)

export default function Dashboard() {
  const { get } = useApi()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    get('/api/admin/stats')
      .then(data => { setStats(data); setError('') })
      .catch(err => setError(err.message || 'Could not load dashboard statistics'))
      .finally(() => setLoading(false))
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
        <button
          onClick={load}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Refresh stats
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Projects" value={stats?.total_projects} icon={FolderKanban} color="indigo" hint={`${stats?.published_projects ?? 0} published`} />
        <StatCard label="Total Skills" value={stats?.total_skills} icon={Cpu} color="violet" />
        <StatCard label="Experience Entries" value={stats?.total_experience} icon={Briefcase} color="emerald" />
        <StatCard label="Certifications" value={stats?.total_certificates} icon={Award} color="amber" />
        <StatCard label="Contact Messages" value={stats?.total_messages} icon={Inbox} color="rose" hint="All submissions saved in the inbox" />
        <StatCard label="Unread Messages" value={stats?.unread_messages} icon={MailOpen} color="indigo" hint={stats?.unread_messages > 0 ? 'Open the inbox to respond' : 'Inbox is clear'} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Services" value={stats?.total_services} icon={Wrench} color="emerald" />
        <StatCard label="Chatbot Entries" value={stats?.total_chatbot_entries} icon={Bot} color="violet" />
        <StatCard label="Education Records" value={stats?.total_education} icon={GraduationCap} color="indigo" />
        <StatCard label="Published Projects" value={stats?.published_projects} icon={FolderKanban} color="emerald" />
      </div>

      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-violet-50/50 p-6 dark:border-indigo-500/20 dark:from-indigo-950/30 dark:to-violet-950/20">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {[
            { label: '📥 Open Inbox', route: 'messages' },
            { label: '+ Add Project', route: 'projects' },
            { label: '+ Add Service', route: 'services' },
            { label: 'Edit Personal Info', route: 'personal' },
            { label: 'Edit About / Hero', route: 'about' },
            { label: 'Manage Social Links', route: 'contact' },
            { label: 'Chatbot Knowledge', route: 'chatbot' },
            { label: 'Upload Resume / CV', route: 'documents' },
            { label: 'Website Settings', route: 'settings' },
          ].map(action => (
            <button
              key={action.route + action.label}
              onClick={() => { window.location.hash = action.route }}
              className="rounded-xl border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-slate-800/80 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
