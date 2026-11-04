import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Plus, Pencil, Trash2, Eye, EyeOff, Briefcase } from 'lucide-react'

const ICON_OPTIONS = [
  'Globe2', 'Smartphone', 'Layout', 'TrendingUp', 'Share2',
  'Search', 'Target', 'Palette', 'ShieldCheck', 'Code2',
]

const EMPTY_SERVICE = {
  title: '',
  description: '',
  icon_name: 'Code2',
  technologies: '',
  availability: 'Available',
  display_order: 0,
  published: true,
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900" onClick={event => event.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Services() {
  const { get, post, put, del } = useApi()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    get('/api/admin/services')
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(err => { toast(err.message, 'error'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openAdd = () => setModal({ mode: 'add', data: { ...EMPTY_SERVICE } })
  const openEdit = (service) => setModal({
    mode: 'edit',
    data: { ...service, technologies: Array.isArray(service.technologies) ? service.technologies.join(', ') : (service.technologies || '') },
  })
  const closeModal = () => setModal(null)
  const handleChange = (field, value) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }))

  const handleSave = async () => {
    if (!modal.data.title?.trim()) {
      toast('Service title is required', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...modal.data,
        technologies: typeof modal.data.technologies === 'string'
          ? modal.data.technologies.split(',').map(value => value.trim()).filter(Boolean)
          : modal.data.technologies || [],
      }
      if (modal.mode === 'add') await post('/api/admin/services', payload)
      else await put(`/api/admin/services/${modal.data.id}`, payload)
      toast(modal.mode === 'add' ? 'Service created!' : 'Service updated!')
      closeModal()
      load()
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await del(`/api/admin/services/${id}`)
      toast('Service deleted.')
      load()
    } catch (err) {
      toast(err.message, 'error')
    }
    setConfirm(null)
  }

  const togglePublish = async (service) => {
    try {
      await put(`/api/admin/services/${service.id}`, {
        ...service,
        technologies: Array.isArray(service.technologies) ? service.technologies : [],
        published: !service.published,
      })
      load()
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-5">
      <ToastContainer />
      <ConfirmDialog
        open={!!confirm}
        title="Delete Service?"
        message={`"${confirm?.title}" will be removed from the public site.`}
        onConfirm={() => handleDelete(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />

      <Modal open={!!modal} title={modal?.mode === 'add' ? 'Add Service' : 'Edit Service'} onClose={closeModal}>
        {modal && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Title *</label>
              <input
                type="text"
                value={modal.data.title || ''}
                onChange={event => handleChange('title', event.target.value)}
                placeholder="e.g. Website Development"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={modal.data.description || ''}
                onChange={event => handleChange('description', event.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Icon</label>
                <select
                  value={modal.data.icon_name || 'Code2'}
                  onChange={event => handleChange('icon_name', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Availability</label>
                <input
                  type="text"
                  value={modal.data.availability || ''}
                  onChange={event => handleChange('availability', event.target.value)}
                  placeholder="Available"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Technologies / Tools (comma separated)</label>
              <input
                type="text"
                value={modal.data.technologies || ''}
                onChange={event => handleChange('technologies', event.target.value)}
                placeholder="React, Laravel, MySQL"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Display Order</label>
                <input
                  type="number"
                  value={modal.data.display_order ?? 0}
                  onChange={event => handleChange('display_order', parseInt(event.target.value, 10) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="service_published"
                  checked={!!modal.data.published}
                  onChange={event => handleChange('published', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="service_published" className="text-sm font-medium text-slate-700 dark:text-slate-300">Published</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-5 dark:border-slate-800">
              <button onClick={closeModal} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                {saving ? 'Saving…' : (modal.mode === 'add' ? 'Create' : 'Save Changes')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Services</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Services shown on the public site and used by the chatbot</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No services yet"
          description="Add the services you offer; they appear on the public site immediately."
          action={<button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={15} /> Add Service</button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(service => (
            <div
              key={service.id}
              className={`rounded-2xl border bg-white p-5 dark:bg-slate-900 ${service.published ? 'border-slate-200/80 dark:border-slate-800' : 'border-dashed border-slate-300 opacity-70 dark:border-slate-700'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{service.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{service.description}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${service.published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {service.published ? 'Published' : 'Draft'}
                </span>
              </div>
              {Array.isArray(service.technologies) && service.technologies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {service.technologies.map(tech => (
                    <span key={tech} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tech}</span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button onClick={() => openEdit(service)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Pencil size={13} /> Edit</button>
                <button onClick={() => togglePublish(service)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                  {service.published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
                </button>
                <button onClick={() => setConfirm(service)} className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
