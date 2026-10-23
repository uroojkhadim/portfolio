import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileDown,
  Files,
  Star,
  CheckCircle2,
} from 'lucide-react'
import {
  documents as fallbackDocuments,
  cvDownloadProps,
  cvOpenProps,
  resumeDownloadProps,
  resumeOpenProps,
} from '../../data/cv'
import { usePortfolioData } from '../../context/DataContext'
import { personalInfo } from '../../data/personal'
import { SectionHeading, FadeIn, Button } from '../ui/Shared'

export default function Resume() {
  const { documents: liveDocs } = usePortfolioData()
  const [selectedDoc, setSelectedDoc] = useState('cv') // 'cv' | 'resume'
  const [showPreview, setShowPreview] = useState(false)

  // Map live docs to cv & resume objects if present
  const liveCv = liveDocs?.find(d => d.category === 'cv')
  const liveResume = liveDocs?.find(d => d.category === 'resume')

  const docsMap = {
    cv: liveCv ? {
      ...fallbackDocuments.cv,
      title: liveCv.title,
      description: liveCv.description || fallbackDocuments.cv.description,
      filename: liveCv.filename || fallbackDocuments.cv.filename,
      path: liveCv.file_path || fallbackDocuments.cv.path,
    } : fallbackDocuments.cv,
    resume: liveResume ? {
      ...fallbackDocuments.resume,
      title: liveResume.title,
      description: liveResume.description || fallbackDocuments.resume.description,
      filename: liveResume.filename || fallbackDocuments.resume.filename,
      path: liveResume.file_path || fallbackDocuments.resume.path,
    } : fallbackDocuments.resume
  }

  const activeDoc = docsMap[selectedDoc] || docsMap.cv
  const isCv = selectedDoc === 'cv'

  const activeDownloadProps = {
    href: activeDoc.path,
    download: activeDoc.filename,
    title: `Download ${activeDoc.title}`
  }
  const activeOpenProps = {
    href: activeDoc.path,
    target: '_blank',
    rel: 'noopener noreferrer',
    title: `Open ${activeDoc.title} in new tab`
  }

  return (
    <section id="resume" className="section-padding relative bg-slate-50/50 dark:bg-slate-900/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Official Credentials"
          title="My Documents"
          description="Access and review my official credentials — preview documents directly in-browser or download the verified PDFs."
        />

        {/* Document Selection Tabs */}
        <div className="mx-auto mb-8 max-w-md">
          <div className="glass-card flex rounded-2xl border border-slate-200/80 p-1.5 dark:border-slate-800">
            <button
              onClick={() => {
                setSelectedDoc('cv')
                setShowPreview(false)
              }}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all sm:text-sm ${
                selectedDoc === 'cv'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Curriculum Vitae (CV)
            </button>
            <button
              onClick={() => {
                setSelectedDoc('resume')
                setShowPreview(false)
              }}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all sm:text-sm ${
                selectedDoc === 'resume'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Professional Resume
            </button>
          </div>
        </div>

        <FadeIn>
          <div className="glass-card mx-auto max-w-4xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
            <div className="border-b border-slate-200/60 p-6 dark:border-slate-700/60 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <motion.div
                    key={selectedDoc}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25"
                  >
                    <Files size={24} strokeWidth={2} />
                  </motion.div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                        {activeDoc.title}
                      </h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={11} />
                        Verified PDF
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                      {activeDoc.description}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      <Star size={12} />
                      {activeDoc.filename}
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap gap-2.5">
                  <Button
                    variant="secondary"
                    onClick={() => setShowPreview((prev) => !prev)}
                    aria-expanded={showPreview}
                  >
                    {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
                    <span>{showPreview ? 'Hide Preview' : `Preview ${isCv ? 'CV' : 'Resume'}`}</span>
                  </Button>

                  <Button {...activeDownloadProps}>
                    <Download size={15} />
                    <span>{activeDoc.label}</span>
                  </Button>

                  <Button variant="outline" {...activeOpenProps}>
                    <ExternalLink size={15} />
                    <span>Open in Tab</span>
                  </Button>
                </div>
              </div>

              {/* Two Direct Download Buttons banner */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 dark:border-indigo-500/20 dark:bg-indigo-500/10">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Quick Document Downloads:
                </span>
                <div className="flex flex-wrap gap-2">
                  <a
                    {...cvDownloadProps}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
                  >
                    <Download size={13} />
                    <span>Download CV (PDF)</span>
                  </a>
                  <a
                    {...resumeDownloadProps}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm transition-all hover:bg-indigo-50 dark:border-indigo-500/40 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"
                  >
                    <FileDown size={13} />
                    <span>Download Resume (PDF)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* In-browser PDF Previewer */}
            <AnimatePresence mode="wait">
              {showPreview && (
                <motion.div
                  key={`preview-${selectedDoc}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-b border-slate-200/60 bg-slate-100/60 p-4 dark:border-slate-700/60 dark:bg-slate-950/40 sm:p-6">
                    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-inner dark:border-slate-700 dark:bg-slate-900">
                      <iframe
                        src={`${activeDoc.path}#toolbar=0&navpanes=0`}
                        title={`${personalInfo.name} — ${activeDoc.title} Preview`}
                        className="h-[min(70vh,750px)] w-full"
                      />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Currently previewing: {activeDoc.filename}</span>
                      <a
                        {...activeOpenProps}
                        className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        Open in New Tab &rarr;
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showPreview && (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center sm:py-14">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 dark:border-indigo-500/30 dark:from-indigo-500/10 dark:to-violet-500/10">
                  <Files size={28} strokeWidth={2} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="font-display text-base font-bold text-slate-900 dark:text-white">
                  {activeDoc.title}
                </h4>
                <p className="mt-2 max-w-md text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                  Click <strong className="font-semibold text-slate-800 dark:text-slate-200">Preview {isCv ? 'CV' : 'Resume'}</strong> to view inline, or choose one of the direct download options below.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2.5">
                  <Button onClick={() => setShowPreview(true)}>
                    <Eye size={15} />
                    <span>Preview {isCv ? 'CV' : 'Resume'}</span>
                  </Button>
                  <Button variant="outline" {...cvDownloadProps}>
                    <Download size={15} />
                    <span>Download CV</span>
                  </Button>
                  <Button variant="outline" {...resumeDownloadProps}>
                    <FileDown size={15} />
                    <span>Download Resume</span>
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
