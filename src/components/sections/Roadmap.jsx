import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Clock, Circle, Star } from 'lucide-react'
import { roadmapTracks } from '../../data/roadmap'
import { SectionHeading, FadeIn } from '../ui/Shared'

const stageStatusConfig = {
  completed: {
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
    indicatorBg: 'bg-emerald-500',
    borderColor: 'border-emerald-500/30 dark:border-emerald-500/20',
  },
  current: {
    icon: Clock,
    badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
    indicatorBg: 'bg-indigo-600 animate-pulse',
    borderColor: 'border-indigo-500/40 dark:border-indigo-500/30',
  },
  upcoming: {
    icon: Circle,
    badgeBg: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
    indicatorBg: 'bg-slate-300 dark:bg-slate-600',
    borderColor: 'border-slate-200 dark:border-slate-800',
  },
}

export default function Roadmap() {
  const [activeTrackId, setActiveTrackId] = useState(roadmapTracks[0].id)
  const currentTrack =
    roadmapTracks.find((t) => t.id === activeTrackId) || roadmapTracks[0]

  return (
    <section id="roadmap" className="section-padding relative bg-slate-50/50 dark:bg-slate-900/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Learning Journey"
          title="Technical Roadmap &amp; Milestones"
          description="Clear career and technology learning tracks demonstrating mastered foundations, active focuses, and upcoming milestones."
        />

        {/* Track Selection Tabs */}
        <div className="mx-auto mb-10 max-w-2xl">
          <div className="glass-card flex rounded-2xl border border-slate-200/80 p-1.5 dark:border-slate-800">
            {roadmapTracks.map((track) => {
              const Icon = track.icon
              const isActive = track.id === activeTrackId

              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrackId(track.id)}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon size={16} />
                  <span>{track.title.split(' ')[0]} {track.title.split(' ')[1] || ''}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Active Track Header */}
        <FadeIn delay={0.1}>
          <div className="mb-8 text-center">
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              {currentTrack.title}
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              {currentTrack.tagline}
            </p>
          </div>
        </FadeIn>

        {/* Stages Timeline Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTrack.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {currentTrack.stages.map((stage) => {
              const config = stageStatusConfig[stage.status] || stageStatusConfig.completed
              const StatusIcon = config.icon

              return (
                <div
                  key={stage.stageNumber}
                  className={`glass-card relative flex flex-col justify-between border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow sm:p-7 ${config.borderColor}`}
                >
                  <div>
                    {/* Top indicator */}
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3 dark:border-slate-700/60">
                      <span className="font-display text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                        STAGE {stage.stageNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${config.badgeBg}`}
                      >
                        <StatusIcon size={12} />
                        {stage.statusLabel}
                      </span>
                    </div>

                    <h4 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                      {stage.title}
                    </h4>

                    <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {stage.summary}
                    </p>

                    {/* Milestones list */}
                    <div className="mt-5 space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Key Milestones
                      </p>
                      <ul className="space-y-2">
                        {stage.milestones.map((milestone) => (
                          <li
                            key={milestone}
                            className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                          >
                            <span
                              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${config.indicatorBg}`}
                            />
                            <span>{milestone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500">
                    <span>
                      {stage.status === 'completed'
                        ? '100% Completed'
                        : stage.status === 'current'
                        ? 'In Progress (Active)'
                        : 'Scheduled Next'}
                    </span>
                    <Star size={12} className="text-indigo-400" />
                  </div>
                </div>
              )
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
