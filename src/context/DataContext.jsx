/**
 * DataContext — Fetches all public portfolio data from the API.
 * Falls back to static JS data if the API is unavailable.
 */
import { createContext, useContext, useEffect, useState } from 'react'

// Static fallbacks
import { webProjects } from '../data/projects'
import { mobileProjects as staticMobile } from '../data/mobileProjects'
import { skillCategories as staticSkills } from '../data/skills'
import { professionalExperiences, experienceOverview as staticExpOverview } from '../data/experience'
import { educationData } from '../data/education'
import { personalInfo } from '../data/personal'
import { documents as staticDocuments } from '../data/cv'

const DataContext = createContext(null)

function mapSkillsFromApi(apiData) {
  if (!apiData || !Array.isArray(apiData)) return null
  // Map icon_name string back to the icon component for Skills.jsx
  return apiData
}

export function DataProvider({ children }) {
  const [data, setData] = useState({
    webProjects: webProjects,
    mobileProjects: staticMobile,
    skillCategories: null, // null = use static (for icon resolution)
    experience: professionalExperiences,
    education: [educationData],
    documents: Object.values(staticDocuments),
    certificates: [],
    about: null,
    contact: null,
    settings: null,
    loaded: false,
    apiAvailable: false,
  })

  useEffect(() => {
    async function fetchAll() {
      try {
        const [projectsRes, skillsRes, expRes, eduRes, docsRes, certsRes, aboutRes, contactRes, settingsRes] = await Promise.allSettled([
          fetch('/api/public/projects').then(r => r.ok ? r.json() : null),
          fetch('/api/public/skills').then(r => r.ok ? r.json() : null),
          fetch('/api/public/experience').then(r => r.ok ? r.json() : null),
          fetch('/api/public/education').then(r => r.ok ? r.json() : null),
          fetch('/api/public/documents').then(r => r.ok ? r.json() : null),
          fetch('/api/public/certificates').then(r => r.ok ? r.json() : null),
          fetch('/api/public/about').then(r => r.ok ? r.json() : null),
          fetch('/api/public/contact').then(r => r.ok ? r.json() : null),
          fetch('/api/public/settings').then(r => r.ok ? r.json() : null),
        ])

        const projects = projectsRes.status === 'fulfilled' ? projectsRes.value : null
        const skills = skillsRes.status === 'fulfilled' ? skillsRes.value : null
        const exp = expRes.status === 'fulfilled' ? expRes.value : null
        const edu = eduRes.status === 'fulfilled' ? eduRes.value : null
        const docs = docsRes.status === 'fulfilled' ? docsRes.value : null
        const certs = certsRes.status === 'fulfilled' ? certsRes.value : null
        const about = aboutRes.status === 'fulfilled' ? aboutRes.value : null
        const contact = contactRes.status === 'fulfilled' ? contactRes.value : null
        const settings = settingsRes.status === 'fulfilled' ? settingsRes.value : null

        const apiAvailable = !!(projects || skills || exp)

        setData(prev => ({
          ...prev,
          webProjects: projects?.web ?? prev.webProjects,
          mobileProjects: projects?.mobile ?? prev.mobileProjects,
          apiSkillCategories: skills || null,
          experience: exp ?? prev.experience,
          education: edu ?? prev.education,
          documents: docs ?? prev.documents,
          certificates: certs ?? prev.certificates,
          about: about || null,
          contact: contact || null,
          settings: settings || null,
          loaded: true,
          apiAvailable,
        }))
      } catch (err) {
        console.warn('[DataContext] API fetch failed, using static data:', err.message)
        setData(prev => ({ ...prev, loaded: true, apiAvailable: false }))
      }
    }
    fetchAll()
  }, [])

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>
}

export function usePortfolioData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('usePortfolioData must be used within DataProvider')
  return ctx
}
