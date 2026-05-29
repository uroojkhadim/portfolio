import { motion } from 'framer-motion'
import {
  HeartPulse,
  ListTodo,
  Music2,
  MoonStar,
  ShoppingBag,
  Smartphone,
} from 'lucide-react'

const iconMap = {
  'predictive-healthcare': HeartPulse,
  'todo-list-mobile': ListTodo,
  musify: Music2,
  wemuslim: MoonStar,
  'pos-coffee-shop': ShoppingBag,
}

export default function PhoneMockup({ project, compact = false }) {
  const Icon = iconMap[project.id] || Smartphone
  const maxW = compact ? 'max-w-[180px]' : 'max-w-[220px]'

  return (
    <div className={`relative mx-auto w-full ${maxW}`}>
      <motion.div
        whileHover={{ y: -4, rotate: -1 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-[2rem] border-[3px] border-slate-800/90 bg-slate-900 p-2 shadow-2xl shadow-slate-900/30 dark:border-slate-600"
      >
        <div className="absolute left-1/2 top-3 h-1.5 w-14 -translate-x-1/2 rounded-full bg-slate-800 dark:bg-slate-700" />
        <div
          className={`relative mt-4 overflow-hidden rounded-[1.4rem] bg-gradient-to-br ${project.screenGradient} aspect-[9/16]`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_50%)]" />
          <div className="flex h-full flex-col items-center justify-center gap-3 p-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Icon size={28} className="text-white" strokeWidth={1.5} />
            </div>
            <p className="text-center font-display text-[10px] font-bold leading-snug text-white/95">
              {project.title.split(' ').slice(0, 3).join(' ')}
            </p>
            <div className="mt-1 w-full space-y-1.5 px-2">
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="h-1.5 rounded-full bg-white/20"
                  style={{ width: `${100 - row * 12}%`, marginLeft: `${row * 6}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      <div
        className={`absolute -inset-6 -z-10 rounded-full bg-gradient-to-br ${project.gradient} blur-2xl opacity-70`}
      />
    </div>
  )
}
