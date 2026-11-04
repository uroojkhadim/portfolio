import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { Save, MailCheck, MailX } from 'lucide-react'

const DEFAULTS = {
  site_title: '',
  site_description: '',
  footer_text: '',
  copyright_name: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  navbar_brand: '',
}

export default function Settings() {
  const { get, put } = useApi()
  const [settings, setSettings] = useState(DEFAULTS)
  const [emailInfo, setEmailInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      get('/api/admin/settings'),
      get('/api/admin/system-status').catch(() => null),
    ])
      .then(([data, status]) => {
        if (data) setSettings(prev => ({ ...prev, ...data }))
        setEmailInfo(status?.email || { configured: false })
      })
      .catch(error => toast(error.message, 'error'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (field, value) => setSettings(prev => ({ ...prev, [field]: value }))

  const handleSave = async (event) => {
    if (event?.preventDefault) event.preventDefault()
    setSaving(true)
    try {
      await put('/api/admin/settings', settings)
      toast('Website settings saved. The public site picks them up on next load.')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  return (
    <div className="space-y-6">
      <ToastContainer />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Website Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Global branding, footer text and search engine metadata</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 font-display text-base font-bold text-slate-900 dark:text-white">Branding & Titles</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Website Title</label>
              <input type="text" value={settings.site_title || ''} onChange={e => handleChange('site_title', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Site Tagline / Description</label>
              <textarea rows={2} value={settings.site_description || ''} onChange={e => handleChange('site_description', e.target.value)} className={`${fieldClass} resize-none`} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Navbar Brand Name</label>
              <input type="text" value={settings.navbar_brand || ''} onChange={e => handleChange('navbar_brand', e.target.value)} className={fieldClass} placeholder="Urooj Khadim" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 font-display text-base font-bold text-slate-900 dark:text-white">Footer Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Copyright Holder Name</label>
              <input type="text" value={settings.copyright_name || ''} onChange={e => handleChange('copyright_name', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Footer Tagline</label>
              <input type="text" value={settings.footer_text || ''} onChange={e => handleChange('footer_text', e.target.value)} className={fieldClass} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 font-display text-base font-bold text-slate-900 dark:text-white">Search Engine Optimization (SEO)</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">SEO Meta Title</label>
              <input type="text" value={settings.seo_title || ''} onChange={e => handleChange('seo_title', e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">SEO Meta Description</label>
              <textarea rows={2} value={settings.seo_description || ''} onChange={e => handleChange('seo_description', e.target.value)} className={`${fieldClass} resize-none`} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Keywords (comma-separated)</label>
              <input type="text" value={settings.seo_keywords || ''} onChange={e => handleChange('seo_keywords', e.target.value)} placeholder="Software Engineer, React Developer, Full Stack, Pakistan" className={fieldClass} />
            </div>
          </div>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-1 font-display text-base font-bold text-slate-900 dark:text-white">Contact Form Email Notifications</h3>
        <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
          Messages are always saved to the inbox first. Email delivery depends on SMTP being configured in the server environment.
        </p>
        {!emailInfo ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Email status unavailable.</p>
        ) : emailInfo.configured ? (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <MailCheck size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">SMTP is configured</p>
              <p className="mt-0.5 text-xs">New submissions are also emailed to {emailInfo.notifyTo || 'the admin address'}.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            <MailX size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Email notifications are not configured</p>
              <p className="mt-0.5 text-xs leading-relaxed">
                Messages still save and appear in the inbox, but no email is sent. Set SMTP_HOST, SMTP_PORT, SMTP_USER,
                SMTP_PASS and ADMIN_EMAIL in the server environment (for example a free Brevo or Gmail app-password account)
                and restart the server. The contact form will report honestly whether the notification was delivered.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
