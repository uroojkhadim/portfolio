import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Plus, Pencil, Trash2, Eye, EyeOff, GraduationCap } from 'lucide-react'

const EMPTY_EDU = {
  institution: '',
  degree: '',
  field_of_study: '',
  start_date: '',
  end_date: '',
  is_current: false,
  cgpa: '',
  description: '',
  status_label: 'Completed',
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

export default function Education() {
  const { get, post, put, del } = useApi()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    get('/api/admin/education')
      .then(data => { setItems(data); setLoading(false) })
      .catch(e => { toast(e.message, 'error'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openAdd = () => setModal({ mode: 'add', data: { ...EMPTY_EDU } })
  const openEdit = (edu) => setModal({ mode: 'edit', data: { ...edu } })
  const closeModal = () => setModal(null)

  const handleChange = (field, value) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }))

  const handleSave = async () => {
    if (!modal.data.institution || !modal.data.degree) {
      toast('Institution and Degree are required', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...modal.data,
        is_current: modal.data.is_current ? 1 : 0,
        published: modal.data.published ? 1 : 0,
      }

      if (modal.mode === 'add') {
        await post('/api/admin/education', payload)
        toast('Education added!')
      } else {
        await put(`/api/admin/education/${modal.data.id}`, payload)
        toast('Education updated!')
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
      await del(`/api/admin/education/${id}`)
      toast('Education record deleted.')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
    setConfirm(null)
  }

  const togglePublish = async (edu) => {
    try {
      await put(`/api/admin/education/${edu.id}`, {
        ...edu,
        published: !edu.published
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
        title="Delete Education?"
        message={`Are you sure you want to delete ${confirm?.degree} at ${confirm?.institution}?`}
        onConfirm={() => handleDelete(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />

      <Modal open={!!modal} title={modal?.mode === 'add' ? 'Add Education' : 'Edit Education'} onClose={closeModal}>
        {modal && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Institution *</label>
                <input
                  type="text"
                  value={modal.data.institution || ''}
                  onChange={e => handleChange('institution', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Degree *</label>
                <input
                  type="text"
                  value={modal.data.degree || ''}
                  onChange={e => handleChange('degree', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Field of Study</label>
                <input
                  type="text"
                  value={modal.data.field_of_study || ''}
                  onChange={e => handleChange('field_of_study', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">CGPA / Grade</label>
                <input
                  type="text"
                  value={modal.data.cgpa || ''}
                  onChange={e => handleChange('cgpa', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Start Date</label>
                <input
                  type="text"
                  placeholder="e.g. 2020"
                  value={modal.data.start_date || ''}
                  onChange={e => handleChange('start_date', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">End Date</label>
                <input
                  type="text"
                  placeholder="e.g. 2024 or Present"
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
                id="edu_is_current"
                checked={!!modal.data.is_current}
                onChange={e => {
                  handleChange('is_current', e.target.checked)
                  if (e.target.checked) handleChange('end_date', 'Present')
                }}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="edu_is_current" className="text-sm font-medium text-slate-700 dark:text-slate-300">Currently studying here</label>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Status Label</label>
              <input
                type="text"
                placeholder="e.g. In Progress, Completed"
                value={modal.data.status_label || ''}
                onChange={e => handleChange('status_label', e.target.value)}
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
                  id="edu_published"
                  checked={!!modal.data.published}
                  onChange={e => handleChange('published', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="edu_published" className="text-sm font-medium text-slate-700 dark:text-slate-300">Published</label>
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
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Education</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage academic qualifications and degrees</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Education
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education records"
          description="Add your educational background."
          action={
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={15} /> Add Education
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(edu => (
            <div
              key={edu.id}
              className={`rounded-2xl border bg-white p-5 dark:bg-slate-900 transition-all ${
                edu.published ? 'border-slate-200/80 dark:border-slate-800' : 'border-dashed border-slate-300 dark:border-slate-700 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{edu.degree}</h3>
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{edu.institution}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {edu.start_date} - {edu.is_current ? 'Present' : edu.end_date} {edu.field_of_study && `• ${edu.field_of_study}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      edu.published
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {edu.published ? 'Published' : 'Draft'}
                  </span>
                  {edu.cgpa && (
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                      CGPA: {edu.cgpa}
                    </span>
                  )}
                </div>
              </div>

              {edu.description && (
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                  {edu.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  onClick={() => openEdit(edu)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Pencil size={13} /> Edit
                </button>
                <button
                  onClick={() => togglePublish(edu)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {edu.published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
                </button>
                <button
                  onClick={() => setConfirm(edu)}
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
