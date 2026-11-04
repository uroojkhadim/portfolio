/**
 * Portfolio knowledge engine.
 *
 * Builds the chatbot's knowledge base directly from the CMS database on every
 * request, so any edit made in the admin panel is reflected immediately.
 */
import db from '../db.js'
function parseJson(value, fallback = []) {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}
function splitLines(value) {
  if (!value) return []
  return String(value)
    .split(/\r?\n|;/)
    .map(v => v.trim())
    .filter(Boolean)
}
function formatMonth(value) {
  if (!value) return ''
  const raw = String(value).trim()
  if (/^\d{4}$/.test(raw)) return raw
  const match = raw.match(/^(\d{4})-(\d{1,2})$/)
  if (match) {
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1))
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  }
  return raw
}
function periodLabel(item) {
  const start = formatMonth(item.start_date)
  const end = item.is_current ? 'Present' : formatMonth(item.end_date)
  if (start && (end || item.is_current)) return `${start} – ${item.is_current ? 'Present' : end}`
  return start || end || 'Dates not listed'
}
export function loadPortfolioKnowledge() {
  const chatRouteOverrides = db
    .prepare('SELECT route, answer, suggested_questions, greeting FROM chatbot_routes WHERE enabled = 1 ORDER BY id ASC')
    .all()
  const about = db.prepare('SELECT * FROM about_content LIMIT 1').get() || {}
  const contactRows = db.prepare(
    'SELECT key, label, value, href FROM contact_info WHERE visible = 1 ORDER BY display_order ASC'
  ).all()
  const contact = {}
  contactRows.forEach((row) => { contact[row.key] = row })
  const categories = db.prepare(
    'SELECT * FROM skill_categories WHERE published = 1 ORDER BY display_order ASC'
  ).all()
  const skillRows = db.prepare(
    'SELECT * FROM skills WHERE published = 1 ORDER BY display_order ASC'
  ).all()
  const skillGroups = categories.map((category) => ({
    title: category.title,
    description: category.description,
    skills: skillRows.filter((skill) => skill.category_id === category.id).map((skill) => skill.name),
  })).filter((group) => group.skills.length > 0)
  const projects = db.prepare(
    'SELECT * FROM projects WHERE published = 1 ORDER BY category ASC, display_order ASC'
  ).all().map((project) => ({
    ...project,
    technologies: parseJson(project.technologies),
  }))
  const experience = db.prepare(
    'SELECT * FROM experience WHERE published = 1 ORDER BY display_order ASC'
  ).all().map((item) => ({
    ...item,
    skills: parseJson(item.skills_list),
    responsibilities: splitLines(item.responsibilities),
    period: periodLabel(item),
  }))
  const education = db.prepare(
    'SELECT * FROM education WHERE published = 1 ORDER BY display_order ASC'
  ).all().map((item) => ({ ...item, period: periodLabel(item) }))
  const certificates = db.prepare(
    'SELECT * FROM certificates WHERE published = 1 ORDER BY display_order ASC'
  ).all()
  const services = db.prepare(
    'SELECT * FROM services WHERE published = 1 ORDER BY display_order ASC'
  ).all().map((service) => ({
    ...service,
    technologies: parseJson(service.technologies),
  }))
  const documents = db.prepare(
    'SELECT * FROM documents WHERE published = 1 ORDER BY display_order ASC'
  ).all()
  const settings = {}
  db.prepare('SELECT key, value FROM site_settings').all().forEach((row) => {
    settings[row.key] = row.value
  })
  const customKnowledge = db.prepare(
    'SELECT * FROM chatbot_knowledge WHERE published = 1 ORDER BY display_order ASC'
  ).all().map((entry) => ({
    ...entry,
    keywords: parseJson(entry.keywords),
  }))
  return {
    about,
    contact,
    contactRows,
    skillGroups,
    skills: skillRows,
    projects,
    experience,
    education,
    certificates,
    services,
    documents,
    settings,
    customKnowledge,
    chatRouteOverrides,
  }
}
function contactLine(kb, key) {
  const item = kb.contact[key]
  if (!item || !item.value) return null
  const label = item.label || key
  if (key === 'email') {
    const email = item.value.replace(/^mailto:/, '')
    return `${label}: [${email}](mailto:${email})`
  }
  if (item.href) return `${label}: [${item.value}](${item.href})`
  return `${label}: ${item.value}`
}
function contactBlock(kb) {
  const keys = kb.contact.whatsapp ? ['email', 'whatsapp', 'linkedin', 'github'] : ['email', 'phone', 'linkedin', 'github']
  const lines = keys.map((key) => contactLine(kb, key)).filter(Boolean)
  return lines.length ? lines.join('\n') : 'Contact details are not published yet.'
}
export function buildSystemInstruction(kb) {
  const name = kb.about.name || 'Urooj Khadim'
  const skillText = kb.skillGroups.map((group) => `- ${group.title}: ${group.skills.join(', ')}`).join('\n')
  const projectText = kb.projects.map((project) => {
    const links = [project.live_url && `live: ${project.live_url}`, project.github_url && `github: ${project.github_url}`]
      .filter(Boolean).join(', ')
    return `- ${project.title} (${project.category === 'mobile' ? 'mobile app' : 'web project'}): ${project.description || 'No description'}${project.technologies.length ? ` | Tech: ${project.technologies.join(', ')}` : ''}${links ? ` | ${links}` : ''}`
  }).join('\n')
  const experienceText = kb.experience.map((item) =>
    `- ${item.role} at ${item.company} (${item.type || 'Experience'}, ${item.period}, ${item.location || 'location not listed'}): ${item.description || ''}`
  ).join('\n')
  const educationText = kb.education.map((item) =>
    `- ${item.degree}, ${item.institution}${item.campus ? ` (${item.campus})` : ''} (${item.period})${item.cgpa ? `, CGPA ${item.cgpa}` : ''}. ${item.description || ''}`
  ).join('\n')
  const serviceText = kb.services.map((service) =>
    `- ${service.title} (${service.availability || 'Available'}): ${service.description || ''}${service.technologies.length ? ` Tools: ${service.technologies.join(', ')}` : ''}`
  ).join('\n')
  const certificateText = kb.certificates.length
    ? kb.certificates.map((cert) => `- ${cert.title}${cert.issuer ? ` — ${cert.issuer}` : ''}${cert.issue_date ? ` (${cert.issue_date})` : ''}`).join('\n')
    : '- No certifications are listed on the portfolio.'
  const documentText = kb.documents.map((doc) => `- ${doc.title}: ${doc.file_path || 'file not linked'}`).join('\n')
  const customText = kb.customKnowledge.map((entry) => `- Q: ${entry.question || entry.topic}\n  A: ${entry.answer}`).join('\n')
  return `You are the official AI assistant for ${name}'s developer portfolio. You answer recruiters, clients and visitors accurately, warmly, and in complete sentences.
VERIFIED PORTFOLIO DATA (this is the only source of truth):
Name: ${kb.about.name || name}
Professional title: ${kb.about.title || ''}
Role: ${kb.about.role || ''}
Location: ${kb.about.location || ''}
Availability: ${kb.about.availability_status || ''}
About: ${kb.about.bio || kb.about.about_description || ''}
Hero introduction: ${kb.about.hero_description || ''}
SKILLS:
${skillText || '- Not listed.'}
SERVICES OFFERED:
${serviceText || '- Not listed.'}
PROJECTS:
${projectText || '- Not listed.'}
EXPERIENCE:
${experienceText || '- Not listed.'}
EDUCATION:
${educationText || '- Not listed.'}
CERTIFICATIONS:
${certificateText}
DOCUMENTS:
${documentText || '- Not listed.'}
CONTACT:
${contactBlock(kb)}
ADMIN-PROVIDED CHATBOT NOTES:
${customText || '- None.'}
RULES:
1. Always answer the actual question directly and completely. Never reply with only "go to a section" or "check the portfolio".
2. Use only the verified data above. Never invent skills, employers, dates, qualifications, certificates, projects or contact details.
3. If the answer is genuinely not available, say so briefly and offer to connect the visitor with Urooj by email or WhatsApp.
4. When someone expresses hiring or collaboration interest, say yes where the data supports it and provide the contact details.
5. Use a friendly, professional tone. Keep answers focused (2-6 short paragraphs or a tidy list).
6. You may include clickable links for email, WhatsApp, LinkedIn, GitHub, CV/resume and live project demos.
7. Maintain context across follow-up questions.`
}
function includesAny(text, words) {
  return words.some((word) => text.includes(word))
}
function findProject(query, kb) {
  return kb.projects.find((project) => {
    const title = project.title.toLowerCase()
    if (query.includes(title)) return true
    const slugWords = project.slug.split('-').filter((w) => w.length > 3)
    return slugWords.length >= 2 && slugWords.every((word) => query.includes(word))
  })
}
function formatProjectDetails(project) {
  const lines = [`**${project.title}** is a ${project.category === 'mobile' ? 'mobile application' : 'web and full-stack project'} Urooj has built.`]
  if (project.description) lines.push(project.description)
  if (project.technologies.length) lines.push(`**Technologies:** ${project.technologies.join(', ')}`)
  const links = []
  if (project.live_url) links.push(`[Live demo](${project.live_url})`)
  if (project.github_url) links.push(`[GitHub repository](${project.github_url})`)
  if (links.length) lines.push(`**Links:** ${links.join(' · ')}`)
  return lines.join('\n\n')
}
function skillsAnswer(query, kb) {
  if (!kb.skillGroups.length) {
    return 'Urooj’s skills are not published on the portfolio yet. You can contact her directly for an up-to-date overview.'
  }
  const wantsProgramming = includesAny(query, ['programming language', 'languages does', 'languages do', 'which language'])
  const wantsFrameworks = includesAny(query, ['framework', 'libraries', 'react', 'laravel', 'flutter', 'technology', 'tech stack'])
  const wantsDatabases = query.includes('database') || query.includes('sql') || query.includes('mongo')
  const wantsTools = query.includes('tool') || query.includes('platform') || query.includes('software she uses')
  const wantsSoft = query.includes('soft skill')
  const groups = kb.skillGroups.filter((group) => {
    const title = group.title.toLowerCase()
    if (wantsProgramming && !wantsFrameworks) {
      return title.includes('programming') || title.includes('language') || title.includes('web') || title.includes('mobile') || title.includes('framework')
    }
    if (wantsDatabases) return title.includes('database')
    if (wantsTools) return title.includes('tool')
    if (wantsSoft) return title.includes('soft') || title.includes('interpersonal')
    if (wantsFrameworks) return title.includes('web') || title.includes('mobile') || title.includes('framework')
    return true
  })
  const chosen = groups.length ? groups : kb.skillGroups
  const intro = chosen.length === 1
    ? `Here is what Urooj works with in **${chosen[0].title.toLowerCase()}**:`
    : 'Here is a complete overview of Urooj’s technical skills:'
  return [
    intro,
    ...chosen.map((group) => `**${group.title}:**\n${group.skills.join(', ')}`),
  ].join('\n\n')
}
function servicesAnswer(kb) {
  if (!kb.services.length) {
    return 'Urooj’s service list is not published yet. She does take on software projects — contact her by email or WhatsApp to discuss your requirements.'
  }
  const lines = ['Urooj offers the following services:']
  kb.services.forEach((service) => {
    lines.push(`- **${service.title}** — ${service.description || 'Available on request'}${service.technologies.length ? ` _(${service.technologies.join(', ')})_` : ''}`)
  })
  lines.push(`If you would like to discuss a project, reach her at ${contactLine(kb, 'email') || 'her email'}${kb.contact.whatsapp ? ` or ${contactLine(kb, 'whatsapp')}` : ''}.`)
  return lines.join('\n')
}
function projectsAnswer(query, kb) {
  const isFreelance = typeof kb.routeFilter === 'string' && kb.routeFilter.toLowerCase() === 'freelance'
  if (isFreelance) {
    const services = kb.services || []
    if (services.length) {
      return [
        'Here are the services Urooj offers:',
        ...services.map((service) => `- **${service.title}** — ${service.description || 'Available on request'}${service.technologies.length ? ` _(${service.technologies.join(', ')})_` : ''}`),
        'If you need a specific deliverable, ask me about it and I will map it to the service that fits best.',
      ].join('\n')
    }
    if (kb.projects?.length) {
      return [
        'Urooj has built the following projects:',
        ...kb.projects.map((p) => `- **${p.title}** — ${p.description || 'Project description not published yet'}`),
      ].join('\n')
    }
    return 'Urooj works across web, mobile and branding. Ask me about her services, process or deliverables and I will point you to the right service.'
  }
  const web = kb.projects.filter((p) => p.category === 'web')
  const mobile = kb.projects.filter((p) => p.category === 'mobile')
  if (includesAny(query, ['website', 'web project', 'web application', 'web development', 'full stack', 'full-stack']) && web.length) {
    return [
      `Yes — Urooj has built several websites and web applications:`,
      ...web.map((project) => `- **${project.title}**${project.live_url ? ` — [live demo](${project.live_url})` : ''}`),
      mobile.length ? `She has also developed ${mobile.length} mobile applications. Ask me about any project for its technologies and functionality.` : '',
    ].filter(Boolean).join('\n')
  }
  if (includesAny(query, ['mobile', 'flutter', 'android', 'app']) && mobile.length) {
    return [
      'Urooj has built the following mobile applications:',
      ...mobile.map((project) => `- **${project.title}** — ${project.description || 'Mobile application'}`),
    ].join('\n')
  }
  if (!kb.projects?.length) {
    return 'Urooj’s project portfolio is not published yet. Contact her directly for examples of her work.'
  }
  return [
    `Urooj has worked on **${kb.projects.length} published projects** across web and mobile development:`,
    web.length ? `**Web:** ${web.map((p) => p.title).join(', ')}` : '',
    mobile.length ? `**Mobile:** ${mobile.map((p) => p.title).join(', ')}` : '',
    'Ask me about any specific project and I can share its description, technologies, and links.',
  ].filter(Boolean).join('\n\n')
}
function experienceAnswer(kb) {
  if (!kb.experience.length) {
    return 'No work experience is listed on the portfolio yet. You can contact Urooj directly for her latest experience.'
  }
  const lines = ['Yes — Urooj has hands-on professional and internship experience:']
  kb.experience.forEach((item) => {
    lines.push(`- **${item.role}** at **${item.company}** — ${item.type || 'Experience'}, ${item.period}${item.location ? `, ${item.location}` : ''}. ${item.description || ''}`)
  })
  if (kb.experience.some((item) => item.certificate_url)) {
    lines.push('Internship certificates are available to view in the Experience section of the portfolio.')
  }
  return lines.join('\n')
}
function educationAnswer(kb) {
  if (!kb.education.length) {
    return 'Education details are not published on the portfolio yet.'
  }
  if (typeof kb.routeFilter === 'string' && kb.routeFilter.toLowerCase() === 'freelance') {
    return 'Urooj is not hiring or recruiting right now. Ask me about her services, projects, deliverables, process or how to hire her.'
  }
  return kb.education.map((item) => [
    `**${item.degree}**`,
    `${item.institution}${item.campus ? ` — ${item.campus}` : ''}`,
    `**Duration:** ${item.period}${item.cgpa ? ` · **CGPA:** ${item.cgpa}` : ''}`,
    item.status_label ? `**Status:** ${item.status_label}` : '',
    item.description || '',
  ].filter(Boolean).join('\n')).join('\n\n')
}
function certificatesAnswer(kb) {
  if (!kb.certificates.length) {
    return 'No certifications are currently listed on Urooj’s portfolio. Her internship experience and projects are documented, and she can share any additional credentials on request.'
  }
  if (typeof kb.routeFilter === 'string' && kb.routeFilter.toLowerCase() === 'freelance') {
    return 'Ask me about her services, projects, deliverables, process or how to hire her.'
  }
  return [
    'Here are Urooj’s published certifications:',
    ...kb.certificates.map((cert) => {
      const parts = [`**${cert.title}**`]
      if (cert.issuer) parts.push(`issued by ${cert.issuer}`)
      if (cert.issue_date) parts.push(`(${cert.issue_date})`)
      if (cert.credential_url) parts.push(`— [verify credential](${cert.credential_url})`)
      return `- ${parts.join(' ')}${cert.description ? `: ${cert.description}` : ''}`
    }),
  ].join('\n')
}
function contactAnswer(kb) {
  return [
    'You can reach Urooj directly through any of these channels:',
    contactBlock(kb),
    'You can also send a message through the contact form on this page, and it will appear in her admin inbox immediately.',
  ].join('\n\n')
}
function documentsAnswer(kb) {
  if (!kb.documents.length) {
    return 'No CV or resume files are linked on the portfolio yet. Contact Urooj directly and she can share them.'
  }
  return [
    'Urooj’s documents are available here:',
    ...kb.documents.map((doc) => `- **[${doc.title}](${doc.file_path})**${doc.description ? ` — ${doc.description}` : ''}`),
  ].join('\n')
}
function hiringAnswer(kb) {
  const isFreelance = typeof kb.routeFilter === 'string' && kb.routeFilter.toLowerCase() === 'freelance'
  const relevantServices = kb.services
    .filter((service) => /website|web|mobile|app|frontend|software|qa|quality/i.test(service.title))
    .map((service) => service.title)
  const offer = relevantServices.length ? ` She provides ${relevantServices.join(', ')}.` : ''
  const reply = [
    `Absolutely — Urooj is available for projects, internships and remote roles.${offer}`,
    `The best way to start is to share your requirements with her directly:\n\n${contactBlock(kb)}`,
    'She usually replies with a clear scope, timeline and next steps.',
  ].join('\n\n')
  if (isFreelance) return reply
  if (typeof kb.routeFilter !== 'string' || kb.routeFilter.toLowerCase() !== 'freelance') {
    return reply
  }
  return reply.replace(/\*\*Contacts\*\*\n\n\*\*Email.*?(?=\n)/s, '')
}
function aboutAnswer(kb) {
  const name = kb.about.name || 'Urooj Khadim'
  const parts = [
    `**${name}** is a ${kb.about.role || kb.about.title || 'software developer'}${kb.about.university ? ` and a Software Engineering student at ${kb.about.university}` : ''}.`,
  ]
  if (kb.about.bio) parts.push(kb.about.bio)
  else if (kb.about.about_description) parts.push(kb.about.about_description)
  if (kb.about.location) parts.push(`**Location:** ${kb.about.location}`)
  if (kb.about.availability_status) parts.push(`**Availability:** ${kb.about.availability_status}`)
  parts.push('Ask me about her skills, services, projects, experience or education — or how to get in touch.')
  return parts.join('\n\n')
}
function customKnowledgeAnswer(query, kb) {
  for (const entry of kb.customKnowledge) {
    const haystack = [entry.topic, entry.question, ...(entry.keywords || [])].join(' ').toLowerCase()
    const words = haystack.split(/[^a-z0-9+#.]+/).filter((word) => word.length > 3)
    const score = words.reduce((total, word) => total + (query.includes(word) ? 1 : 0), 0)
    if (score >= 2) {
      return entry.answer
    }
  }
  return null
}
function detectIntent(rawQuery) {
  const q = rawQuery.toLowerCase().trim()
  if (!q) return 'empty'
  if (/^(hi|hello|hey|good (morning|afternoon|evening)|salam|assalam)/.test(q)) return 'greeting'
  if (includesAny(q, ['thank', 'thanks', 'shukriya'])) return 'thanks'
  if (includesAny(q, ['hire', 'hiring', 'freelance', 'collaborat', 'work with her', 'work with urooj', 'available for a project', 'can i hire'])) return 'hiring'
  if (includesAny(q, ['service', 'what can she offer', 'what do you offer', 'what can she provide', 'what can urooj provide', 'offer'])) return 'services'
  if (includesAny(q, ['contact', 'email', 'phone', 'whatsapp', 'linkedin', 'github', 'reach her', 'get in touch', 'message her'])) return 'contact'
  if (includesAny(q, ['cv', 'resume', 'curriculum vitae'])) return 'documents'
  if (includesAny(q, ['certificat', 'credential', 'course'])) return 'certificates'
  if (includesAny(q, ['internship', 'experience', 'worked', 'work history', 'employer', 'job', 'company', 'gamitron', 'rhombix', 'developershub'])) return 'experience'
  if (includesAny(q, ['education', 'university', 'degree', 'comsats', 'college', 'academic', 'study', 'student', 'cgpa'])) return 'education'
  if (includesAny(q, ['project', 'portfolio', 'built', 'developed', 'website', 'web app', 'mobile app', 'flutter', 'android'])) return 'projects'
  if (includesAny(q, ['skill', 'language', 'framework', 'tech stack', 'technolog', 'database', 'tools', 'python', 'react', 'laravel', 'kotlin', 'dart', 'java'])) return 'skills'
  if (includesAny(q, ['who is', 'about urooj', 'about her', 'introduce', 'background', 'tell me about', 'who are you'])) return 'about'
  return 'unknown'
}
export function answerPortfolioQuestion(rawQuery, history = [], kb) {
  const knowledge = kb || loadPortfolioKnowledge()
  const query = String(rawQuery || '').toLowerCase().trim()
  if (!query) {
    return 'Ask me anything about Urooj’s skills, services, projects, experience, education, or how to contact her.'
  const project = findProject(query, knowledge)
  if (project && !includesAny(query, ['skill', 'service', 'experience', 'education', 'contact'])) {
    return formatProjectDetails(project)
  }
  let intent = detectIntent(query)
  if (intent === 'unknown') {
    const previousUserMessage = [...history]
      .reverse()
      .find((item) => (item.role === 'user' || item.sender === 'user') && (item.content || item.text))
    if (previousUserMessage && includesAny(query, ['more', 'that', 'this', 'it', 'details', 'explain', 'why', 'and'])) {
      const previousIntent = detectIntent(previousUserMessage.content || previousUserMessage.text)
      if (previousIntent !== 'unknown') intent = previousIntent
    }
  }
  if (intent === 'greeting') {
    const name = knowledge.about.name || 'Urooj Khadim'
    return `Hello! I’m ${name}’s portfolio assistant. I can tell you about her skills, services, projects, experience, education, certifications, and how to contact her. What would you like to know?`
  }
  if (intent === 'thanks') {
    return 'You’re welcome! If you’d like to discuss a project or opportunity, you can reach Urooj by email or WhatsApp — I’ve included the contact details above. Is there anything else you’d like to know?'
  }
  if (intent === 'hiring') return hiringAnswer(knowledge)
  if (intent === 'services') return servicesAnswer(knowledge)
  if (intent === 'contact') return contactAnswer(knowledge)
  if (intent === 'documents') return documentsAnswer(knowledge)
  if (intent === 'certificates') return certificatesAnswer(knowledge)
  if (intent === 'experience') return experienceAnswer(knowledge)
  if (intent === 'education') return educationAnswer(knowledge)
  if (intent === 'projects') return projectsAnswer(query, knowledge)
  if (intent === 'skills') return skillsAnswer(query, knowledge)
  if (intent === 'about') return aboutAnswer(knowledge)
  const custom = customKnowledgeAnswer(query, knowledge)
  if (custom) return custom
  const route = typeof kb.routeFilter === 'string' ? kb.routeFilter.toLowerCase() : 'career'
  const isFreelance = route === 'freelance'
  const summary = [
    `I don't have that specific detail in Urooj's published portfolio, but here is a quick summary of what I do know:`,
    `- **Role:** ${knowledge.about.role || knowledge.about.title || 'Software developer'}`
      + (knowledge.about.university ? `, ${knowledge.about.university}` : ''),
    knowledge.skillGroups.length ? `- **Core skills:** ${knowledge.skillGroups.flatMap((g) => g.skills).slice(0, 12).join(', ')}` : '',
  ]
  if (isFreelance) {
    knowledge.services.length
      ? `- **Services:** ${knowledge.services.map((s) => s.title).join(', ')}` : '',
    knowledge.projects?.length
      ? `- **Projects:** ${knowledge.projects.length} portfolio projects` : '',
    'For deliverables, dates and to discuss an engagement, ask about her services or contact her directly.'
  } else {
    knowledge.projects.length
      ? `- **Projects:** ${knowledge.projects.length} published web and mobile projects` : '',
    knowledge.services.length
      ? `- **Services:** ${knowledge.services.map((s) => s.title).join(', ')}` : '',
    `- **Contact:** ${knowledge.contact.email ? knowledge.contact.email.value : 'available on request'}`,
    'If you need something more specific, Urooj can answer directly by email or WhatsApp.',
}



}
}
