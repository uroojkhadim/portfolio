import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { navLinks } from '../data/personal'

const NavigationContext = createContext({
  activePage: 'home',
  navigateTo: () => {},
  setActiveSection: () => {},
})

const VALID_PAGES = navLinks.map((link) => link.id)

const PAGE_TITLES = {
  home: 'Urooj Khadim | Software Engineering Student & Developer',
  about: 'About Me | Urooj Khadim',
  skills: 'Technical Skills | Urooj Khadim',
  experience: 'Work Experience & Roles | Urooj Khadim',
  projects: 'Projects Showcase | Urooj Khadim',
  education: 'Academic Education & Coursework | Urooj Khadim',
  roadmap: 'Learning Roadmap | Urooj Khadim',
  resume: 'My Documents | Urooj Khadim',
  contact: 'Contact & Hire | Urooj Khadim',
}

function resolvePageFromLocation() {
  if (typeof window === 'undefined') return 'home'

  // 1. Check path (e.g. /projects or /education or /about)
  const pathname = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase()
  if (pathname && VALID_PAGES.includes(pathname)) {
    return pathname
  }

  // 2. Check hash (e.g. #projects or #education)
  const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
  if (hash && VALID_PAGES.includes(hash)) {
    return hash
  }

  return 'home'
}

function scrollToElement(id) {
  if (typeof window === 'undefined') return
  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  if (el) {
    const yOffset = -72 // Offset for sticky navbar
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

export function NavigationProvider({ children }) {
  const [activePage, setActivePage] = useState(resolvePageFromLocation)

  // Navigate to a specific page / section ID and update browser history
  const navigateTo = useCallback((pageId) => {
    if (!VALID_PAGES.includes(pageId)) return

    setActivePage(pageId)

    const targetPath = pageId === 'home' ? '/' : `/${pageId}`
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ pageId }, '', targetPath)
    }

    scrollToElement(pageId)

    if (PAGE_TITLES[pageId]) {
      document.title = PAGE_TITLES[pageId]
    }
  }, [])

  // Update active section state during natural scroll without triggering programmatic scroll
  const setActiveSection = useCallback((pageId) => {
    if (!VALID_PAGES.includes(pageId)) return
    setActivePage(pageId)
    const targetPath = pageId === 'home' ? '/' : `/${pageId}`
    if (window.location.pathname !== targetPath) {
      window.history.replaceState({ pageId }, '', targetPath)
    }
    if (PAGE_TITLES[pageId]) {
      document.title = PAGE_TITLES[pageId]
    }
  }, [])

  // Listen to browser Back/Forward (popstate) and hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      const page = resolvePageFromLocation()
      setActivePage(page)
      scrollToElement(page)
      if (PAGE_TITLES[page]) {
        document.title = PAGE_TITLES[page]
      }
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)

    // Set initial title
    if (PAGE_TITLES[activePage]) {
      document.title = PAGE_TITLES[activePage]
    }

    // If initial load targeted a specific section (e.g., /projects or /education), scroll after mount
    if (activePage && activePage !== 'home') {
      const timer = setTimeout(() => {
        scrollToElement(activePage)
      }, 350)
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  return (
    <NavigationContext.Provider value={{ activePage, navigateTo, setActiveSection }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
