import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { toast, ToastContainer } from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { Bot, Plus, Pencil, Trash2, Eye, EyeOff, Save, Sparkles } from 'lucide-react'

const EMPTY_ENTRY = {
  topic: '',
  question: '',
  answer: '',
  keywords: '',
  display_order: 0,
  published: true,
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900" onClick={event => event.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function ChatbotKnowledge() {
  const { get, post, put, del } = useApi()
  const [entries, setEntries] = useState([])
  const [settings, setSettings] = useState({ chatbot_enabled: '1', chatbot_greeting: '', chatbot_suggestions: '' })
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [modal, setModal] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const [entriesRes, settingsRes] = await Promise.all([
        get('/api/admin/chatbot-knowledge'),
        get('/api/admin/settings'),
      ])
      setEntries(Array.isArray(entriesRes) ? entriesRes : [])
      setSettings(prev => ({ ...prev, ...settingsRes }))
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => setModal({ mode: 'add', data: { ...EMPTY_ENTRY } })
  const openEdit = (entry) => setModal({
    mode: 'edit',
    data: { ...entry, keywords: Array.isArray(entry.keywords) ? entry.keywords.join(', ') : (entry.keywords || '') },
  })
  const closeModal = () => setModal(null)
  const handleChange = (field, value) => setModal(prev => ({ ...prev, data: { ...prev.data, [field]: value } }))

  const saveSettings = async () => {
    setSavingSettings(true)
    try {
      await put('/api/admin/settings', {
        chatbot_enabled: settings.chatbot_enabled === '0' || settings.chatbot_enabled === false ? '0' : '1',
        chatbot_greeting: settings.chatbot_greeting || '',
        chatbot_suggestions: settings.chatbot_suggestions || '',
      })
      toast('Chatbot settings saved.')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSave = async () => {
    if (!modal.data.topic?.trim() || !modal.data.answer?.trim()) {
      toast('Topic and answer are required', 'error')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...modal.data,
        keywords: typeof modal.data.keywords === 'string'
          ? modal.data.keywords.split(',').map(value => value.trim()).filter(Boolean)
          : modal.data.keywords || [],
      }
      if (modal.mode === 'add') await post('/api/admin/chatbot-knowledge', payload)
      else await put(`/api/admin/chatbot-knowledge/${modal.data.id}`, payload)
      toast(modal.mode === 'add' ? 'Knowledge entry added!' : 'Knowledge entry updated!')
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
      await del(`/api/admin/chatbot-knowledge/${id}`)
      toast('Knowledge entry deleted.')
      load()
    } catch (err) {
      toast(err.message, 'error')
    }
    setConfirm(null)
  }

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="space-y-6">
      <ToastContainer />
      <ConfirmDialog
        open={!!confirm}
        title="Delete Knowledge Entry?"
        message={`"${confirm?.topic}" will be removed from the chatbot knowledge base.`}
        onConfirm={() => handleDelete(confirm?.id)}
        onCancel={() => setConfirm(null)}
      />

      <Modal open={!!modal} title={modal?.mode === 'add' ? 'Add Knowledge Entry' : 'Edit Knowledge Entry'} onClose={closeModal}>
        {modal && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Topic *</label>
                <input
                  type="text"
                  value={modal.data.topic || ''}
                  onChange={event => handleChange('topic', event.target.value)}
                  placeholder="e.g. Working style"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Example question</label>
                <input
                  type="text"
                  value={modal.data.question || ''}
                  onChange={event => handleChange('question', event.target.value)}
                  placeholder="How does Urooj approach a project?"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Answer *</label>
              <textarea
                rows={5}
                value={modal.data.answer || ''}
                onChange={event => handleChange('answer', event.target.value)}
                placeholder="The exact answer the assistant should give."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Keywords (comma separated)</label>
              <input
                type="text"
                value={modal.data.keywords || ''}
                onChange={event => handleChange('keywords', event.target.value)}
                placeholder="process, approach, methodology"
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
                  id="chatbot_published"
                  checked={!!modal.data.published}
                  onChange={event => handleChange('published', event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="chatbot_published" className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-5 dark:border-slate-800">
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
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Chatbot Knowledge</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The assistant also reads your live skills, services, projects, experience, education and contact data automatically.
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-5 dark:border-indigo-500/20 dark:bg-indigo-950/20">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-slate-900 dark:text-white">
          <Sparkles size={16} className="text-indigo-500" /> Assistant settings
        </h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Greeting message</label>
              <textarea
                rows={3}
                value={settings.chatbot_greeting || ''}
                onChange={event => setSettings(prev => ({ ...prev, chatbot_greeting: event.target.value }))}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Suggested questions (one per line)</label>
              <textarea
                rows={4}
                value={settings.chatbot_suggestions || ''}
                onChange={event => setSettings(prev => ({ ...prev, chatbot_suggestions: event.target.value }))}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={settings.chatbot_enabled !== '0' && settings.chatbot_enabled !== false}
                onChange={event => setSettings(prev => ({ ...prev, chatbot_enabled: event.target.checked ? '1' : '0' }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Chatbot enabled on the public site
            </label>
            <button
              onClick={saveSettings}
              disabled={savingSettings}
              className="mt-4 inline-flex items-center justify-center gap-2 self-start rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save size={15} /> {savingSettings ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No custom knowledge entries"
          description="The assistant already answers from your CMS data. Add extra Q&A notes here for anything specific."
          action={<button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"><Plus size={15} /> Add Entry</button>}
        />
      ) : (
        <div className="space-y-2.5">
          {entries.map(entry => (
            <div key={entry.id} className={`rounded-2xl border bg-white p-5 dark:bg-slate-900 ${entry.published ? 'border-slate-200/80 dark:border-slate-800' : 'border-dashed border-slate-300 opacity-70 dark:border-slate-700'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{entry.topic}</h3>
                  {entry.question && <p className="mt-0.5 text-xs text-indigo-600 dark:text-indigo-400">Q: {entry.question}</p>}
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-600 dark:text-slate-300">{entry.answer}</p>
                  {Array.isArray(entry.keywords) && entry.keywords.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.keywords.map(keyword => (
                        <span key={keyword} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">{keyword}</span>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${entry.published ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {entry.published ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button onClick={() => openEdit(entry)} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"><Pencil size={13} /> Edit</button>
                <button
                  onClick={async () => {
                    try {
                      await put(`/api/admin/chatbot-knowledge/${entry.id}`, {
                        ...entry,
                        keywords: Array.isArray(entry.keywords) ? entry.keywords : [],
                        published: !entry.published,
                      })
                      load()
                    } catch (err) { toast(err.message, 'error') }
                  }}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {entry.published ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Activate</>}
                </button>
                <button onClick={() => setConfirm(entry)} className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
