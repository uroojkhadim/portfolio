import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, CheckCircle2 } from 'lucide-react'
import { Button } from '../ui/Shared'

export default function ProjectDetailsModal({ project, onClose }) {
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose()
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  if (!project) return null

  const githubUrl = project.githubUrl || project.liveUrl
  const isLive = project.status === 'Live'
  const showGithub = Boolean(project.githubUrl || project.type === 'mobile')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/60 p-4 backdrop-blur-sm sm:items-center"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200/60 bg-white/80 px-6 py-5 backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/80">
            <div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  isLive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                }`}
              >
                <CheckCircle2 size={12} />
                {project.status}
              </span>
              <h2
                id="project-modal-title"
                className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl"
              >
                {project.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close details"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6 p-6">
            <p className="leading-relaxed text-slate-600 dark:text-slate-400">{project.description}</p>

            {project.features?.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Key Features
                </h3>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {project.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: project.accent || '#6366f1' }}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
                Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-200/60 pt-6 dark:border-slate-700/60">
              <Button href={project.liveUrl}>
                <ExternalLink size={16} />
                Live Demo
              </Button>
              {showGithub && (
                <Button variant="outline" href={githubUrl}>
                  <Github size={16} />
                  GitHub
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
