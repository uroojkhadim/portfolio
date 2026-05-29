import { useEffect, useState } from 'react'

export function useActiveSection(sectionIds, offset = 120) {
  const [activeSection, setActiveSection] = useState(sectionIds[0])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sectionIds[i])
          break
        }
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sectionIds, offset])

  return activeSection
}

export function scrollToSection(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
