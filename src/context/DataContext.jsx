/**
 * DataContext — loads every public portfolio section from the CMS API.
 *
 * The static files remain a read-only fallback for the public site only (so a
 * cold start or a network hiccup never blanks the portfolio). The admin panel
 * always reads the database directly and never falls back to static content.
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

import { webProjects } from '../data/projects'
import { mobileProjects as staticMobile } from '../data/mobileProjects'
import { skillCategories as staticSkills } from '../data/skills'
import { professionalExperiences } from '../data/experience'
import { educationData } from '../data/education'
import { personalInfo } from '../data/personal'
import { documents as staticDocuments } from '../data/cv'
import { fallbackServices } from '../data/services'

const DataContext = createContext(null)

const safeJsonFetch = async (url) => {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) return null
    const text = await res.text()
    return JSON.parse(text)
  } catch {
    return null
  }
}

const initialData = {
  webProjects,
  mobileProjects: staticMobile,
  apiSkillCategories: null,
  experience: professionalExperiences,
  education: [educationData],
  documents: Object.values(staticDocuments),
  certificates: [],
  services: fallbackServices,
  about: null,
  contact: null,
  settings: null,
  chatbotConfig: null,
  loaded: false,
  apiAvailable: false,
}

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData)

  const fetchAll = useCallback(async () => {
    const [
      projectsRes,
      skillsRes,
      expRes,
      eduRes,
      docsRes,
      certsRes,
      servicesRes,
      aboutRes,
      contactRes,
      settingsRes,
      chatbotRes,
    ] = await Promise.allSettled([
      safeJsonFetch('/api/public/projects'),
      safeJsonFetch('/api/public/skills'),
      safeJsonFetch('/api/public/experience'),
      safeJsonFetch('/api/public/education'),
      safeJsonFetch('/api/public/documents'),
      safeJsonFetch('/api/public/certificates'),
      safeJsonFetch('/api/public/services'),
      safeJsonFetch('/api/public/about'),
      safeJsonFetch('/api/public/contact'),
      safeJsonFetch('/api/public/settings'),
      safeJsonFetch('/api/public/chatbot-config'),
    ])

    const value = (result) => (result.status === 'fulfilled' ? result.value : null)

    const projects = value(projectsRes)
    const skills = value(skillsRes)
    const experience = value(expRes)
    const education = value(eduRes)
    const documents = value(docsRes)
    const certificates = value(certsRes)
    const services = value(servicesRes)
    const about = value(aboutRes)
    const contact = value(contactRes)
    const settings = value(settingsRes)
    const chatbotConfig = value(chatbotRes)

    setData(prev => ({
      ...prev,
      webProjects: projects?.web?.length ? projects.web : prev.webProjects,
      mobileProjects: projects?.mobile?.length ? projects.mobile : prev.mobileProjects,
      apiSkillCategories: skills?.length ? skills : null,
      experience: experience?.length ? experience : prev.experience,
      education: education?.length ? education : prev.education,
      documents: documents?.length ? documents : prev.documents,
      certificates: certificates ?? prev.certificates,
      services: services?.length ? services : prev.services,
      about: about && Object.keys(about).length ? about : null,
      contact: contact && Object.keys(contact).length ? contact : null,
      settings: settings && Object.keys(settings).length ? settings : null,
      chatbotConfig: chatbotConfig || null,
      loaded: true,
      apiAvailable: Boolean(projects || skills || experience || about),
    }))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <DataContext.Provider value={{ ...data, reload: fetchAll }}>
      {children}
    </DataContext.Provider>
  )
}

export function usePortfolioData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('usePortfolioData must be used within DataProvider')
  return ctx
}
