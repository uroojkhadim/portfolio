import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
  Phone,
  MessageSquare,
  MessageCircle,
  Link2,
} from 'lucide-react'
import { personalInfo } from '../../data/personal'
import { usePortfolioData } from '../../context/DataContext'
import { SectionHeading, FadeIn, Button } from '../ui/Shared'

const ICON_MAP = {
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  github: Github,
  linkedin: Linkedin,
  location: MapPin,
}

function ensureProtocol(value, fallbackPrefix = 'https://') {
  if (!value) return ''
  const trimmed = String(value).trim()
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed
  return `${fallbackPrefix}${trimmed.replace(/^\/+/, '')}`
}

function buildLink(key, item) {
  const value = item.value || ''
  const href = item.href || ''

  if (key === 'email') {
    const email = value.replace(/^mailto:/, '')
    return { href: href || `mailto:${email}`, external: false, display: value.replace(/^mailto:/, '') }
  }
  if (key === 'phone') {
    return { href: href || personalInfo.phoneHref, external: false, display: value }
  }
  if (key === 'whatsapp') {
    return { href: href || personalInfo.whatsapp, external: true, display: value }
  }
  if (key === 'linkedin') {
    return { href: ensureProtocol(href || value, 'https://www.linkedin.com/in/'), external: true, display: value }
  }
  if (key === 'github') {
    return { href: ensureProtocol(href || value, 'https://github.com/'), external: true, display: value }
  }
  if (key === 'location') {
    return { href: href || null, external: false, display: value }
  }
  return { href: href ? ensureProtocol(href) : null, external: true, display: value }
}

