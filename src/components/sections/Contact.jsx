import { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, MapPin, Send, CheckCircle } from 'lucide-react'
import { personalInfo } from '../../data/personal'
import { SectionHeading, FadeIn, Button } from '../ui/Shared'

const contactLinks = [
  {
    icon: Mail,
    label: 'Email',
    value: personalInfo.email,
    href: `mailto:${personalInfo.email}`,
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
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { name, email, subject, message } = formState
    const mailtoLink = `mailto:${personalInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`
    window.location.href = mailtoLink
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section id="contact" className="section-padding relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <div className="section-container relative">
        <SectionHeading
          eyebrow="Contact"
          title="Let's work together"
          description="Have an internship opportunity, project idea, or just want to connect? I'd love to hear from you."
        />

        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <FadeIn>
            <div className="space-y-5">
              {contactLinks.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card group flex items-center gap-4 p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg transition-transform group-hover:scale-105">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
                  </div>
                </a>
              ))}

              <div className="glass-card flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    Open to internships & freelance
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <form onSubmit={handleSubmit} className="glass-card p-8">
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Send a message
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Fill out the form and your default email client will open with the message ready to
                send.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Subject
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formState.subject}
                  onChange={handleChange}
                  placeholder="Project inquiry"
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={handleChange}
                  placeholder="Tell me about your project or opportunity..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                />
              </div>

              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400"
                >
                  <CheckCircle size={16} />
                  Opening your email client...
                </motion.div>
              )}

              <Button type="submit" className="mt-6 w-full sm:w-auto">
                <Send size={16} />
                Send Message
              </Button>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
