import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Plus, Pencil, Trash2, Eye, EyeOff, Briefcase, Award } from 'lucide-react'

const EMPTY_EXP = {
  company: '',
  role: '',
  location: '',
  type: 'Professional Experience',
  start_date: '',
  end_date: '',
  is_current: false,
  description: '',
  skills: '',
  featured: false,
  display_order: 0,
  published: true
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Experience() {
  const { get, post, put, del, apiFetch } = useApi()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploadingCert, setUploadingCert] = useState(false)

  const load = () => {
    get('/api/admin/experience')
      .then(data => { setItems(data); setLoading(false) })
      .catch(e => { toast(e.message, 'error'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openAdd = () => setModal({ mode: 'add', data: { ...EMPTY_EXP } })
  const openEdit = (exp) => setModal({
    mode: 'edit',
    data: {
      ...exp,
      skills: Array.isArray(exp.skills) ? exp.skills.join(', ') : (exp.skills || '')
    }
  })
  const closeModal = () => setModal(null)

  const handleChange = (field, value) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }))

  const handleCertificateUpload = async (file) => {
    if (!file || !modal?.data?.id) {
      toast('Save experience record before uploading certificate.', 'error')
      return
    }
    setUploadingCert(true)
    try {
      const fd = new FormData()
      fd.append('certificate', file)
      const res = await apiFetch(`/api/admin/experience/${modal.data.id}/upload-certificate`, { method: 'POST', body: fd })
      handleChange('certificate_url', res.url)
      handleChange('certificate_type', res.certType)
      toast('Certificate uploaded!')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setUploadingCert(false)
    }
  }

  const handleSave = async () => {
    if (!modal.data.company || !modal.data.role) {
      toast('Company and Role are required', 'error')
      return
    }
    setSaving(true)
    try {
      const skillsArray = typeof modal.data.skills === 'string'
        ? modal.data.skills.split(',').map(s => s.trim()).filter(Boolean)
        : modal.data.skills || []

      const payload = {
        ...modal.data,
        skills: skillsArray,
        is_current: modal.data.is_current ? 1 : 0,
        featured: modal.data.featured ? 1 : 0,
        published: modal.data.published ? 1 : 0,
      }

      if (modal.mode === 'add') {
        await post('/api/admin/experience', payload)
        toast('Experience added!')
      } else {
        await put(`/api/admin/experience/${modal.data.id}`, payload)
        toast('Experience updated!')
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
      await del(`/api/admin/experience/${id}`)
      toast('Record deleted.')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
    setConfirm(null)
  }

  const togglePublish = async (exp) => {
    try {
      await put(`/api/admin/experience/${exp.id}`, {
        ...exp,
        skills: Array.isArray(exp.skills) ? exp.skills : [],
        published: !exp.published
      })
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
        title="Delete Experience?"
        message={`Are you sure you want to delete ${confirm?.role} at ${confirm?.company}?`}
        onConfirm={() => handleDelete(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />

      <Modal open={!!modal} title={modal?.mode === 'add' ? 'Add Experience' : 'Edit Experience'} onClose={closeModal}>
        {modal && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Company *</label>
                <input
                  type="text"
                  value={modal.data.company || ''}
                  onChange={e => handleChange('company', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Role *</label>
                <input
                  type="text"
                  value={modal.data.role || ''}
                  onChange={e => handleChange('role', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Location</label>
                <input
                  type="text"
                  value={modal.data.location || ''}
                  onChange={e => handleChange('location', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Type</label>
                <select
                  value={modal.data.type || 'Professional Experience'}
                  onChange={e => handleChange('type', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Professional Experience">Professional Experience</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Part-Time">Part-Time</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
                <input
                  type="text"
                  placeholder="e.g. June 2023"
                  value={modal.data.start_date || ''}
                  onChange={e => handleChange('start_date', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">End Date</label>
                <input
                  type="text"
                  placeholder="e.g. Present or Dec 2023"
                  disabled={!!modal.data.is_current}
                  value={modal.data.end_date || ''}
                  onChange={e => handleChange('end_date', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_current"
                checked={!!modal.data.is_current}
                onChange={e => {
                  handleChange('is_current', e.target.checked)
                  if (e.target.checked) handleChange('end_date', 'Present')
                }}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is_current" className="text-sm font-medium text-slate-700 dark:text-slate-300">Currently working here</label>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={4}
                value={modal.data.description || ''}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Key accomplishments and responsibilities..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Skills / Tech Stack (comma separated)</label>
              <input
                type="text"
                placeholder="React, Tailwind, Node.js"
                value={modal.data.skills || ''}
                onChange={e => handleChange('skills', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {modal.mode === 'edit' && (
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Certificate / Proof (PDF or Image)</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => handleCertificateUpload(e.target.files[0])}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:text-slate-300 dark:file:bg-indigo-500/15 dark:file:text-indigo-300"
                />
                {uploadingCert && <p className="mt-1 text-xs text-indigo-600">Uploading certificate...</p>}
                {modal.data.certificate_url && (
                  <a
                    href={modal.data.certificate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <Award size={14} /> View Certificate File
                  </a>
                )}
              </div>
            )}

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
              <div className="flex flex-col justify-end space-y-2 pb-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={!!modal.data.published}
                    onChange={e => handleChange('published', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-slate-700 dark:text-slate-300">Published</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={!!modal.data.featured}
                    onChange={e => handleChange('featured', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</label>
                </div>
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
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Experience</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage work experience and internships</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Experience
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience records"
          description="Add your first professional experience or internship record."
          action={
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={15} /> Add Experience
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(exp => (
            <div
              key={exp.id}
              className={`rounded-2xl border bg-white p-5 dark:bg-slate-900 transition-all ${
                exp.published ? 'border-slate-200/80 dark:border-slate-800' : 'border-dashed border-slate-300 dark:border-slate-700 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{exp.role}</h3>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{exp.company}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date} {exp.location && `• ${exp.location}`}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    exp.published
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {exp.published ? 'Published' : 'Draft'}
                </span>
              </div>

              {exp.description && (
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  {exp.description}
                </p>
              )}

              {exp.certificate_url && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <Award size={13} />
                  <span>Certificate attached</span>
                </div>
              )}

              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  onClick={() => openEdit(exp)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => togglePublish(exp)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {exp.published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
                </button>
                <button
                  onClick={() => setConfirm(exp)}
                  className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
