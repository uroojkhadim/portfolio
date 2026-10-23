import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Moon, Sun, Download, FileDown, ChevronRight } from 'lucide-react'
import { personalInfo, navLinks } from '../../data/personal'
import { cvDownloadProps, resumeDownloadProps } from '../../data/cv'
import { useTheme } from '../../context/ThemeContext'
import { useNavigation } from '../../context/NavigationContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { activePage, navigateTo } = useNavigation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleNavClick = (id) => {
    navigateTo(id)
    setIsOpen(false)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? 'border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800/90 dark:bg-slate-900/95'
          : 'border-b border-slate-200/50 bg-white/80 backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/80'
      }`}
    >
      <div className="section-container">
        <nav
          className="flex h-16 items-center justify-between gap-3 sm:gap-4"
          aria-label="Main navigation"
        >
          {/* Logo / Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="group flex items-center gap-2 font-display text-base font-bold tracking-tight text-slate-900 transition-colors dark:text-white sm:text-lg"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xs font-black text-white shadow-sm transition-transform group-hover:scale-105">
              UK
            </span>
            <span className="hidden xs:inline">
              {personalInfo.name}
            </span>
            <span className="inline xs:hidden">
              Urooj
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          </button>

          {/* Desktop Navigation Links */}
          <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {navLinks.map((link) => {
              const isActive = activePage === link.id
              return (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavClick(link.id)}
                    className={`relative rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 xl:px-3 xl:text-sm ${
                      isActive
                        ? 'bg-indigo-50/80 text-indigo-600 shadow-sm dark:bg-indigo-500/15 dark:text-indigo-400'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator-active"
                        className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Right Action Controls: Documents CTA, Theme Toggle, Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Direct Documents CTA */}
            <button
              onClick={() => handleNavClick('resume')}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400 sm:inline-flex"
            >
              <FileDown size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>Documents</span>
            </button>

            {/* Direct CV Download (visible on xl screens to maintain clean spacing) */}
            <a
              {...cvDownloadProps}
              className="hidden items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 xl:inline-flex"
              title="Download official CV (PDF)"
            >
              <Download size={13} />
              <span>Download CV</span>
            </a>

            {/* Theme Toggle Button (Desktop & Mobile header) */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white/70 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon size={16} className="text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white/70 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col justify-between overflow-y-auto bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                      UK
                    </span>
                    <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                      Menu
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Mobile Theme Toggle Card */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Theme Mode
                  </span>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun size={13} className="text-amber-400" />
                        <span>Light</span>
                      </>
                    ) : (
                      <>
                        <Moon size={13} className="text-indigo-600" />
                        <span>Dark</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Navigation Links List */}
                <ul className="mt-4 space-y-1">
                  {navLinks.map((link) => {
                    const isActive = activePage === link.id
                    return (
                      <li key={link.id}>
                        <button
                          onClick={() => handleNavClick(link.id)}
                          className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-indigo-50 font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400'
                              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span>{link.label}</span>
                          {isActive ? (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                          ) : (
                            <ChevronRight size={14} className="text-slate-400" />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Bottom Quick Action Credentials */}
              <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
                <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Official Documents
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    {...cvDownloadProps}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm"
                  >
                    <Download size={14} />
                    <span>Download CV (PDF)</span>
                  </a>
                  <a
                    {...resumeDownloadProps}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <FileDown size={14} />
                    <span>Download Resume (PDF)</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
