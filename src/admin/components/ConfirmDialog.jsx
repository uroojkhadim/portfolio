import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Delete', confirmClass = 'bg-rose-600 hover:bg-rose-700 text-white' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/15">
            <AlertTriangle size={20} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">{title || 'Confirm Action'}</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{message || 'This action cannot be undone.'}</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 flex gap-2.5 justify-end">
          <button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors shadow-sm ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
