/**
 * Client-side portfolio answer engine.
 *
 * This is the last-resort fallback used only when the /api/chat endpoint is
 * unreachable. It reads the same CMS data already loaded by DataContext, so it
 * still answers from the real portfolio instead of a hard-coded section list.
 */
import { fallbackServices } from './services'
import { skillCategories as fallbackSkillCategories } from './skills'
import { personalInfo } from './personal'

export const SUGGESTED_QUESTIONS = [
  'What programming languages does Urooj know?',
  'What services can Urooj provide?',
  'Has Urooj developed any websites?',
  'Does Urooj have internship experience?',
  'Can I hire Urooj?',
]

function normalizeText(value) {
  return String(value || '').toLowerCase().trim()
}

function ensureProtocol(value, prefix = 'https://') {
  if (!value) return ''
  const trimmed = String(value).trim()
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed
  return `${prefix}${trimmed.replace(/^\/+/, '')}`
}

function getContact(portfolio) {
  const contact = portfolio?.contact || {}
  const email = (contact.email?.value || personalInfo.email).replace(/^mailto:/, '')
  return {
    email,
    emailHref: contact.email?.href || `mailto:${email}`,
    phone: contact.phone?.value || personalInfo.phone,
    phoneHref: contact.phone?.href || personalInfo.phoneHref,
    whatsapp: contact.whatsapp?.href || personalInfo.whatsapp,
    whatsappValue: contact.whatsapp?.value || personalInfo.phone,
    github: ensureProtocol(contact.github?.href || contact.github?.value || personalInfo.github, 'https://github.com/'),
    linkedin: ensureProtocol(contact.linkedin?.href || contact.linkedin?.value || personalInfo.linkedin, 'https://www.linkedin.com/in/'),
    location: contact.location?.value || personalInfo.location,
  }
}

function getSkills(portfolio) {
  const apiCategories = portfolio?.apiSkillCategories
  if (Array.isArray(apiCategories) && apiCategories.length > 0) {
    return apiCategories.map(category => ({
      title: category.title,
      skills: (category.skills || []).map(skill => skill.name),
    })).filter(category => category.skills.length > 0)
  }
  return fallbackSkillCategories.map(category => ({
    title: category.title,
    skills: category.skills.map(skill => skill.name),
  }))
}

function getProjects(portfolio) {
  const web = (portfolio?.webProjects || []).map(project => ({
    title: project.title,
    description: project.description,
    technologies: project.technologies || [],
    liveUrl: project.liveUrl || project.live_url,
    githubUrl: project.githubUrl || project.github_url,
    category: 'web',
  }))
  const mobile = (portfolio?.mobileProjects || []).map(project => ({
    title: project.title,
    description: project.description,
    technologies: project.technologies || [],
    liveUrl: project.liveUrl || project.live_url,
    githubUrl: project.githubUrl || project.github_url,
    category: 'mobile',
  }))
  return { web, mobile, all: [...web, ...mobile] }
}

function getExperience(portfolio) {
  return (portfolio?.experience || []).map(item => ({
    company: item.company,
    role: item.role,
    type: item.type,
    period: item.duration || `${item.start_date || ''} – ${item.is_current ? 'Present' : (item.end_date || '')}`,
    location: item.location,
    description: item.description,
    responsibilities: item.responsibilities || [],
  }))
}

function getServices(portfolio) {
  const services = portfolio?.services
  return Array.isArray(services) && services.length > 0 ? services : fallbackServices
}

function getEducation(portfolio) {
  const education = portfolio?.education
  if (Array.isArray(education) && education.length > 0) {
    return education.map(item => ({
      degree: item.degree,
      institution: item.institution,
      campus: item.campus,
      start: item.start_date,
      end: item.is_current ? 'Present' : item.end_date,
      cgpa: item.cgpa,
      status: item.status_label,
      description: item.description,
    }))
  }
  return []
}

function includesAny(text, words) {
  return words.some(word => text.includes(word))
}

function contactBlock(contact) {
  return [
    `**Email:** [${contact.email}](${contact.emailHref})`,
    `**WhatsApp:** [${contact.whatsappValue}](${contact.whatsapp})`,
    `**LinkedIn:** [${contact.linkedin.replace(/^https?:\/\//, '')}](${contact.linkedin})`,
    `**GitHub:** [${contact.github.replace(/^https?:\/\//, '')}](${contact.github})`,
  ].join('\n')
}

