import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { personalInfo, navLinks } from '../../data/personal'
import { useTheme } from '../../context/ThemeContext'
import { useActiveSection, scrollToSection } from '../../hooks/useActiveSection'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const activeSection = useActiveSection(navLinks.map((l) => l.id))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleNavClick = (id) => {
    scrollToSection(id)
    setIsOpen(false)
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="section-container">
        <nav
          className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 sm:px-6 ${
            scrolled
              ? 'glass shadow-glass dark:shadow-glass-dark'
              : 'bg-transparent'
          }`}
          aria-label="Main navigation"
        >
          <button
            onClick={() => handleNavClick('home')}
            className="font-display text-lg font-bold text-slate-900 dark:text-white"
          >
            {personalInfo.name.split(' ')[0]}
            <span className="gradient-text">.</span>
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleNavClick(link.id)}
                  className={`relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col gap-2 bg-white p-6 pt-24 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNavClick(link.id)}
                  className={`rounded-xl px-4 py-3 text-left text-base font-medium transition-colors ${
                    activeSection === link.id
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {link.label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
