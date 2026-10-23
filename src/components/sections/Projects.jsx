import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink, Smartphone, Globe, Layers } from 'lucide-react'
import { webProjects as fallbackWeb } from '../../data/projects'
import { mobileProjects as fallbackMobile } from '../../data/mobileProjects'
import { usePortfolioData } from '../../context/DataContext'
import { SectionHeading, Button } from '../ui/Shared'


const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.18 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

/**
 * Flutter / Mobile Application Card
 * SPECIFICATION:
 * 1. Project name
 * 2. A concise description of approx 2-3 lines
 * 3. A relevant project preview image
 */
function FlutterProjectCard({ project }) {
  const [imgSrc, setImgSrc] = useState(project.image)
  const [imgError, setImgError] = useState(false)

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="glass-card group flex h-full flex-col overflow-hidden border border-slate-200/80 transition-shadow duration-300 hover:shadow-lg dark:border-slate-800"
    >
      {/* Project Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900/90">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={project.alt || `${project.title} preview`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 p-6 text-center text-slate-300">
            <Smartphone size={36} className="text-indigo-400" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 sm:text-xl">
          {project.title}
        </h3>

        <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
          {project.description}
        </p>

        <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-400 dark:border-slate-800 dark:text-slate-500">
          Mobile Application · Flutter / Dart
        </div>
      </div>
    </motion.article>
  )
}

/**
 * Web Development Project Card
 * SPECIFICATION:
 * 1. Project name
 * 2. A relevant image
 * 3. A Live Demo link or button pointing to the verified URL
 */
function WebProjectCard({ project }) {
  const [imgSrc, setImgSrc] = useState(project.image)
  const [imgError, setImgError] = useState(false)

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className="glass-card group flex h-full flex-col overflow-hidden border border-slate-200/80 transition-shadow duration-300 hover:shadow-lg dark:border-slate-800"
    >
      {/* Project Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900/90">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={project.alt || `${project.title} live interface preview`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 p-6 text-center text-slate-300">
            <Globe size={36} className="text-indigo-400" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 sm:text-xl">
            {project.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Web &amp; Full-Stack Platform
          </p>
        </div>

        {/* Live Demo Action */}
        <div className="mt-5 pt-2">
          <Button
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <ExternalLink size={14} />
            <span>Live Demo</span>
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

export default function Projects() {
  const { webProjects: liveWeb, mobileProjects: liveMobile } = usePortfolioData()
  const webList = (liveWeb && liveWeb.length > 0) ? liveWeb : fallbackWeb
  const mobileList = (liveMobile && liveMobile.length > 0) ? liveMobile : fallbackMobile
  const [activeCategory, setActiveCategory] = useState('flutter')

  const categories = [
    {
      id: 'flutter',
      label: 'Flutter & Mobile Applications',
      shortLabel: 'Flutter & Mobile',
      icon: Smartphone,
      count: mobileList.length,
    },
    {
      id: 'web',
      label: 'Web & Full-Stack Projects',
      shortLabel: 'Web Projects',
      icon: Globe,
      count: webList.length,
    },
  ]

  return (
    <section id="projects" className="section-padding relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Portfolio &amp; Showcase"
          title="Featured Projects"
          description="Explore cross-platform Flutter mobile applications and production web developments with verified live deployments."
        />

        {/* Category Switcher Tabs */}
        <div className="mx-auto mb-10 max-w-xl">
          <div className="glass-card flex rounded-2xl border border-slate-200/80 p-1.5 dark:border-slate-800">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeCategory === cat.id

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition-all duration-200 sm:text-sm ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{cat.label}</span>
                  <span className="sm:hidden">{cat.shortLabel}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Project Gallery Grid */}
        <AnimatePresence mode="wait">
          {activeCategory === 'flutter' ? (
            <motion.div
              key="flutter-grid"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {mobileList.map((project) => (
                <FlutterProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="web-grid"
              variants={gridVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {webList.map((project) => (
                <WebProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
