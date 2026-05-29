import { motion } from 'framer-motion'
import { ArrowDown, Download, Github, Linkedin, Mail, Sparkles } from 'lucide-react'
import { personalInfo } from '../../data/personal'
import { cvAnchorProps } from '../../data/cv'
import { Button } from '../ui/Shared'
import { scrollToSection } from '../../hooks/useActiveSection'

const socialLinks = [
  { icon: Github, href: personalInfo.github, label: 'GitHub' },
  { icon: Linkedin, href: personalInfo.linkedin, label: 'LinkedIn' },
  { icon: Mail, href: `mailto:${personalInfo.email}`, label: 'Email' },
]

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden pt-24"
      aria-label="Hero section"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/15" />
        <div className="absolute -right-24 top-40 h-96 w-96 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-600/15" />
        <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-purple-400/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="section-container relative z-10 w-full">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-indigo-50/80 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              <Sparkles size={14} />
              Available for internships & freelance
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-500"
            >
              {personalInfo.title}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
            >
              Hi, I&apos;m{' '}
              <span className="gradient-text">{personalInfo.name}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200 sm:text-2xl"
            >
              {personalInfo.role}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="mt-3 text-lg font-medium text-indigo-600 dark:text-indigo-400"
            >
              {personalInfo.tagline}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400"
            >
              {personalInfo.intro}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.35 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button onClick={() => scrollToSection('projects')}>View Projects</Button>
              <Button variant="secondary" onClick={() => scrollToSection('contact')}>
                Contact Me
              </Button>
              <Button variant="outline" {...cvAnchorProps}>
                <Download size={16} />
                Download CV
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4 }}
              className="mt-10 flex items-center gap-4"
            >
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-xl border border-slate-200/80 bg-white/60 p-3 text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                >
                  <Icon size={18} />
                </a>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <div className="relative mx-auto aspect-square max-h-[420px] w-full max-w-sm">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-purple-500/30 blur-2xl"
              />
              <div className="glass-card relative h-full overflow-hidden rounded-[2rem] p-3">
                <div className="relative h-full overflow-hidden rounded-[1.5rem]">
                  <img
                    src={personalInfo.profileImage}
                    alt={personalInfo.name}
                    className="h-full w-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -right-2 top-8 rounded-xl border border-white/20 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm dark:bg-slate-900/90"
              >
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Focus</p>
                <p className="font-display text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  Full Stack Dev
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="absolute -left-2 bottom-16 rounded-xl border border-white/20 bg-white/90 px-4 py-2 shadow-lg backdrop-blur-sm dark:bg-slate-900/90"
              >
                <p className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  Web · Mobile · SQE
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={() => scrollToSection('about')}
          className="mx-auto mt-16 flex flex-col items-center gap-2 text-slate-400 transition-colors hover:text-indigo-500"
          aria-label="Scroll to about section"
        >
          <span className="text-xs font-medium uppercase tracking-widest">Explore</span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ArrowDown size={18} />
          </motion.span>
        </motion.button>
      </div>
    </section>
  )
}
