import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-950"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-display text-sm font-medium tracking-wide text-slate-500 dark:text-slate-400"
        >
          Loading portfolio...
        </motion.p>
      </div>
    </motion.div>
  )
}
