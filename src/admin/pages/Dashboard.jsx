import { useEffect, useState } from 'react'
import { useApi } from '../hooks/useApi'
import LoadingSpinner from '../components/LoadingSpinner'
import { FolderKanban, Cpu, Briefcase, FileText, Eye, EyeOff, Inbox, MailOpen } from 'lucide-react'

const StatCard = ({ label, value, icon: Icon, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
  }
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900 dark:text-white">{value ?? '–'}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color] || colors.indigo}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { get } = useApi()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get('/api/admin/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Overview of your portfolio content</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Messages" value={stats?.total_messages} icon={Inbox} color="rose" />
        <StatCard label="Unread Messages" value={stats?.unread_messages} icon={MailOpen} color="indigo" />
        <StatCard label="Total Projects" value={stats?.total_projects} icon={FolderKanban} color="indigo" />
        <StatCard label="Published Projects" value={stats?.published_projects} icon={Eye} color="emerald" />
        <StatCard label="Unpublished" value={stats?.unpublished_projects} icon={EyeOff} color="rose" />
        <StatCard label="Total Skills" value={stats?.total_skills} icon={Cpu} color="violet" />
        <StatCard label="Experience Records" value={stats?.total_experience} icon={Briefcase} color="indigo" />
        <StatCard label="Education Records" value={stats?.total_education} icon={FolderKanban} color="emerald" />
        <StatCard label="Documents" value={stats?.total_documents} icon={FileText} color="violet" />
        <StatCard label="Certificates" value={stats?.total_certificates} icon={FolderKanban} color="rose" />
      </div>

      <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50 to-violet-50/50 p-6 dark:border-indigo-500/20 dark:from-indigo-950/30 dark:to-violet-950/20">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h3>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {[
            { label: '📥 View Inbox Messages', route: 'messages' },
            { label: '+ Add Project', route: 'projects' },
            { label: '+ Add Skill', route: 'skills' },
            { label: '+ Add Experience', route: 'experience' },
            { label: '+ Upload Document', route: 'documents' },
            { label: 'Edit About / Hero', route: 'about' },
            { label: 'Manage Contact', route: 'contact' },
          ].map(a => (
            <button
              key={a.route}
              onClick={() => { window.location.hash = a.route }}
              className="rounded-xl border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-50 dark:border-indigo-500/30 dark:bg-slate-800/80 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
