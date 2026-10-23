import { motion } from 'framer-motion'
import {
  Download,
  Github,
  Linkedin,
  Mail,
  ArrowRight,
  Code2,
  GraduationCap,
  Star,
  Smartphone,
} from 'lucide-react'
import { personalInfo as fallbackPersonal } from '../../data/personal'
import { cvDownloadProps } from '../../data/cv'
import { Button } from '../ui/Shared'
import { useNavigation } from '../../context/NavigationContext'
import { usePortfolioData } from '../../context/DataContext'

export default function Hero() {
  const { navigateTo } = useNavigation()
  const { about: liveAbout, contact: liveContact } = usePortfolioData()

  const name = liveAbout?.name || fallbackPersonal.name
  const role = liveAbout?.role || liveAbout?.title || 'Software Engineering Student & Developer'
  const headline = liveAbout?.hero_heading || 'Hi, I\'m '
  const description = liveAbout?.hero_description || fallbackPersonal.bio || 'Passionate about building responsive web applications, cross-platform Flutter mobile solutions, and intelligent digital tools. Combining solid computer science fundamentals with hands-on full-stack project experience.'
  const availability = liveAbout?.availability_status || 'Available for Remote Roles & Internships'
  const showAvailability = liveAbout ? !!liveAbout.availability_active : true
  const profileImg = liveAbout?.profile_image || '/profile.png'
  const universityDegree = (liveAbout?.university && liveAbout?.degree)
    ? `${liveAbout.university} · ${liveAbout.degree}`
    : 'COMSATS University Islamabad · BS Software Engineering'

  const ghLink = liveContact?.github?.value || liveContact?.github?.href || fallbackPersonal.github
  const liLink = liveContact?.linkedin?.value || liveContact?.linkedin?.href || fallbackPersonal.linkedin
  const emLink = liveContact?.email?.value || fallbackPersonal.email

  const socialLinks = [
    { icon: Github, href: ghLink, label: 'GitHub Profile' },
    { icon: Linkedin, href: liLink, label: 'LinkedIn Profile' },
    { icon: Mail, href: emLink.startsWith('mailto:') ? emLink : `mailto:${emLink}`, label: 'Send Email' },
  ]

  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-10 sm:py-14 lg:py-16"
      aria-label="Hero section"
    >
      {/* Subtle Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-600/15" />
        <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-600/15" />
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="section-container relative z-10 w-full">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Text, Title, Description, Actions */}
          <div className="flex flex-col justify-center text-center sm:text-left lg:col-span-7">
            {/* Availability Pill */}
            {showAvailability && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300 sm:mx-0"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span>{availability}</span>
              </motion.div>
            )}

            {/* Main Greeting & Name */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl leading-[1.12]"
            >
              Hi, I&apos;m{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                {name}
              </span>
            </motion.h1>

            {/* Professional Role Title */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.14 }}
              className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100 sm:text-xl"
            >
              {role}
            </motion.p>

            {/* Subheading / Degree highlight */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="mt-1 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 sm:justify-start"
            >
              <GraduationCap size={16} />
              <span>{universityDegree}</span>
            </motion.p>

            {/* Concise Bio */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.26 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base"
            >
              {description}
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.32 }}
              className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:justify-start"
            >
              <Button onClick={() => navigateTo('projects')} className="shadow-md">
                <span>View Projects</span>
                <ArrowRight size={15} />
              </Button>

              <Button variant="secondary" onClick={() => navigateTo('contact')}>
                <span>Contact Me</span>
              </Button>

              <a
                {...cvDownloadProps}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              >
                <Download size={15} />
                <span>Download CV</span>
              </a>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.38 }}
              className="mt-7 flex items-center justify-center gap-2.5 sm:justify-start"
            >
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mr-1">
                Connect:
              </span>
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-xl border border-slate-200/80 bg-white/70 p-2 text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  title={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </motion.div>
          </div>

          {/* Right Column: Profile Picture Visual Treatment */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="flex justify-center lg:col-span-5 lg:justify-end"
          >
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-[360px]">
              {/* Ambient Glow */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-indigo-500/25 via-violet-500/20 to-purple-500/25 blur-2xl" />

              {/* Main Profile Card Container */}
              <div className="relative rounded-3xl border border-slate-200/80 bg-white/80 p-3 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-2xl">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <img
                    src={profileImg}
                    alt={name}
                    className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-[1.02]"
                    loading="eager"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
                </div>
              </div>

              {/* Floating Badge 1: Flutter & Mobile */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -bottom-3 -left-3 hidden items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 sm:flex"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                  <Smartphone size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-medium text-slate-400">Specialization</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Flutter &amp; Mobile
                  </p>
                </div>
              </motion.div>

              {/* Floating Badge 2: Full-Stack Web */}
              <motion.div
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="absolute -right-3 -top-3 hidden items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 sm:flex"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
                  <Code2 size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-medium text-slate-400">Stack</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    React &amp; Full-Stack
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
