import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { User, Save, Upload, Mail, Phone, MessageCircle, FileText, ExternalLink } from 'lucide-react'

const EMPTY_ABOUT = {
  name: '',
  title: '',
  role: '',
  location: '',
  profile_image: '',
  availability_status: '',
  availability_active: 1,
}

export default function Personal() {
  const { get, put, apiFetch } = useApi()
  const [about, setAbout] = useState(EMPTY_ABOUT)
  const [contactItems, setContactItems] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  const load = async () => {
    try {
      const [aboutRes, contactRes, docsRes] = await Promise.all([
        get('/api/admin/about'),
        get('/api/admin/contact'),
        get('/api/admin/documents'),
      ])
      if (aboutRes && Object.keys(aboutRes).length) {
        setAbout({ ...EMPTY_ABOUT, ...aboutRes })
        setPreviewUrl(aboutRes.profile_image || '')
      }
      setContactItems(Array.isArray(contactRes) ? contactRes : [])
      setDocuments(Array.isArray(docsRes) ? docsRes : [])
    } catch (err) {
      toast(err.message || 'Failed to load personal information', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const setField = (field, value) => setAbout(prev => ({ ...prev, [field]: value }))

  const updateContactValue = (key, value) => {
    setContactItems(prev => prev.map(item => {
      if (item.key !== key) return item
      let href = item.href
      if (key === 'email') href = value ? `mailto:${value}` : null
      if (key === 'phone') href = value ? `tel:${String(value).replace(/[^\d+]/g, '')}` : null
      if (key === 'whatsapp') {
        const digits = String(value).replace(/\D/g, '')
        const existingQuery = (item.href || '').split('?')[1]
        href = digits ? `https://wa.me/${digits}${existingQuery ? `?${existingQuery}` : ''}` : null
      }
      return { ...item, value, href }
    }))
  }

  const contactValue = (key) => contactItems.find(item => item.key === key)?.value || ''

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSave = async () => {
    if (!about.name.trim()) {
      toast('Full name is required', 'error')
      return
    }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', about.name || '')
      fd.append('title', about.title || '')
      fd.append('role', about.role || '')
      fd.append('location', about.location || '')
      fd.append('availability_status', about.availability_status || '')
      fd.append('availability_active', about.availability_active ? '1' : '0')
      if (selectedImage) fd.append('profile_image', selectedImage)

      const aboutRes = await apiFetch('/api/admin/about', { method: 'PUT', body: fd })
      await put('/api/admin/contact', contactItems)

      setAbout(prev => ({ ...prev, profile_image: aboutRes.profile_image || prev.profile_image }))
      setPreviewUrl(aboutRes.profile_image || previewUrl)
      setSelectedImage(null)
      toast('Personal information saved and published.')
    } catch (err) {
      toast(err.message || 'Save failed', 'error')
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
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Personal Information</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Identity, profile photo, contact details and CV links used across the public site
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-display text-base font-bold text-slate-900 dark:text-white">Profile</h3>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-indigo-500/20 bg-slate-100 dark:bg-slate-800">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">
                <User size={36} />
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Profile Image</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              <Upload size={14} />
              Choose image
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">PNG, JPG or WebP up to 10 MB.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { key: 'name', label: 'Full Name', placeholder: 'Urooj Khadim' },
            { key: 'title', label: 'Professional Title', placeholder: 'Software Engineering Student' },
            { key: 'role', label: 'Role Subheading', placeholder: 'Full Stack / Web & Mobile Developer' },
            { key: 'location', label: 'Location', placeholder: 'Vehari, Pakistan' },
          ].map(field => (
            <div key={field.key}>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">{field.label}</label>
              <input
                type="text"
                value={about[field.key] || ''}
                onChange={event => setField(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Availability Badge</label>
            <input
              type="text"
              value={about.availability_status || ''}
              onChange={event => setField('availability_status', event.target.value)}
              placeholder="Available for Remote Roles & Internships"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="personal_available"
              checked={!!about.availability_active}
              onChange={event => setField('availability_active', event.target.checked ? 1 : 0)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="personal_available" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Show availability badge on the hero
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-display text-base font-bold text-slate-900 dark:text-white">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Mail size={13} /> Email Address
            </label>
            <input
              type="email"
              value={contactValue('email')}
              onChange={event => updateContactValue('email', event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Phone size={13} /> Phone Number
            </label>
            <input
              type="tel"
              value={contactValue('phone')}
              onChange={event => updateContactValue('phone', event.target.value)}
              placeholder="+92 313 6576128"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <MessageCircle size={13} /> WhatsApp Number
            </label>
            <input
              type="tel"
              value={contactValue('whatsapp')}
              onChange={event => updateContactValue('whatsapp', event.target.value)}
              placeholder="+92 313 6576128"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              Saved as an international wa.me link. Social profiles are managed in Contact &amp; Social.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">Resume / CV Files</h3>
          <button
            onClick={() => { window.location.hash = 'documents' }}
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Manage uploads →
          </button>
        </div>
        {documents.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{doc.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {doc.category?.toUpperCase()} · {doc.filename || doc.file_path || 'No file'}
                    </p>
                  </div>
                </div>
                {doc.file_path && (
                  <a
                    href={doc.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <ExternalLink size={12} /> Open
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