function skillsAnswer(query, categories) {
  const wantsLanguages = includesAny(query, ['programming language', 'languages', 'which language'])
  const wantsDatabases = includesAny(query, ['database', 'sql', 'mongo'])
  const wantsTools = includesAny(query, ['tool', 'platform', 'ide'])
  const wantsFrameworks = includesAny(query, ['framework', 'web', 'mobile', 'library', 'react', 'flutter', 'laravel'])

  let chosen = categories
  if (wantsDatabases) chosen = categories.filter(c => c.title.toLowerCase().includes('database'))
  else if (wantsTools) chosen = categories.filter(c => c.title.toLowerCase().includes('tool'))
  else if (wantsLanguages && !wantsFrameworks) chosen = categories.filter(c => /programming|language|web|mobile|framework/i.test(c.title))
  else if (wantsFrameworks) chosen = categories.filter(c => /web|mobile|framework/i.test(c.title))
  if (!chosen.length) chosen = categories

  return [
    chosen.length === 1
      ? `Here is what Urooj works with in **${chosen[0].title.toLowerCase()}**:`
      : 'Here is a complete overview of Urooj’s technical skills:',
    ...chosen.map(category => `**${category.title}:**\n${category.skills.join(', ')}`),
  ].join('\n\n')
}

function servicesAnswer(services, contact) {
  return [
    'Urooj offers the following services:',
    ...services.map(service => `- **${service.title}** — ${service.description}`),
    `To discuss a project, contact her at [${contact.email}](${contact.emailHref}) or on [WhatsApp](${contact.whatsapp}).`,
  ].join('\n')
}

function projectsAnswer(query, projects) {
  if (includesAny(query, ['website', 'web project', 'web app', 'full stack', 'full-stack']) && projects.web.length) {
    return [
      'Yes — Urooj has built several websites and web applications:',
      ...projects.web.map(project => `- **${project.title}**${project.liveUrl ? ` — [live demo](${project.liveUrl})` : ''}`),
      projects.mobile.length ? `She has also developed ${projects.mobile.length} mobile applications.` : '',
    ].filter(Boolean).join('\n')
  }

  if (includesAny(query, ['mobile', 'flutter', 'android', 'app']) && projects.mobile.length) {
    return [
      'Urooj has built the following mobile applications:',
      ...projects.mobile.map(project => `- **${project.title}** — ${project.description || 'Mobile application'}`),
    ].join('\n')
  }

  return [
    `Urooj has worked on **${projects.all.length} published projects** across web and mobile development:`,
    projects.web.length ? `**Web:** ${projects.web.map(project => project.title).join(', ')}` : '',
    projects.mobile.length ? `**Mobile:** ${projects.mobile.map(project => project.title).join(', ')}` : '',
    'Ask me about any specific project for its description, technologies and links.',
  ].filter(Boolean).join('\n\n')
}

function experienceAnswer(experience) {
  if (!experience.length) return 'No work experience is published yet. Contact Urooj directly for the latest details.'
  return [
    'Yes — Urooj has professional and internship experience:',
    ...experience.map(item => `- **${item.role}** at **${item.company}** — ${item.type || 'Experience'}, ${item.period}${item.location ? `, ${item.location}` : ''}. ${item.description || ''}`),
  ].join('\n')
}

function educationAnswer(education) {
  if (!education.length) return 'Education details are not published yet.'
  return education.map(item => [
    `**${item.degree}**`,
    `${item.institution}${item.campus ? ` — ${item.campus}` : ''}`,
    `**Duration:** ${item.start} – ${item.end}${item.cgpa ? ` · **CGPA:** ${item.cgpa}` : ''}`,
    item.description || '',
  ].filter(Boolean).join('\n')).join('\n\n')
}

function contactAnswer(contact) {
  return [
    'You can reach Urooj directly through any of these channels:',
    contactBlock(contact),
    'You can also send a message through the contact form on this page — it lands directly in her inbox.',
  ].join('\n\n')
}

function hiringAnswer(services, contact) {
  const relevant = services
    .filter(service => /website|web|mobile|app|frontend|software|quality/i.test(service.title))
    .map(service => service.title)
  return [
    `Absolutely — Urooj is available for projects, internships and remote roles.${relevant.length ? ` She provides ${relevant.join(', ')}.` : ''}`,
    `Share your requirements directly:\n\n${contactBlock(contact)}`,
  ].join('\n\n')
}

function aboutAnswer(about, contact) {
  const name = about?.name || 'Urooj Khadim'
  return [
    `**${name}** is a ${about?.role || about?.title || 'software developer'}${about?.university ? ` and a Software Engineering student at ${about.university}` : ''}.`,
    about?.bio || about?.about_description || '',
    about?.location ? `**Location:** ${about.location}` : `**Location:** ${contact.location}`,
    about?.availability_status ? `**Availability:** ${about.availability_status}` : '',
    'Ask me about her skills, services, projects, experience or how to get in touch.',
  ].filter(Boolean).join('\n\n')
}

