import { motion } from 'framer-motion'
import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react'
import { personalInfo } from '../../data/personal'

const socialLinks = [
  { icon: Github, href: personalInfo.github, label: 'GitHub' },
  { icon: Linkedin, href: personalInfo.linkedin, label: 'LinkedIn' },
  { icon: Mail, href: `mailto:${personalInfo.email}`, label: 'Email' },
]

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-slate-200/80 bg-white/50 py-10 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="section-container">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
              {personalInfo.name}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-xl p-2.5 text-slate-500 transition-all hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
              >
                <Icon size={18} />
              </a>
            ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className="ml-2 flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-shadow hover:shadow-indigo-500/35"
              aria-label="Back to top"
            >
              <ArrowUp size={16} />
              <span className="hidden sm:inline">Top</span>
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}
