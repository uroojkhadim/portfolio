import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { Phone, Save, Eye, EyeOff } from 'lucide-react'

export default function Contact() {
  const { get, put } = useApi()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = () => {
    get('/api/admin/contact')
      .then(data => {
        setItems(data)
        setLoading(false)
      })
      .catch(e => {
        toast(e.message, 'error')
        setLoading(false)
      })
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
    setSaving(true)
    try {
      await put('/api/admin/contact', items)
      toast('Contact methods updated successfully!')
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-6">
      <ToastContainer />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Contact & Social Links</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage communication channels, social profiles, and visibility</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200/80 bg-slate-50 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th className="px-5 py-3.5">Method Key</th>
                <th className="px-5 py-3.5">Display Label</th>
                <th className="px-5 py-3.5">Contact Value / Handle</th>
                <th className="px-5 py-3.5">URL / Link Target</th>
                <th className="px-5 py-3.5 text-center">Visibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item, idx) => (
                <tr key={item.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {item.key}
                  </td>
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
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
