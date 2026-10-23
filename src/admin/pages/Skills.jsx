import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import { Plus, Pencil, Trash2 } from 'lucide-react'

function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Skills() {
  const { get, post, put, del } = useApi()
  const [categories, setCategories] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)

  const load = () => get('/api/admin/skills').then(d => { setCategories(d.categories); setSkills(d.skills); if (!activeCategory && d.categories[0]) setActiveCategory(d.categories[0].id); setLoading(false) }).catch(e => { toast(e.message, 'error'); setLoading(false) })
  useEffect(() => { load() }, [])

  const catSkills = skills.filter(s => s.category_id === activeCategory)
  const currentCat = categories.find(c => c.id === activeCategory)

  const Field = ({ label, name, value, onChange, type = 'text', children }) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</label>
      {children || <input type={type} value={value || ''} onChange={e => onChange(name, e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />}
    </div>
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      const d = modal.data
      if (modal.type === 'skill') {
        if (modal.mode === 'add') await post('/api/admin/skills', d)
        else await put(`/api/admin/skills/${d.id}`, d)
      } else {
        if (modal.mode === 'add') await post('/api/admin/skill-categories', d)
        else await put(`/api/admin/skill-categories/${d.id}`, d)
      }
      toast('Saved!')
      setModal(null); load()
    } catch (e) { toast(e.message, 'error') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      if (confirm.type === 'skill') await del(`/api/admin/skills/${confirm.id}`)
      else await del(`/api/admin/skill-categories/${confirm.id}`)
      toast('Deleted.'); load()
    } catch (e) { toast(e.message, 'error') }
    setConfirm(null)
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-5">
      <ToastContainer />
      <ConfirmDialog open={!!confirm} title="Delete?" message={`"${confirm?.name || confirm?.title}" will be deleted.`} onConfirm={handleDelete} onCancel={() => setConfirm(null)} />
      <Modal open={!!modal} title={modal ? `${modal.mode === 'add' ? 'Add' : 'Edit'} ${modal.type === 'skill' ? 'Skill' : 'Category'}` : ''} onClose={() => setModal(null)}>
        {modal && (
          <div className="space-y-4">
            {modal.type === 'skill' ? <>
              <Field label="Skill Name *" name="name" value={modal.data.name} onChange={(k,v) => setModal(m => ({...m, data:{...m.data,[k]:v}}))} />
              <Field label="Tag (e.g. Core, Advanced)" name="tag" value={modal.data.tag} onChange={(k,v) => setModal(m => ({...m, data:{...m.data,[k]:v}}))} />
              <Field label="Category" name="category_id">
                <select value={modal.data.category_id || ''} onChange={e => setModal(m => ({...m, data:{...m.data, category_id: Number(e.target.value)}}))} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </Field>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={!!modal.data.highlight} onChange={e => setModal(m => ({...m, data:{...m.data, highlight: e.target.checked}}))} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                  Highlight (primary skill)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={!!modal.data.published} onChange={e => setModal(m => ({...m, data:{...m.data, published: e.target.checked}}))} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                  Published
                </label>
              </div>
            </> : <>
              <Field label="Category Title *" name="title" value={modal.data.title} onChange={(k,v) => setModal(m => ({...m, data:{...m.data,[k]:v}}))} />
              <Field label="Description" name="description" value={modal.data.description} onChange={(k,v) => setModal(m => ({...m, data:{...m.data,[k]:v}}))} />
            </>}
            <div className="flex gap-2.5 justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
              <button onClick={() => setModal(null)} className="rounded-xl border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        )}
      </Modal>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Skills</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage skills grouped by category</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal({ type: 'category', mode: 'add', data: { title: '', description: '' } })} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Plus size={14} /> Category</button>
          <button onClick={() => setModal({ type: 'skill', mode: 'add', data: { name: '', tag: '', highlight: false, category_id: activeCategory, published: true } })} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={14} /> Skill</button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
        {/* Category tabs */}
        <div className="space-y-1">
          {categories.map(c => (
            <div key={c.id} className={`flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${activeCategory === c.id ? 'bg-indigo-50 dark:bg-indigo-500/15' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`} onClick={() => setActiveCategory(c.id)}>
              <span className={`text-sm font-medium ${activeCategory === c.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{c.title}</span>
              <div className="flex gap-1">
                <button onClick={e => { e.stopPropagation(); setModal({ type: 'category', mode: 'edit', data: c }) }} className="rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"><Pencil size={12} /></button>
                <button onClick={e => { e.stopPropagation(); setConfirm({ ...c, type: 'category' }) }} className="rounded p-1 text-rose-400 hover:text-rose-600"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Skills list */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{currentCat?.title || 'Select category'} <span className="text-slate-400">({catSkills.length})</span></h3>
          </div>
          <div className="space-y-2">
            {catSkills.map(s => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.name}</span>
                  {s.tag && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">{s.tag}</span>}
                  {s.highlight === 1 && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">Primary</span>}
                  {s.published === 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Hidden</span>}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => setModal({ type: 'skill', mode: 'edit', data: { ...s, highlight: !!s.highlight, published: !!s.published } })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"><Pencil size={14} /></button>
                  <button onClick={() => setConfirm({ ...s, type: 'skill' })} className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {catSkills.length === 0 && <div className="py-8 text-center text-sm text-slate-400">No skills in this category yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
