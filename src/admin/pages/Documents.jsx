import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText, Download, Upload } from 'lucide-react'

const EMPTY_DOC = {
  title: '',
  description: '',
  category: 'cv',
  version: '1.0',
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

export default function Documents() {
  const { get, del, apiFetch } = useApi()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const load = () => {
    get('/api/admin/documents')
      .then(data => { setItems(data); setLoading(false) })
      .catch(e => { toast(e.message, 'error'); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setSelectedFile(null)
    setModal({ mode: 'add', data: { ...EMPTY_DOC } })
  }

  const openEdit = (doc) => {
    setSelectedFile(null)
    setModal({ mode: 'edit', data: { ...doc } })
  }

  const closeModal = () => setModal(null)

  const handleChange = (field, value) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }))

  const handleSave = async () => {
    if (!modal.data.title) {
      toast('Title is required', 'error')
      return
    }
    if (modal.mode === 'add' && !selectedFile && !modal.data.file_path) {
      toast('Please select a file to upload', 'error')
      return
    }

    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', modal.data.title)
      fd.append('description', modal.data.description || '')
      fd.append('category', modal.data.category || 'cv')
      fd.append('version', modal.data.version || '')
      fd.append('display_order', String(modal.data.display_order ?? 0))
      fd.append('published', modal.data.published ? '1' : '0')
      if (selectedFile) {
        fd.append('file', selectedFile)
      } else if (modal.data.file_path) {
        fd.append('file_path', modal.data.file_path)
        fd.append('filename', modal.data.filename || '')
      }

      if (modal.mode === 'add') {
        await apiFetch('/api/admin/documents', { method: 'POST', body: fd })
        toast('Document created!')
      } else {
        await apiFetch(`/api/admin/documents/${modal.data.id}`, { method: 'PUT', body: fd })
        toast('Document updated!')
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
      await del(`/api/admin/documents/${id}`)
      toast('Document deleted.')
      load()
    } catch (e) {
      toast(e.message, 'error')
    }
    setConfirm(null)
  }

  const togglePublish = async (doc) => {
    try {
      const fd = new FormData()
      fd.append('title', doc.title)
      fd.append('published', doc.published ? '0' : '1')
      await apiFetch(`/api/admin/documents/${doc.id}`, { method: 'PUT', body: fd })
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
        title="Delete Document?"
        message={`Are you sure you want to delete "${confirm?.title}"? The associated file will be removed.`}
        onConfirm={() => handleDelete(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />

      <Modal open={!!modal} title={modal?.mode === 'add' ? 'Upload Document' : 'Edit Document'} onClose={closeModal}>
        {modal && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Title *</label>
              <input
                type="text"
                placeholder="e.g. Curriculum Vitae"
                value={modal.data.title || ''}
                onChange={e => handleChange('title', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={modal.data.category || 'cv'}
                  onChange={e => handleChange('category', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="cv">CV</option>
                  <option value="resume">Resume</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other Document</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Version</label>
                <input
                  type="text"
                  placeholder="e.g. 2024.1"
                  value={modal.data.version || ''}
                  onChange={e => handleChange('version', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                rows={2}
                value={modal.data.description || ''}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Brief description of the document..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {modal.mode === 'add' ? 'File (PDF, DOC, DOCX) *' : 'Replace File (optional)'}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={e => setSelectedFile(e.target.files[0])}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:text-slate-300 dark:file:bg-indigo-500/15 dark:file:text-indigo-300"
              />
              {modal.data.filename && !selectedFile && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Current file: <span className="font-medium text-slate-700 dark:text-slate-200">{modal.data.filename}</span>
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
                  id="doc_published"
                  checked={!!modal.data.published}
                  onChange={e => handleChange('published', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="doc_published" className="text-sm font-medium text-slate-700 dark:text-slate-300">Published</label>
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
                {saving ? 'Saving...' : (modal.mode === 'add' ? 'Upload' : 'Save Changes')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">My Documents</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your CV, resume, and public documents</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Add Document
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded"
          description="Add your resume or curriculum vitae to make it downloadable."
          action={
            <button
              onClick={openAdd}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={15} /> Add Document
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map(doc => (
            <div
              key={doc.id}
              className={`rounded-2xl border bg-white p-5 dark:bg-slate-900 transition-all ${
                doc.published ? 'border-slate-200/80 dark:border-slate-800' : 'border-dashed border-slate-300 dark:border-slate-700 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{doc.title}</h3>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400">
                      {doc.category}
                    </span>
                  </div>
                  {doc.version && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Version: {doc.version}</p>
                  )}
                  {doc.filename && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      {doc.filename}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    doc.published
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {doc.published ? 'Published' : 'Draft'}
                </span>
              </div>

              {doc.description && (
                <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                  {doc.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEdit(doc)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => togglePublish(doc)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {doc.published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {doc.file_path && (
                    <a
                      href={doc.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Download size={13} /> Download
                    </a>
                  )}
                  <button
                    onClick={() => setConfirm(doc)}
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
