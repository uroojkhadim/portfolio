import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import { Phone, Save, Eye, EyeOff, Plus, Trash2, X } from 'lucide-react'

const EMPTY_NEW = { key: '', label: '', value: '', href: '', visible: 1 }

export default function Contact() {
  const { get, put, post, del } = useApi()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const load = () => {
    get('/api/admin/contact')
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(error => { toast(error.message, 'error'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const handleChange = (index, field, value) => {
    setItems(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const toggleVisible = (index) => {
    setItems(prev => {
      const copy = [...prev]
      copy[index] = { ...copy[index], visible: copy[index].visible ? 0 : 1 }
      return copy
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await put('/api/admin/contact', items)
      toast('Contact methods and social links saved. The public site updates immediately.')
      load()
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAdd = async () => {
    if (!adding?.label?.trim() || !adding?.value?.trim()) {
      toast('A label and value are required.', 'error')
      return
    }
    try {
      await post('/api/admin/contact', {
        key: adding.key,
        label: adding.label,
        value: adding.value,
        href: adding.href,
        visible: adding.visible ? 1 : 0,
      })
      toast('Contact method added.')
      setAdding(null)
      load()
    } catch (error) {
      toast(error.message, 'error')
    }
  }

  const handleDelete = async (key) => {
    try {
      await del(`/api/admin/contact/${encodeURIComponent(key)}`)
      toast('Contact method deleted.')
      load()
    } catch (error) {
      toast(error.message, 'error')
    }
    setConfirm(null)
  }

  if (loading) return <LoadingSpinner size="lg" />

  // Auto-build a href suggestion for a new item.
  const suggestHref = (key, value) => {
    const normalizedKey = (key || '').toLowerCase()
    const trimmed = (value || '').trim()
    if (!trimmed) return ''
    if (normalizedKey.includes('mail') || trimmed.includes('@')) return `mailto:${trimmed}`
    if (normalizedKey.includes('whatsapp') || normalizedKey.includes('wa')) return `https://wa.me/${trimmed.replace(/\D/g, '')}`
    if (normalizedKey.includes('phone') || normalizedKey.includes('tel')) return `tel:${trimmed.replace(/[^\d+]/g, '')}`
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (normalizedKey.includes('linkedin')) return `https://www.linkedin.com/in/${trimmed.replace(/^@/, '')}`
    if (normalizedKey.includes('github')) return `https://github.com/${trimmed.replace(/^@/, '')}`
    return `https://${trimmed}`
  }

  return (
    <div className="space-y-6">
      <ToastContainer />
      <ConfirmDialog
        open={!!confirm}
        title="Delete Contact Method?"
        message={`"${confirm?.label || confirm?.key}" will be removed from the public portfolio.`}
        onConfirm={() => handleDelete(confirm?.key)}
        onCancel={() => setConfirm(null)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Contact &amp; Social Links</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every visible item becomes a working link on the public site — email, WhatsApp, phone and social profiles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdding({ ...EMPTY_NEW })}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Plus size={16} /> Add Link
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {adding && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-500/30 dark:bg-indigo-950/20">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">New contact or social link</h3>
            <button onClick={() => setAdding(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white dark:hover:bg-slate-800" aria-label="Close add form">
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="text"
              placeholder="Key (e.g. twitter)"
              value={adding.key}
              onChange={e => setAdding(prev => ({ ...prev, key: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Label (e.g. X / Twitter)"
              value={adding.label}
              onChange={e => setAdding(prev => ({ ...prev, label: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Value or handle"
              value={adding.value}
              onChange={e => {
                const value = e.target.value
                setAdding(prev => ({
                  ...prev,
                  value,
                  href: prev.href && prev.href !== suggestHref(prev.key, prev.value) ? prev.href : suggestHref(prev.key || prev.label, value),
                }))
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Full URL / mailto / wa.me"
              value={adding.href}
              onChange={e => setAdding(prev => ({ ...prev, href: e.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Add Link
            </button>
            <label className="ml-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={!!adding.visible}
                onChange={e => setAdding(prev => ({ ...prev, visible: e.target.checked ? 1 : 0 }))}
                className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600"
              />
              Visible on public site
            </label>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th className="px-5 py-3.5">Method Key</th>
                <th className="px-5 py-3.5">Display Label</th>
                <th className="px-5 py-3.5">Contact Value / Handle</th>
                <th className="px-5 py-3.5">URL / Link Target</th>
                <th className="px-5 py-3.5 text-center">Visibility</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, idx) => (
                <tr key={item.key} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">{item.key}</td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={item.label || ''}
                      onChange={e => handleChange(idx, 'label', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={item.value || ''}
                      onChange={e => handleChange(idx, 'value', e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </td>
                  <td className="px-5 py-3">
                    <input
                      type="text"
                      value={item.href || ''}
                      placeholder="mailto:..., tel:..., https://..."
                      onChange={e => handleChange(idx, 'href', e.target.value)}
                      className="w-full min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => toggleVisible(idx)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                        item.visible
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {item.visible ? <><Eye size={13} /> Visible</> : <><EyeOff size={13} /> Hidden</>}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => setConfirm(item)}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      aria-label={`Delete ${item.label || item.key}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
        <Phone size={15} className="mt-0.5 shrink-0 text-indigo-500" />
        <p>
          Use <code className="rounded bg-white px-1 py-0.5 text-[11px] dark:bg-slate-800">mailto:</code> for email,
          <code className="ml-1 rounded bg-white px-1 py-0.5 text-[11px] dark:bg-slate-800">https://wa.me/923136576128</code> for WhatsApp,
          and full <code className="mx-1 rounded bg-white px-1 py-0.5 text-[11px] dark:bg-slate-800">https://</code> URLs for social profiles.
        </p>
      </div>
    </div>
  )
}
