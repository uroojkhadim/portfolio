import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Calendar,
  Building2,
  MapPin,
  Terminal,
  Code2,
  ExternalLink,
  Eye,
  X,
  Download,
  Award,
} from 'lucide-react'
import { professionalExperiences as fallbackExperiences, experienceOverview } from '../../data/experience'
import { usePortfolioData } from '../../context/DataContext'
import { SectionHeading, FadeIn, Button } from '../ui/Shared'

function CertificateModal({ item, onClose }) {
  if (!item || !item.certificateUrl) return null

  const isPdf = item.certificateType === 'pdf' || item.certificateUrl.endsWith('.pdf')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="glass-card flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-6 py-4 dark:border-slate-700/70 dark:bg-slate-900/90">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
                <Award size={20} />
              </div>
              <div>
                <h3
                  id="cert-modal-title"
                  className="font-display text-lg font-bold text-slate-900 dark:text-white"
                >
                  {item.role} Certificate
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {item.company} · {item.duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={item.certificateUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Download size={14} />
                Download
              </a>
              <a
                href={item.certificateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                <ExternalLink size={14} />
                Open Tab
              </a>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close certificate preview"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-slate-100 p-4 dark:bg-slate-950 sm:p-6">
            {isPdf ? (
              <div className="h-[70vh] w-full overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <iframe
                  src={`${item.certificateUrl}#toolbar=1`}
                  title={`${item.company} Certificate`}
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <img
                  src={item.certificateUrl}
                  alt={`${item.company} Internship Certificate`}
                  className="max-h-[70vh] rounded-xl object-contain shadow-lg"
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ExperienceTimelineCard({ item, index, onViewCertificate }) {
  const hasCertificate = Boolean(item.certificateUrl)

  return (
    <FadeIn delay={index * 0.08}>
      <div className="relative flex gap-5 sm:gap-7">
        {/* Timeline connector on desktop */}
        <div className="relative hidden flex-col items-center sm:flex">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25">
            <Terminal size={20} />
          </div>
          {index < (item.totalCount ? item.totalCount - 1 : 10) && (
            <div className="my-2 w-0.5 flex-1 bg-gradient-to-b from-indigo-500/40 via-violet-500/30 to-transparent" />
          )}
        </div>

        {/* Experience Card */}
        <div className="glass-card group flex-1 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow sm:p-7 border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200/60 pb-4 dark:border-slate-700/60">
            <div>
              <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                {item.type}
              </span>
              <h3 className="mt-1.5 font-display text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                {item.role}
              </h3>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                <Building2 size={15} />
                {item.company}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Calendar size={12} />
                {item.duration}
              </span>
              {item.location && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <MapPin size={11} />
                  {item.location}
                </span>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {item.description}
          </p>

          {item.skills && item.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-slate-200/80 bg-white/60 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {hasCertificate && (
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                onClick={() => onViewCertificate(item)}
                className="w-full sm:w-auto"
              >
                <Eye size={15} />
                View Certificate
              </Button>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  )
}

export default function Experience() {
  const [selectedCert, setSelectedCert] = useState(null)
  const { experience: liveExperiences } = usePortfolioData()

  const list = (liveExperiences && liveExperiences.length > 0)
    ? liveExperiences.map(e => ({
        ...e,
        duration: e.duration || `${e.start_date || ''} - ${e.is_current ? 'Present' : (e.end_date || '')}`,
        certificateUrl: e.certificateUrl || e.certificate_url,
        certificateType: e.certificateType || e.certificate_type,
      }))
    : fallbackExperiences

  return (
    <section id="experience" className="section-padding relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/3 top-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Experience"
          title="Professional experience & roles"
          description="A chronological timeline of hands-on software development roles, Android engineering, and frontend projects."
        />

        {/* Replacement Professional Availability & Profile Banner */}
        <FadeIn delay={0.05}>
          <div className="mb-12 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/90 via-violet-50/70 to-purple-50/90 p-6 dark:border-indigo-500/20 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900/40">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25">
                  <Code2 size={20} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                    {experienceOverview.headline}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {experienceOverview.tagline}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:self-center">
                {experienceOverview.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur-sm dark:bg-slate-800/80 dark:text-indigo-300"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Professional Timeline (Most Recent First) */}
        <div className="mx-auto max-w-3xl space-y-7">
          {list.map((item, index) => (
            <ExperienceTimelineCard
              key={item.id}
              item={item}
              index={index}
              onViewCertificate={(cert) => setSelectedCert(cert)}
            />
          ))}
        </div>
      </div>

      {selectedCert && (
        <CertificateModal
          item={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      )}
    </section>
  )
}
