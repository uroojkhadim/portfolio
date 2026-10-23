import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Plus, Pencil, Trash2, Eye, EyeOff, Award, ExternalLink } from 'lucide-react'

const EMPTY_CERT = {
  title: '',
  issuer: '',
  issue_date: '',
  credential_url: '',
  description: '',
  display_order: 0,
  published: true
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Certificates() {
  const { get, del, apiFetch } = useApi()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const load = () => {
    get('/api/admin/certificates')
      .then(data => { setItems(data); setLoading(false) })
      .catch(e => { toast(e.message, 'error'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setSelectedFile(null)
    setModal({ mode: 'add', data: { ...EMPTY_CERT } })
  }

  const openEdit = (cert) => {
    setSelectedFile(null)
    setModal({ mode: 'edit', data: { ...cert } })
  }

  const closeModal = () => setModal(null)

  const handleChange = (field, value) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }))

  const handleSave = async () => {
    if (!modal.data.title) {
      toast('Title is required', 'error')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', modal.data.title)
      fd.append('issuer', modal.data.issuer || '')
      fd.append('issue_date', modal.data.issue_date || '')
      fd.append('credential_url', modal.data.credential_url || '')
      fd.append('description', modal.data.description || '')
      fd.append('display_order', String(modal.data.display_order ?? 0))
      fd.append('published', modal.data.published ? '1' : '0')
      if (selectedFile) {
        fd.append('image', selectedFile)
      } else if (modal.data.image_url) {
        fd.append('image_url', modal.data.image_url)
      }

      if (modal.mode === 'add') {
        await apiFetch('/api/admin/certificates', { method: 'POST', body: fd })
        toast('Certificate created!')
      } else {
        await apiFetch(`/api/admin/certificates/${modal.data.id}`, { method: 'PUT', body: fd })
        toast('Certificate updated!')
      }
      closeModal()
      load()
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await del(`/api/admin/certificates/${id}`)
      toast('Certificate deleted.')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
    setConfirm(null)
  }

  const togglePublish = async (cert) => {
    try {
      const fd = new FormData()
      fd.append('title', cert.title)
      fd.append('published', cert.published ? '0' : '1')
      await apiFetch(`/api/admin/certificates/${cert.id}`, { method: 'PUT', body: fd })
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-5">
      <ToastContainer />
      <ConfirmDialog
        open={!!confirm}
        title="Delete Certificate?"
        message={`Are you sure you want to delete "${confirm?.title}"?`}
        onConfirm={() => handleDelete(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />

      <Modal open={!!modal} title={modal?.mode === 'add' ? 'Add Certificate' : 'Edit Certificate'} onClose={closeModal}>
        {modal && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Title *</label>
              <input
                type="text"
                value={modal.data.title || ''}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Issuer</label>
                <input
                  type="text"
                  placeholder="e.g. Coursera, Google"
                  value={modal.data.issuer || ''}
                  onChange={e => handleChange('issuer', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Issue Date</label>
                <input
                  type="text"
                  placeholder="e.g. Nov 2023"
                  value={modal.data.issue_date || ''}
                  onChange={e => handleChange('issue_date', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Credential URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={modal.data.credential_url || ''}
                onChange={e => handleChange('credential_url', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={3}
                value={modal.data.description || ''}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Certificate Image / PDF</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={e => setSelectedFile(e.target.files[0])}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:text-slate-300 dark:file:bg-indigo-500/15 dark:file:text-indigo-300"
              />
              {modal.data.image_url && !selectedFile && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Current image: <a href={modal.data.image_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View file</a>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Display Order</label>
                <input
                  type="number"
                  value={modal.data.display_order ?? 0}
                  onChange={e => handleChange('display_order', parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="cert_published"
                  checked={!!modal.data.published}
                  onChange={e => handleChange('published', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="cert_published" className="text-sm font-medium text-slate-700 dark:text-slate-300">Published</label>
              </div>
            </div>

            <div className="mt-6 flex gap-2.5 justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                onClick={closeModal}
                className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saving...' : (modal.mode === 'add' ? 'Create' : 'Save Changes')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Certificates</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage credentials and professional certifications</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Certificate
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates"
          description="Add your professional certifications and course completions."
          action={
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={15} /> Add Certificate
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(cert => (
            <div
              key={cert.id}
              className={`rounded-2xl border bg-white p-5 dark:bg-slate-900 transition-all ${
                cert.published ? 'border-slate-200/80 dark:border-slate-800' : 'border-dashed border-slate-300 dark:border-slate-700 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{cert.title}</h3>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{cert.issuer}</p>
                  {cert.issue_date && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Issued: {cert.issue_date}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    cert.published
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {cert.published ? 'Published' : 'Draft'}
                </span>
              </div>

              {cert.description && (
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  {cert.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(cert)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => togglePublish(cert)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {cert.published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <ExternalLink size={13} /> Verify
                    </a>
                  )}
                  <button
                    onClick={() => setConfirm(cert)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