export default function Contact() {
  const { contact: liveContact, about } = usePortfolioData()

  const contactEntries = Object.entries(liveContact || {})
    .filter(([, item]) => item && item.value && item.visible !== 0)
    .filter(([key]) => ['email', 'phone', 'whatsapp', 'github', 'linkedin', 'location'].includes(key))
    .sort(([a], [b]) => {
      const order = ['email', 'whatsapp', 'phone', 'linkedin', 'github', 'location']
      return order.indexOf(a) - order.indexOf(b)
    })

  // WhatsApp already represents the phone number; show it once.
  const hasWhatsApp = contactEntries.some(([key]) => key === 'whatsapp')

  const linkItems = contactEntries
    .filter(([key]) => key !== 'location' && !(key === 'phone' && hasWhatsApp))
    .map(([key, item]) => {
      const link = buildLink(key, item)
      return {
        key,
        label: item.label || key,
        icon: ICON_MAP[key] || Link2,
        ...link,
      }
    })

  const locationItem = contactEntries.find(([key]) => key === 'location')?.[1]

  const heading = liveContact?.contact_heading?.value || "Let's build something exceptional"
  const description = liveContact?.contact_description?.value
    || 'Have an internship opportunity, project collaboration, or inquiry? Send a message directly and it will land in my inbox.'

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    _honeypot: '',
  })
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const [successInfo, setSuccessInfo] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
    if (status === 'error') {
      setStatus('idle')
      setErrorMessage('')
    }
  }

  const validateForm = () => {
    if (!formState.name.trim() || formState.name.trim().length < 2) {
      setErrorMessage('Please enter your full name (minimum 2 characters).')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formState.email.trim() || !emailRegex.test(formState.email.trim())) {
      setErrorMessage('Please enter a valid email address.')
      return false
    }
    if (!formState.subject.trim() || formState.subject.trim().length < 3) {
      setErrorMessage('Please enter a subject (minimum 3 characters).')
      return false
    }
    if (!formState.message.trim() || formState.message.trim().length < 10) {
      setErrorMessage('Please provide a message of at least 10 characters.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      setStatus('error')
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      })

      const text = await response.text()
      let data = {}
      try {
        data = JSON.parse(text)
      } catch {
        data = { error: response.ok ? 'Invalid response from the server.' : `Server responded with ${response.status}: ${response.statusText || 'Unable to submit'}` }
      }

      if (!response.ok) {
        throw new Error(data.error || `Server responded with ${response.status}`)
      }

      setStatus('success')
      setSuccessInfo(data)
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
        _honeypot: '',
      })
    } catch (err) {
      console.error('[Contact Form Error]:', err)
      setStatus('error')
      setErrorMessage(
        err.message || 'Unable to submit your message right now. Please try again or email directly.'
      )
    }
  }

  return (
    <section id="contact" className="section-padding relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute top-10 right-1/4 h-72 w-72 rounded-full bg-indigo-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Contact"
          title={heading}
          description={description}
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact Details Sidebar */}
          <FadeIn>
            <div className="space-y-4">
              {linkItems.map(({ key, icon: Icon, label, href, external, display }) => {
                const content = (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                      <p className="break-words font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 text-sm sm:text-base">
                        {display}
                      </p>
                    </div>
                  </>
                )

                return href ? (
                  <a
                    key={key}
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={external ? `${label}: ${display} (opens in a new tab)` : `${label}: ${display}`}
                    className="glass-card group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
                  >
                    {content}
                  </a>
                ) : (
                  <div key={key} className="glass-card flex items-center gap-4 p-5">
                    {content}
                  </div>
                )
              })}

              <div className="glass-card flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Status</p>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    {locationItem?.value || about?.availability_status || 'Open to Internships & Remote Roles'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-5 text-xs text-slate-600 dark:border-indigo-500/20 dark:bg-indigo-950/30 dark:text-slate-400">
                <div className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300">
                  <Star size={14} />
                  <span>Inbox &amp; notifications</span>
                </div>
                <p className="mt-1 leading-relaxed">
                  Messages are saved to the portfolio inbox as soon as you send them. Email and WhatsApp alerts
                  are delivered when those notification channels are configured.
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Interactive Contact Form */}
          <FadeIn delay={0.1}>
            <div className="glass-card p-7 sm:p-9 border border-slate-200/80 dark:border-slate-800">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200/60 pb-4 dark:border-slate-700/60">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                    Send a Message
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Saved directly to my admin inbox
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <MessageSquare size={18} />
                </div>
              </div>

              {/* Success Banner */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-900 dark:text-emerald-200"
                    role="status"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={22} className="shrink-0 text-emerald-500 mt-0.5" />
                      <div>
                        <h4 className="font-display text-sm font-bold text-emerald-800 dark:text-emerald-300">
                          Message saved successfully
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-300/90">
                          {successInfo?.message || 'Thank you for reaching out! Your message has been saved.'}
                        </p>
                        {successInfo?.messageId && (
                          <p className="mt-2 text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                            Reference ID: {successInfo.messageId}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => setStatus('idle')}
                          className="mt-3 text-xs font-semibold text-emerald-700 underline hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
                        >
                          Send another message
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Banner */}
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-900 dark:text-rose-200"
                    role="alert"
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="shrink-0 text-rose-500 mt-0.5" />
                      <div>
                        <h4 className="font-display text-xs font-bold text-rose-800 dark:text-rose-300">
                          Submission error
                        </h4>
                        <p className="mt-0.5 text-xs text-rose-700 dark:text-rose-300/90">
                          {errorMessage}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The Form */}
              <form onSubmit={handleSubmit} noValidate>
                {/* Honeypot field (hidden from humans) */}
                <input
                  type="text"
                  name="_honeypot"
                  value={formState._honeypot}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      disabled={status === 'submitting'}
                      placeholder="e.g. Sarah Jenkins"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:border-indigo-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      disabled={status === 'submitting'}
                      placeholder="e.g. sarah@company.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="contact-subject"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    value={formState.subject}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                    placeholder="e.g. Software Engineering Internship Opportunity"
                    className="w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:border-indigo-400"
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={handleChange}
                    disabled={status === 'submitting'}
                    placeholder="Describe your project, role details, or inquiry..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white dark:focus:border-indigo-400"
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Spam-protected · Saved to the portfolio inbox
                  </p>
                  <Button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full sm:w-auto"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
