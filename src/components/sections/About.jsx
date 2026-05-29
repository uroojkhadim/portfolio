import { GraduationCap, MapPin } from 'lucide-react'
import { personalInfo } from '../../data/personal'
import { interests } from '../../data/education'
import { SectionHeading, FadeIn } from '../ui/Shared'

export default function About() {
  return (
    <section id="about" className="section-padding relative">
      <div className="section-container">
        <SectionHeading
          eyebrow="About Me"
          title="Passionate about building meaningful software"
          description="A Software Engineering student with hands-on experience in web, mobile, and quality-focused development."
        />

        <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:gap-14">
          <FadeIn className="lg:sticky lg:top-28 lg:self-start">
            <div className="glass-card p-8 text-center">
              <div className="relative mx-auto mb-5 h-32 w-32">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 opacity-80" />
                <img
                  src={personalInfo.profileImage}
                  alt={personalInfo.name}
                  className="relative h-full w-full rounded-2xl object-cover shadow-lg"
                />
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                {personalInfo.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {personalInfo.role}
              </p>
              <div className="mt-5 space-y-2.5 text-left text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2.5">
                  <GraduationCap size={16} className="shrink-0 text-indigo-500" />
                  BS Software Engineering
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="shrink-0 text-indigo-500" />
                  {personalInfo.location}
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="space-y-8">
            <FadeIn delay={0.1}>
              <div className="glass-card p-8">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Introduction
                </h3>
                <div className="mt-4 space-y-4 text-slate-600 dark:text-slate-400">
                  <p className="leading-relaxed">
                    I am a dedicated Software Engineering student with a strong foundation in
                    building web and mobile applications. My academic journey has equipped me with
                    both theoretical knowledge and practical skills across the full software
                    development lifecycle.
                  </p>
                  <p className="leading-relaxed">
                    I enjoy turning ideas into functional products — from responsive frontends and
                    RESTful backends to quality-assured, well-documented software. I am actively
                    seeking internship opportunities and freelance projects where I can contribute,
                    learn, and grow.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="glass-card p-8">
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  Education
                </h3>
                <div className="mt-5 flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                      <GraduationCap size={18} />
                    </div>
                    <div className="mt-2 h-full w-px bg-gradient-to-b from-indigo-300 to-transparent dark:from-indigo-600" />
                  </div>
                  <div className="pb-2">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      Bachelor of Software Engineering
                    </h4>
                    <p className="mt-1 text-sm text-indigo-600 dark:text-indigo-400">
                      Currently Enrolled
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      Studying software design, web & mobile development, databases, software
                      quality engineering, and project-based development.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <h3 className="mb-5 font-display text-xl font-bold text-slate-900 dark:text-white">
                  Areas of Interest
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {interests.map((item, i) => (
                    <FadeIn key={item.title} delay={0.05 * i}>
                      <div className="glass-card group h-full p-5 transition-all hover:-translate-y-1 hover:shadow-glow">
                        <h4 className="font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  )
}
