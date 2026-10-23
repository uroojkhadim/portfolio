import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, FolderKanban } from 'lucide-react'

const EMPTY_PROJECT = { title: '', description: '', category: 'web', image: '', alt_text: '', live_url: '', github_url: '', technologies: '', featured: false, display_order: 0, published: true }

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

function ProjectForm({ data, onChange, onImageUpload, uploading }) {
  const Field = ({ label, name, type = 'text', placeholder, children }) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {children || <input type={type} value={data[name] || ''} onChange={e => onChange(name, e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />}
    </div>
  )
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Field label="Title *" name="title" placeholder="Project name" /></div>
      <Field label="Category *" name="category">
        <select value={data.category} onChange={e => onChange('category', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="web">Web Project</option>
          <option value="mobile">Mobile App</option>
        </select>
      </Field>
      <Field label="Display Order" name="display_order" type="number" placeholder="0" />
      <div className="sm:col-span-2"><Field label="Description" name="description">
        <textarea rows={3} value={data.description || ''} onChange={e => onChange('description', e.target.value)} placeholder="Brief description..." className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
      </Field></div>
      <Field label="Image URL" name="image" placeholder="/images/projects/example.svg" />
      <Field label="Image Alt Text" name="alt_text" placeholder="Descriptive alt text" />
      <Field label="Live URL" name="live_url" placeholder="https://example.com" />
      <Field label="GitHub URL" name="github_url" placeholder="https://github.com/..." />
      <div className="sm:col-span-2"><Field label="Technologies (comma separated)" name="technologies" placeholder="React, Node.js, MongoDB" /></div>
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Upload Image</label>
        <input type="file" accept="image/*" onChange={e => onImageUpload(e.target.files[0])} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-indigo-700 dark:text-slate-300 dark:file:bg-indigo-500/15 dark:file:text-indigo-300" />
        {uploading && <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">Uploading…</p>}
        {data.image && <img src={data.image} alt="" className="mt-2 h-20 w-auto rounded-lg object-cover border border-slate-200 dark:border-slate-700" onError={e => e.target.style.display='none'} />}
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="pub" checked={!!data.published} onChange={e => onChange('published', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="pub" className="text-sm font-medium text-slate-700 dark:text-slate-300">Published</label>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="feat" checked={!!data.featured} onChange={e => onChange('featured', e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="feat" className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</label>
      </div>
    </div>
  )
}

export default function Projects() {
  const { get, post, put, del, apiFetch } = useApi()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('web')
  const [modal, setModal] = useState(null) // null | { mode: 'add'|'edit', data }
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = () => get('/api/admin/projects').then(data => { setProjects(data); setLoading(false) }).catch(e => { toast(e.message, 'error'); setLoading(false) })
  useEffect(() => { load() }, [])

  const filtered = projects.filter(p => p.category === tab)

  const openAdd = () => setModal({ mode: 'add', data: { ...EMPTY_PROJECT, category: tab } })
  const openEdit = (p) => setModal({ mode: 'edit', data: { ...p, technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || '') } })
  const closeModal = () => setModal(null)

  const handleChange = (field, value) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }))

  const handleImageUpload = async (file) => {
    if (!file || !modal?.data?.id) { toast('Save project first before uploading image.', 'error'); return }
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('image', file)
      const result = await apiFetch(`/api/admin/projects/${modal.data.id}/upload-image`, { method: 'POST', body: fd })
      handleChange('image', result.url)
      toast('Image uploaded!')
    } catch (e) { toast(e.message, 'error') } finally { setUploading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const d = { ...modal.data, technologies: modal.data.technologies ? modal.data.technologies.split(',').map(t => t.trim()).filter(Boolean) : [] }
      if (modal.mode === 'add') await post('/api/admin/projects', d)
      else await put(`/api/admin/projects/${modal.data.id}`, d)
      toast(modal.mode === 'add' ? 'Project created!' : 'Project updated!')
      closeModal(); load()
    } catch (e) { toast(e.message, 'error') } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await del(`/api/admin/projects/${id}`); toast('Project deleted.'); load() }
    catch (e) { toast(e.message, 'error') }
    setConfirm(null)
  }

  const togglePublish = async (p) => {
    try { await put(`/api/admin/projects/${p.id}`, { ...p, technologies: Array.isArray(p.technologies) ? p.technologies : [], published: !p.published }); load() }
    catch (e) { toast(e.message, 'error') }
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-5">
      <ToastContainer />
      <ConfirmDialog open={!!confirm} title="Delete Project?" message={`"${confirm?.title}" will be permanently deleted.`} onConfirm={() => handleDelete(confirm?.id)} onCancel={() => setConfirm(null)} />
      <Modal open={!!modal} title={modal?.mode === 'add' ? 'Add Project' : 'Edit Project'} onClose={closeModal}>
        {modal && <>
          <ProjectForm data={modal.data} onChange={handleChange} onImageUpload={handleImageUpload} uploading={uploading} />
          <div className="mt-6 flex gap-2.5 justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
            <button onClick={closeModal} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
              {saving ? 'Saving…' : (modal.mode === 'add' ? 'Create' : 'Save Changes')}
            </button>
          </div>
        </>}
      </Modal>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Projects</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage web and mobile projects</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Add Project
        </button>
      </div>

      <div className="flex gap-1 rounded-xl border border-slate-200/80 bg-slate-100/80 p-1 dark:border-slate-800 dark:bg-slate-800/60">
        {[{ id: 'web', label: 'Web Projects' }, { id: 'mobile', label: 'Mobile Apps' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${tab === t.id ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>{t.label}</button>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState icon={FolderKanban} title="No projects yet" description="Add your first project to get started." action={<button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={15} /> Add Project</button>} />
      : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id} className={`rounded-2xl border bg-white p-4 dark:bg-slate-900 transition-all ${p.published ? 'border-slate-200/80 dark:border-slate-800' : 'border-dashed border-slate-300 dark:border-slate-700 opacity-70'}`}>
              {p.image && <img src={p.image} alt={p.alt_text || p.title} className="mb-3 h-28 w-full rounded-xl object-cover bg-slate-100 dark:bg-slate-800" onError={e => e.target.style.display='none'} />}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.title}</p>
                  {p.live_url && <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5 truncate"><ExternalLink size={11} />{p.live_url}</a>}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{p.published ? 'Published' : 'Draft'}</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button onClick={() => openEdit(p)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Pencil size={13} /> Edit</button>
                <button onClick={() => togglePublish(p)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">{p.published ? <><EyeOff size={13} /> Unpublish</> : <><Eye size={13} /> Publish</>}</button>
                <button onClick={() => setConfirm(p)} className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
