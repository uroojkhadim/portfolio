import { motion } from 'framer-motion'

export function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  const alignClass =
    align === 'left' ? 'text-left items-start' : 'text-center items-center mx-auto'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className={`mb-14 flex max-w-2xl flex-col gap-3 ${alignClass}`}
    >
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
          {description}
        </p>
      )}
    </motion.div>
  )
}

export function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Button({ children, variant = 'primary', href, onClick, className = '', type = 'button', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900'

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:brightness-110',
    secondary:
      'glass text-slate-700 hover:bg-white/90 dark:text-slate-200 dark:hover:bg-slate-800/80',
    outline:
      'border border-slate-200 bg-transparent text-slate-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400',
    ghost:
      'text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400',
  }

  const classes = `${base} ${variants[variant]} ${className}`

  if (href) {
    const isExternal = href.startsWith('http')
    return (
      <a
        href={href}
        className={classes}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes} {...props}>
      {children}
    </button>
  )
}
