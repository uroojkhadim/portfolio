import {
  GraduationCap,
  Building2,
  Calendar,
  BookOpen,
  Award,
  Star,
  Layers,
} from 'lucide-react'
import { educationData as fallbackEducation } from '../../data/education'
import { usePortfolioData } from '../../context/DataContext'
import { SectionHeading, FadeIn } from '../ui/Shared'

export default function Education() {
  const { education: liveEduList } = usePortfolioData()
  const firstEdu = (liveEduList && liveEduList.length > 0) ? liveEduList[0] : null

  const data = firstEdu ? {
    ...fallbackEducation,
    degree: firstEdu.degree || fallbackEducation.degree,
    institution: firstEdu.institution || fallbackEducation.institution,
    duration: (firstEdu.start_date && firstEdu.end_date)
      ? `${firstEdu.start_date} – ${firstEdu.is_current ? 'Present' : firstEdu.end_date}`
      : fallbackEducation.duration,
    status: firstEdu.status_label || fallbackEducation.status,
    description: firstEdu.description || fallbackEducation.description,
  } : fallbackEducation
  return (
    <section id="education" className="section-padding relative bg-slate-50/50 dark:bg-slate-900/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-1/4 top-10 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute left-1/4 bottom-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Education"
          title="Academic Journey &amp; Qualifications"
          description="Formal software engineering education at COMSATS University Islamabad, combining computer science foundations with applied project engineering."
        />

        {/* Primary Degree Card */}
        <FadeIn>
          <div className="glass-card mb-10 sm:mb-12 overflow-hidden border border-slate-200/80 p-6 sm:p-8 dark:border-slate-800">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
                  <GraduationCap size={28} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                      Bachelor of Science
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {data.status}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
                    {data.degree}
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    <Building2 size={16} />
                    {data.institution}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {data.description}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-slate-200/80 bg-white/60 p-4 dark:border-slate-700/60 dark:bg-slate-800/60 lg:min-w-[200px]">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar size={14} className="text-indigo-500" />
                  <span>Timeline: {data.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <Layers size={14} className="text-indigo-500" />
                  <span>8 Academic Semesters</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Star size={14} />
                  <span>Actively Enrolled</span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Categorized Coursework Grid */}
        <div className="mb-10 sm:mb-12">
          <div className="mb-6">
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Core Academic Coursework
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rigorous theoretical and laboratory curriculum completed at COMSATS University
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {(data.courseworkCategories || fallbackEducation.courseworkCategories).map((group, gIdx) => (
              <FadeIn key={group.category} delay={gIdx * 0.08}>
                <div className="glass-card flex h-full flex-col justify-between border border-slate-200/80 p-6 dark:border-slate-800">
                  <div>
                    <div className="mb-4 flex items-center gap-2.5 border-b border-slate-200/60 pb-3 dark:border-slate-700/60">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                        <BookOpen size={16} />
                      </div>
                      <h4 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                        {group.category}
                      </h4>
                    </div>

                    <ul className="space-y-2.5">
                      {group.courses.map((course) => (
                        <li
                          key={course}
                          className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                          <span>{course}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Academic Achievements Banner */}
        <FadeIn delay={0.15}>
          <div className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/70 p-6 dark:border-indigo-500/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
                <Award size={20} />
              </div>
              <div>
                <h4 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Academic &amp; Extracurricular Highlights
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recognized competencies developed through university participation
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {(data.achievements || fallbackEducation.achievements).map((ach) => (
                <div
                  key={ach.title}
                  className="rounded-xl border border-slate-200/60 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <h5 className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {ach.title}
                  </h5>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {ach.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
