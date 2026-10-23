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
} from 'lucide-react'
import { personalInfo } from '../../data/personal'
import { usePortfolioData } from '../../context/DataContext'
import { SectionHeading, FadeIn, Button } from '../ui/Shared'

const contactLinks = [
  {
    icon: Mail,
    label: 'Email',
    value: personalInfo.email,
    href: `mailto:${personalInfo.email}`,
  },
  {
    icon: Phone,
    label: 'Phone / WhatsApp',
    value: personalInfo.phone || '0313-6576128',
    href: 'tel:03136576128',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/uroojkhadim',
    href: personalInfo.github,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'Connect on LinkedIn',
    href: personalInfo.linkedin,
  },
]

export default function Contact() {
  const { contact: liveContact } = usePortfolioData()

  const links = [
    {
      icon: Mail,
      label: liveContact?.email?.label || 'Email',
      value: liveContact?.email?.value || personalInfo.email,
      href: liveContact?.email?.href || `mailto:${liveContact?.email?.value || personalInfo.email}`,
      visible: liveContact?.email ? liveContact.email.visible !== 0 : true
    },
    {
      icon: Phone,
      label: liveContact?.phone?.label || 'Phone / WhatsApp',
      value: liveContact?.phone?.value || personalInfo.phone || '0313-6576128',
      href: liveContact?.phone?.href || 'tel:03136576128',
      visible: liveContact?.phone ? liveContact.phone.visible !== 0 : true
    },
    {
      icon: Github,
      label: liveContact?.github?.label || 'GitHub',
      value: liveContact?.github?.value || 'github.com/uroojkhadim',
      href: liveContact?.github?.href || personalInfo.github,
      visible: liveContact?.github ? liveContact.github.visible !== 0 : true
    },
    {
      icon: Linkedin,
      label: liveContact?.linkedin?.label || 'LinkedIn',
      value: liveContact?.linkedin?.value || 'Connect on LinkedIn',
      href: liveContact?.linkedin?.href || personalInfo.linkedin,
      visible: liveContact?.linkedin ? liveContact.linkedin.visible !== 0 : true
    },
  ].filter(l => l.visible)

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    _honeypot: '', // invisible honeypot for spam bot detection
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

      const data = await response.json()

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
          title="Let's build something exceptional"
          description="Have an internship opportunity, project collaboration, or inquiry? Send a message directly and I'll be notified in real time."
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
          {/* Contact Details Sidebar */}
          <FadeIn>
            <div className="space-y-4">
              {links.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-105">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 text-sm sm:text-base">
                      {value}
                    </p>
                  </div>
                </a>
              ))}

              <div className="glass-card flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Current Status</p>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    Open to Internships & Remote Roles
                  </p>
                </div>
              </div>

              {/* Notification Guarantee Note */}
              <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/60 p-5 text-xs text-slate-600 dark:border-indigo-500/20 dark:bg-indigo-950/30 dark:text-slate-400">
                <div className="flex items-center gap-2 font-semibold text-indigo-700 dark:text-indigo-300">
                  <Star size={14} />
                  <span>Real-Time Notifications Active</span>
                </div>
                <p className="mt-1 leading-relaxed">
                  Messages submitted here are securely saved to persistent storage and instantly trigger a real-time WhatsApp alert.
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
                    Direct server-side submission with instant notification delivery
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
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={22} className="shrink-0 text-emerald-500 mt-0.5" />
                      <div>
                        <h4 className="font-display text-sm font-bold text-emerald-800 dark:text-emerald-300">
                          Message Delivered Successfully!
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-emerald-700 dark:text-emerald-300/90">
                          {successInfo?.message || 'Thank you for reaching out! Your message has been saved and forwarded to Urooj.'}
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
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="shrink-0 text-rose-500 mt-0.5" />
                      <div>
                        <h4 className="font-display text-xs font-bold text-rose-800 dark:text-rose-300">
                          Submission Error
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
                    Spam-protected · Direct encrypted transmission
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