function documentsAnswer(portfolio, contact) {
  const documents = portfolio?.documents || []
  if (!documents.length) {
    return `No CV or resume PDFs are linked yet. Contact Urooj at [${contact.email}](${contact.emailHref}) and she can share them directly.`
  }
  return [
    'Urooj’s documents are available here:',
    ...documents.map(doc => `- **[${doc.title}](${doc.file_path || doc.path})**${doc.description ? ` — ${doc.description}` : ''}`),
  ].join('\n')
}

function certificatesAnswer(portfolio) {
  const certificates = portfolio?.certificates || []
  if (!certificates.length) {
    return 'No certifications are listed on the portfolio right now. Her internship experience and projects are documented, and she can share additional credentials on request.'
  }
  return [
    'Here are Urooj’s published certifications:',
    ...certificates.map(cert => `- **${cert.title}**${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.issue_date ? ` (${cert.issue_date})` : ''}`),
  ].join('\n')
}

export function getKnowledgeBaseAnswer(rawQuery, history = [], portfolio = {}) {
  const query = normalizeText(rawQuery)
  if (!query) return 'Ask me anything about Urooj’s skills, services, projects, experience, education, or how to contact her.'

  const contact = getContact(portfolio)
  const skills = getSkills(portfolio)
  const projects = getProjects(portfolio)
  const experience = getExperience(portfolio)
  const services = getServices(portfolio)
  const education = getEducation(portfolio)
  const about = portfolio?.about

  // Specific project question
  const specificProject = projects.all.find(project => query.includes(normalizeText(project.title)))
  if (specificProject && !includesAny(query, ['skill', 'service', 'experience', 'education', 'contact'])) {
    return [
      `**${specificProject.title}** is a ${specificProject.category === 'mobile' ? 'mobile application' : 'web project'} Urooj has built.`,
      specificProject.description || '',
      specificProject.technologies.length ? `**Technologies:** ${specificProject.technologies.join(', ')}` : '',
      specificProject.liveUrl ? `[Live demo](${specificProject.liveUrl})` : '',
      specificProject.githubUrl ? `[GitHub repository](${specificProject.githubUrl})` : '',
    ].filter(Boolean).join('\n\n')
  }

  if (/^(hi|hello|hey|salam|assalam)/.test(query)) {
    return `Hello! I’m ${about?.name || 'Urooj Khadim'}’s portfolio assistant. I can tell you about her skills, services, projects, experience, education, certifications, and how to contact her. What would you like to know?`
  }
  if (includesAny(query, ['hire', 'hiring', 'freelance', 'collaborat', 'work with'])) return hiringAnswer(services, contact)
  if (includesAny(query, ['service', 'offer', 'provide'])) return servicesAnswer(services, contact)
  if (includesAny(query, ['contact', 'email', 'phone', 'whatsapp', 'linkedin', 'github', 'reach'])) return contactAnswer(contact)
  if (includesAny(query, ['cv', 'resume', 'curriculum vitae'])) return documentsAnswer(portfolio, contact)
  if (includesAny(query, ['certificat', 'credential'])) return certificatesAnswer(portfolio)
  if (includesAny(query, ['internship', 'experience', 'worked', 'work history', 'job', 'company'])) return experienceAnswer(experience)
  if (includesAny(query, ['education', 'university', 'degree', 'comsats', 'academic', 'cgpa'])) return educationAnswer(education)
  if (includesAny(query, ['project', 'portfolio', 'built', 'developed', 'website', 'mobile app', 'flutter', 'android'])) return projectsAnswer(query, projects)
  if (includesAny(query, ['skill', 'language', 'framework', 'tech stack', 'technolog', 'database', 'tools', 'python', 'react', 'laravel', 'kotlin', 'dart'])) return skillsAnswer(query, skills)
  if (includesAny(query, ['who is', 'about', 'introduce', 'background', 'tell me'])) return aboutAnswer(about, contact)

  const previous = [...history].reverse().find(item => item.sender === 'user' && item.text)
  if (previous && includesAny(query, ['more', 'that', 'details', 'explain'])) {
    return getKnowledgeBaseAnswer(previous.text, [], portfolio)
  }

  return [
    'I don’t have that specific detail in Urooj’s published portfolio, but here is a quick summary:',
    `- **Role:** ${about?.role || about?.title || 'Software developer'}`,
    `- **Core skills:** ${skills.flatMap(category => category.skills).slice(0, 12).join(', ')}`,
    `- **Projects:** ${projects.all.length} published web and mobile projects`,
    `- **Services:** ${services.map(service => service.title).join(', ')}`,
    `- **Contact:** ${contact.email}`,
    'For anything more specific, contact Urooj directly by email or WhatsApp.',
  ].join('\n')
}
