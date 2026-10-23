export default function LoadingSpinner({ size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 border-4' : size === 'sm' ? 'h-4 w-4 border-2' : 'h-7 w-7 border-[3px]'
  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizeClass} animate-spin rounded-full border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400`} />
    </div>
  )
}
