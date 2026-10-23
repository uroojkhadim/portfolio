import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { Settings as SettingsIcon, Save } from 'lucide-react'

export default function Settings() {
  const { get, put } = useApi()
  const [settings, setSettings] = useState({
    siteTitle: '',
    siteDescription: '',
    footerText: '',
    copyrightName: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    get('/api/admin/settings')
      .then(data => {
        if (data) {
          setSettings(prev => ({ ...prev, ...data }))
        }
        setLoading(false)
      })
      .catch(e => {
        toast(e.message, 'error')
        setLoading(false)
      })
  }, [])

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await put('/api/admin/settings', settings)
      toast('Global settings updated successfully!')
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
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Website Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure global metadata, branding, and search engine optimization</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Branding */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">Branding & Titles</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Website Title</label>
              <input
                type="text"
                value={settings.siteTitle || ''}
                onChange={e => handleChange('siteTitle', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Site Tagline / Description</label>
              <textarea
                rows={2}
                value={settings.siteDescription || ''}
                onChange={e => handleChange('siteDescription', e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer Details */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">Footer Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Copyright Holder Name</label>
              <input
                type="text"
                value={settings.copyrightName || ''}
                onChange={e => handleChange('copyrightName', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Footer Tagline</label>
              <input
                type="text"
                value={settings.footerText || ''}
                onChange={e => handleChange('footerText', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* SEO Metadata */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">Search Engine Optimization (SEO)</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">SEO Meta Title</label>
              <input
                type="text"
                value={settings.seoTitle || ''}
                onChange={e => handleChange('seoTitle', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">SEO Meta Description</label>
              <textarea
                rows={2}
                value={settings.seoDescription || ''}
                onChange={e => handleChange('seoDescription', e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Keywords (comma-separated)</label>
              <input
                type="text"
                value={settings.seoKeywords || ''}
                onChange={e => handleChange('seoKeywords', e.target.value)}
                placeholder="Software Engineer, React Developer, Full Stack, Pakistan"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
