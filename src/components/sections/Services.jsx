import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { usePortfolioData } from '../../context/DataContext'
import { serviceIconMap, fallbackServices } from '../../data/services'
import { SectionHeading, FadeIn, Button } from '../ui/Shared'
import { useNavigation } from '../../context/NavigationContext'

export default function Services() {
  const { services: liveServices } = usePortfolioData()
  const { navigateTo } = useNavigation()

  const services = (liveServices && liveServices.length > 0) ? liveServices : fallbackServices

  return (
    <section id="services" className="section-padding relative bg-slate-50/50 dark:bg-slate-900/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-10 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Services"
          title="How I can help your project"
          description="Practical software, web, mobile and digital services delivered with clear communication and maintainable code."
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = serviceIconMap[service.icon_name] || CheckCircle2
            const technologies = Array.isArray(service.technologies) ? service.technologies : []

            return (
              <FadeIn key={service.id || service.title} delay={index * 0.05}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="glass-card flex h-full flex-col border border-slate-200/80 p-6 transition-shadow hover:shadow-glow dark:border-slate-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20">
                      <Icon size={20} />
                    </div>
                    {service.availability && (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {service.availability}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                    {service.title}
                  </h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 sm:text-sm">
                    {service.description}
                  </p>

                  {technologies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {technologies.slice(0, 5).map(tech => (
                        <span
                          key={tech}
                          className="rounded-md border border-slate-200/70 bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </FadeIn>
            )
          })}
        </div>

        <FadeIn delay={0.15}>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 p-6 dark:border-indigo-500/20 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/20 sm:flex-row">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                Have a project in mind?
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Share your requirements and I will respond with a clear scope and next steps.
              </p>
            </div>
            <Button onClick={() => navigateTo('contact')} className="shrink-0">
              <span>Start a conversation</span>
              <ArrowRight size={15} />
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
