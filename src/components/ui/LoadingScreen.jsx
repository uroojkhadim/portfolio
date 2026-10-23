import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50 dark:bg-slate-950"
      aria-hidden="true"
    >
      <div className="flex flex-col items-center gap-5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-11 w-11 rounded-full border-[3px] border-indigo-200 border-t-indigo-600 dark:border-slate-800 dark:border-t-indigo-400"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="font-display text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400"
        >
          Loading Portfolio...
        </motion.p>
      </div>
    </motion.div>
  )
}
