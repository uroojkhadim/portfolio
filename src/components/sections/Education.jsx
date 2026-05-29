import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Circle, Clock } from 'lucide-react'
import { educationTimeline } from '../../data/education'
import { SectionHeading, FadeIn } from '../ui/Shared'

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500',
    label: 'Completed',
  },
  current: {
    icon: Clock,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500',
    label: 'In Progress',
  },
  upcoming: {
    icon: Circle,
    color: 'text-slate-400',
    bg: 'bg-slate-300 dark:bg-slate-600',
    label: 'Upcoming',
  },
}

export default function Education() {
  return (
    <section id="education" className="section-padding relative bg-slate-50/50 dark:bg-slate-900/30">
      <div className="section-container">
        <SectionHeading
          eyebrow="Education"
          title="Academic journey"
          description="My progression as a Software Engineering student, semester by semester."
        />

        <div className="relative mx-auto max-w-3xl">
          <div className="absolute left-[19px] top-2 hidden h-[calc(100%-16px)] w-px bg-gradient-to-b from-indigo-500 via-violet-500 to-transparent sm:block" />

          <div className="space-y-8">
            {educationTimeline.map((item, index) => {
              const config = statusConfig[item.status]
              const Icon = config.icon

              return (
                <FadeIn key={item.semester} delay={index * 0.08}>
                  <div className="relative flex gap-6">
                    <div className="relative z-10 hidden shrink-0 sm:block">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bg} text-white shadow-lg`}
                      >
                        <Icon size={18} />
                      </motion.div>
                    </div>

                    <div className="glass-card flex-1 p-6 transition-all hover:-translate-y-0.5 hover:shadow-glow">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                          <BookOpen size={12} />
                          {item.semester}
                        </span>
                        <span className={`text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>

          <FadeIn delay={0.3}>
            <div className="mt-10 rounded-2xl border border-indigo-200/60 bg-gradient-to-r from-indigo-50 to-violet-50 p-6 text-center dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-violet-500/10">
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Software Engineering Student
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Continuously learning and applying modern development practices through coursework
                and real-world projects.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
