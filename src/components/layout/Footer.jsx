import { motion } from 'framer-motion'
import { ArrowUp, Github, Linkedin, Mail, MessageCircle, Heart } from 'lucide-react'
import { personalInfo, navLinks } from '../../data/personal'
import { useNavigation } from '../../context/NavigationContext'
import { usePortfolioData } from '../../context/DataContext'
import { resolveFooterText } from '../../hooks/useSiteSettings'

function ensureProtocol(value, fallbackPrefix = 'https://') {
  if (!value) return ''
  const trimmed = String(value).trim()
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed
  return `${fallbackPrefix}${trimmed.replace(/^\/+/, '')}`
}

export default function Footer() {
  const { navigateTo } = useNavigation()
  const { contact, about, settings } = usePortfolioData()

  const email = contact?.email?.value?.replace(/^mailto:/, '') || personalInfo.email
  const github = ensureProtocol(contact?.github?.href || contact?.github?.value || personalInfo.github, 'https://github.com/')
  const linkedin = ensureProtocol(contact?.linkedin?.href || contact?.linkedin?.value || personalInfo.linkedin, 'https://www.linkedin.com/in/')
  const whatsapp = contact?.whatsapp?.href || personalInfo.whatsapp

  const socialLinks = [
    { icon: Github, href: github, label: 'GitHub profile' },
    { icon: Linkedin, href: linkedin, label: 'LinkedIn profile' },
    { icon: MessageCircle, href: whatsapp, label: 'Chat on WhatsApp' },
    { icon: Mail, href: `mailto:${email}`, label: 'Send an email' },
  ]

  const name = about?.name || personalInfo.name
  const footerText = resolveFooterText(settings?.footer_text, name)
    || `© ${new Date().getFullYear()} ${name}. All rights reserved · Software Engineering Student & Developer`

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="border-t border-slate-200/80 bg-white/70 py-10 dark:border-slate-800 dark:bg-slate-950/70">
      <div className="section-container">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center gap-2 md:justify-start">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-black text-white">
                {settings?.navbar_brand || 'UK'}
              </span>
              <p className="font-display text-sm font-bold text-slate-900 dark:text-white">
                {name}
              </p>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {footerText}
            </p>
          </div>

          {/* Quick Page Links */}
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => navigateTo(link.id)}
                  className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {socialLinks.map(({ icon: Icon, href, label }) => {
              const external = /^https?:/i.test(href)
              return (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  aria-label={label}
                  title={label}
                  className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                >
                  <Icon size={16} />
                </a>
              )
            })}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              className="ml-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
              aria-label="Back to top"
            >
              <ArrowUp size={14} />
              <span>Top</span>
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  )
}
