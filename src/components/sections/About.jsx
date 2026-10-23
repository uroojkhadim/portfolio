import {
  GraduationCap,
  MapPin,
  Building2,
  Code2,
  Smartphone,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
  Download,
  FileDown,
} from 'lucide-react'
import { personalInfo, aboutInterests } from '../../data/personal'
import { cvDownloadProps, resumeDownloadProps } from '../../data/cv'
import { SectionHeading, FadeIn, Button } from '../ui/Shared'
import { useNavigation } from '../../context/NavigationContext'
import { usePortfolioData } from '../../context/DataContext'

const focusIcons = {
  0: Code2,
  1: Smartphone,
  2: BrainCircuit,
  3: ShieldCheck,
}

export default function About() {
  const { navigateTo } = useNavigation()
  const { about: liveAbout } = usePortfolioData()

  const degree = liveAbout?.degree || personalInfo.degree
  const university = liveAbout?.university || personalInfo.university
  const location = liveAbout?.location || personalInfo.location
  const bio = liveAbout?.bio || null

  return (
    <section id="about" className="section-padding relative">
      <div className="section-container relative">
        <SectionHeading
          eyebrow="About Me"
          title="Engineering thoughtful digital experiences"
          description="A dedicated Software Engineering student combining computer science foundations with hands-on web, mobile, and intelligent systems development."
        />

        {/* Bio & Academic Identity Card */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Main Story & Philosophy */}
          <FadeIn className="lg:col-span-8">
            <div className="glass-card flex h-full flex-col justify-between border border-slate-200/80 p-6 sm:p-8 dark:border-slate-800">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Professional Background
                </h3>
                {bio ? (
                  <div className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base whitespace-pre-line">
                    <p>{bio}</p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
                    <p>
                      I am a Senior Software Engineering student at{' '}
                      <strong className="font-semibold text-slate-900 dark:text-white">
                        COMSATS University Islamabad (Vehari Campus)
                      </strong>
                      . My journey in technology centers on architecting scalable software, crafting intuitive user interfaces, and solving real-world challenges through clean, maintainable code.
                    </p>
                    <p>
                      Over the course of my academic and practical career, I have developed full-stack web applications using React, modern JavaScript, and RESTful backends, alongside cross-platform mobile apps using Flutter and Dart. I have also completed professional internships in frontend and Android development, gaining experience with team workflows, version control, and client-facing requirements.
                    </p>
                    <p>
                      I am driven by continuous improvement, whether that involves refining software quality engineering practices, exploring applied machine learning algorithms in Python, or writing responsive UI components.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                <Button onClick={() => navigateTo('projects')}>
                  <span>Explore My Work</span>
                  <ArrowRight size={15} />
                </Button>
                <a
                  {...cvDownloadProps}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                >
                  <Download size={14} />
                  <span>Download CV</span>
                </a>
                <a
                  {...resumeDownloadProps}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-2.5 text-xs font-semibold text-indigo-700 shadow-sm transition-all hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/15 dark:text-indigo-300"
                >
                  <FileDown size={14} />
                  <span>Download Resume</span>
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Quick Facts & Key Metrics Sidebar */}
          <FadeIn delay={0.1} className="lg:col-span-4">
            <div className="glass-card flex h-full flex-col justify-between border border-slate-200/80 p-6 sm:p-7 dark:border-slate-800">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Quick Details
                </h3>

                <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2.5">
                    <GraduationCap size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Degree</p>
                      <p>{personalInfo.degree}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Building2 size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">University</p>
                      <p>{personalInfo.university}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-indigo-500" />
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Location &amp; Availability</p>
                      <p>{personalInfo.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlights Summary Grid */}
              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                  <span className="font-display text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    14+
                  </span>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Active Projects
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                  <span className="font-display text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                    3+
                  </span>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Industry Roles
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Core Focus Areas */}
        <div className="mt-14">
          <div className="mb-6">
            <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Core Technical Focus Areas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Primary domains of development and software architecture expertise
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {aboutInterests.map((item, i) => {
              const Icon = focusIcons[i] || Code2
              return (
                <FadeIn key={item.title} delay={0.06 * i}>
                  <div className="glass-card group flex h-full flex-col justify-between border border-slate-200/80 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow dark:border-slate-800 sm:p-6">
                    <div>
                      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/20 dark:text-indigo-400">
                        <Icon size={20} />
                      </div>
                      <h4 className="font-display text-base font-bold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-3 text-[11px] font-medium text-indigo-600 dark:border-slate-800 dark:text-indigo-400">
                      Core Domain &rarr;
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
