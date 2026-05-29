import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink,
  Github,
  Globe,
  Smartphone,
  Monitor,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import { projects, getProjectThumbnail } from '../../data/projects'
import { mobileProjects } from '../../data/mobileProjects'
import { SectionHeading, Button } from '../ui/Shared'
import PhoneMockup from '../projects/PhoneMockup'
import ProjectDetailsModal from '../projects/ProjectDetailsModal'

const TABS = [
  { id: 'web', label: 'Web Projects', icon: Monitor, count: projects.length },
  { id: 'mobile', label: 'Mobile / Flutter Projects', icon: Smartphone, count: mobileProjects.length },
]

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

function StatusBadge({ status }) {
  const isLive = status === 'Live'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm ${
        isLive
          ? 'bg-emerald-500/90 text-white'
          : 'bg-indigo-500/90 text-white'
      }`}
    >
      <CheckCircle2 size={11} />
      {status}
    </span>
  )
}

function WebPreview({ project }) {
  const [imgError, setImgError] = useState(false)
  const thumbnail = getProjectThumbnail(project.liveUrl)

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${project.gradient}`}>
      <div className="aspect-[16/10] w-full overflow-hidden">
        {!imgError ? (
          <img
            src={thumbnail}
            alt={`${project.title} preview`}
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 p-8">
            <Globe size={44} className="text-indigo-500/50" />
            <p className="font-display text-lg font-bold text-slate-700 dark:text-slate-200">
              {project.title}
            </p>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
      <div className="absolute left-4 top-4">
        <StatusBadge status={project.status} />
      </div>
      {project.deployment && (
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-200">
            {project.deployment}
          </span>
        </div>
      )}
    </div>
  )
}

function MobilePreview({ project }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${project.gradient} px-6 py-10`}>
      <div className="absolute left-4 top-4">
        <StatusBadge status={project.status} />
      </div>
      <div className="absolute right-4 top-4">
        <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm dark:bg-slate-900/90 dark:text-slate-200">
          Flutter / Mobile
        </span>
      </div>
      <PhoneMockup project={project} />
    </div>
  )
}

function ProjectCard({ project, type, onViewDetails }) {
  const githubUrl = project.githubUrl || project.liveUrl
  const hasGithub = Boolean(project.githubUrl)

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`glass-card group flex h-full flex-col overflow-hidden ${
        project.featured && type === 'web' ? 'lg:col-span-2' : ''
      }`}
    >
      {type === 'web' ? <WebPreview project={project} /> : <MobilePreview project={project} />}

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
          {project.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {project.description}
        </p>

        {project.features?.length > 0 && (
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {project.features.slice(0, 4).map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: project.accent || '#6366f1' }}
                />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-indigo-100 bg-indigo-50/80 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Button href={project.liveUrl} className="flex-1 sm:flex-none">
            <ExternalLink size={15} />
            Live Demo
          </Button>
          <Button
            variant="outline"
            href={hasGithub ? githubUrl : '#'}
            className={`flex-1 sm:flex-none ${!hasGithub && type === 'web' ? 'pointer-events-none opacity-45' : ''}`}
            aria-disabled={!hasGithub && type === 'web'}
            onClick={!hasGithub && type === 'web' ? (e) => e.preventDefault() : undefined}
          >
            <Github size={15} />
            GitHub
          </Button>
          <Button variant="secondary" onClick={() => onViewDetails(project)} className="flex-1 sm:flex-none">
            <Eye size={15} />
            View Details
          </Button>
        </div>
      </div>
    </motion.article>
  )
}

function CategoryTabs({ activeTab, onChange }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl">
      <p className="mb-4 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
        Choose project category
      </p>
      <div className="glass-card relative flex flex-col gap-2 p-2 sm:flex-row sm:gap-0">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-2.5 rounded-xl px-5 py-4 text-sm font-semibold transition-colors duration-300 sm:py-3.5 ${
                isActive
                  ? 'text-white'
                  : 'text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400'
              }`}
              aria-pressed={isActive}
            >
              {isActive && (
                <motion.span
                  layoutId="project-tab-bg"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative flex items-center gap-2.5">
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id === 'web' ? 'Web' : 'Mobile'}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Projects() {
  const [activeTab, setActiveTab] = useState('web')
  const [selectedProject, setSelectedProject] = useState(null)

  const activeProjects = activeTab === 'web' ? projects : mobileProjects
  const gridClass =
    activeTab === 'web'
      ? 'grid gap-7 lg:grid-cols-2'
      : 'grid gap-7 md:grid-cols-2 xl:grid-cols-3'

  return (
    <section id="projects" className="section-padding relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-1/4 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Portfolio"
          title="Featured projects"
          description="Explore my web applications and mobile apps — select a category to view the work."
        />

        <CategoryTabs activeTab={activeTab} onChange={setActiveTab} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={gridClass}
          >
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                type={activeTab}
                onViewDetails={setSelectedProject}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {selectedProject && (
        <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  )
}
