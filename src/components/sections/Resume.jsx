import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Sparkles,
} from 'lucide-react'
import { cvLinks } from '../../data/cv'
import { personalInfo } from '../../data/personal'
import { SectionHeading, FadeIn, Button } from '../ui/Shared'

export default function Resume() {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <section id="resume" className="section-padding relative bg-slate-50/50 dark:bg-slate-900/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Resume"
          title="Curriculum Vitae"
          description="Preview or download my official resume — a concise overview of my skills, education, and experience."
        />

        <FadeIn>
          <div className="glass-card mx-auto max-w-4xl overflow-hidden">
            <div className="border-b border-slate-200/60 p-6 dark:border-slate-700/60 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30"
                  >
                    <FileText size={26} />
                  </motion.div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                      {personalInfo.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {personalInfo.role}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      <Sparkles size={12} />
                      {cvLinks.filename}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPreview((prev) => !prev)}
                    aria-expanded={showPreview}
                  >
                    {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPreview ? 'Hide Preview' : 'Preview Resume'}
                  </Button>
                  <Button href={cvLinks.download} download={cvLinks.filename}>
                    <Download size={16} />
                    Download Resume
                  </Button>
                  <Button variant="outline" href={cvLinks.openInNewTab} target="_blank">
                    <ExternalLink size={16} />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-b border-slate-200/60 bg-slate-100/50 p-4 dark:border-slate-700/60 dark:bg-slate-950/40 sm:p-6">
                    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-inner dark:border-slate-700 dark:bg-slate-900">
                      <iframe
                        src={`${cvLinks.path}#toolbar=0&navpanes=0`}
                        title={`${personalInfo.name} — Resume Preview`}
                        className="h-[min(75vh,820px)] w-full"
                      />
                    </div>
                    <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                      If the preview does not load, use{' '}
                      <a
                        href={cvLinks.openInNewTab}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Open in New Tab
                      </a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showPreview && (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center sm:py-16">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="mb-6 flex h-24 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-violet-500/10"
                >
                  <FileText size={36} className="text-indigo-500" />
                </motion.div>
                <p className="max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  Click <strong className="font-semibold text-slate-800 dark:text-slate-200">Preview Resume</strong> to view the PDF inline, or download the official CV directly.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Button onClick={() => setShowPreview(true)}>
                    <Eye size={16} />
                    Preview Resume
                  </Button>
                  <Button variant="outline" href={cvLinks.download} download={cvLinks.filename}>
                    <Download size={16} />
                    Download CV
                  </Button>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
