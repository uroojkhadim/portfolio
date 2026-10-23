import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import LoadingSpinner from '../components/LoadingSpinner'
import { User, Save, Upload } from 'lucide-react'

export default function About() {
  const { get, apiFetch } = useApi()
  const [data, setData] = useState({
    name: '',
    title: '',
    role: '',
    bio: '',
    hero_heading: '',
    hero_description: '',
    availability_status: '',
    availability_active: 1,
    profile_image: '',
    university: '',
    degree: '',
    location: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    get('/api/admin/about')
      .then(res => {
        if (res && res.name !== undefined) {
          setData(res)
          if (res.profile_image) setPreviewUrl(res.profile_image)
        }
        setLoading(false)
      })
      .catch(e => {
        toast(e.message, 'error')
        setLoading(false)
      })
  }, [])

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.keys(data).forEach(key => {
        if (key !== 'profile_image') {
          fd.append(key, data[key] ?? '')
        }
      })
      if (selectedImage) {
        fd.append('profile_image', selectedImage)
      } else if (data.profile_image) {
        fd.append('profile_image', data.profile_image)
      }

      const res = await apiFetch('/api/admin/about', {
        method: 'PUT',
        body: fd
      })
      if (res.profile_image) {
        setData(prev => ({ ...prev, profile_image: res.profile_image }))
      }
      toast('About content updated successfully!')
    } catch (err) {
      toast(err.message, 'error')
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
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">About & Hero Section</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage headline, bio, profile image, and personal bio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section Banner */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">Hero Section Content</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Hero Heading</label>
              <input
                type="text"
                value={data.hero_heading || ''}
                onChange={e => handleChange('hero_heading', e.target.value)}
                placeholder="e.g. Turning Complex Challenges Into Seamless Digital Realities."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Hero Description / Subtitle</label>
              <textarea
                rows={3}
                value={data.hero_description || ''}
                onChange={e => handleChange('hero_description', e.target.value)}
                placeholder="Primary hero paragraph introducing your background and expertise..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Availability Status Text</label>
                <input
                  type="text"
                  value={data.availability_status || ''}
                  onChange={e => handleChange('availability_status', e.target.value)}
                  placeholder="e.g. Available for Full-Time & High-Impact Contracts"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="availability_active"
                  checked={!!data.availability_active}
                  onChange={e => handleChange('availability_active', e.target.checked ? 1 : 0)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="availability_active" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show Available Badge</label>
              </div>
            </div>
          </div>
        </div>

        {/* Profile & Biography */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">Personal Details & Bio</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-2">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-indigo-500/20 bg-slate-100 dark:bg-slate-800">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <User size={36} />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">Change Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:text-slate-300 dark:file:bg-indigo-500/15 dark:file:text-indigo-300"
                />
                <p className="mt-1 text-[11px] text-slate-500">Supports PNG, JPG, or WebP. Transparent background recommended.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={data.name || ''}
                  onChange={e => handleChange('name', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Professional Title</label>
                <input
                  type="text"
                  value={data.title || ''}
                  onChange={e => handleChange('title', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Role Subheading</label>
                <input
                  type="text"
                  value={data.role || ''}
                  onChange={e => handleChange('role', e.target.value)}
                  placeholder="e.g. Full-Stack Software Engineer"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Location</label>
                <input
                  type="text"
                  value={data.location || ''}
                  onChange={e => handleChange('location', e.target.value)}
                  placeholder="e.g. Islamabad, Pakistan"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">University</label>
                <input
                  type="text"
                  value={data.university || ''}
                  onChange={e => handleChange('university', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Degree</label>
                <input
                  type="text"
                  value={data.degree || ''}
                  onChange={e => handleChange('degree', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Detailed Biography</label>
              <textarea
                rows={4}
                value={data.bio || ''}
                onChange={e => handleChange('bio', e.target.value)}
                placeholder="Full biography for the About section..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
