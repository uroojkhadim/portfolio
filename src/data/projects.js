export const projects = [
  {
    id: 'cafeteria-management',
    title: 'Cafeteria Management System',
    description:
      'A web-based cafeteria management system designed to manage food ordering and cafeteria operations through an interactive interface.',
    liveUrl: 'https://cafeteria-management-main.firebaseapp.com',
    githubUrl: null,
    tech: ['HTML', 'CSS', 'JavaScript', 'Firebase'],
    deployment: 'Firebase',
    status: 'Live',
    features: [
      'Food ordering system',
      'Cafeteria operations management',
      'Interactive interface',
      'Firebase integration',
    ],
    gradient: 'from-orange-500/20 via-amber-500/10 to-red-500/20',
    accent: '#f97316',
  },
  {
    id: 'flickcom-isp',
    title: 'FlickCom ISP Website',
    description:
      'A responsive ISP business website with modern UI, service pages, and business-oriented layout.',
    liveUrl: 'https://flickcom-isp.vercel.app/',
    githubUrl: null,
    tech: ['React', 'CSS', 'Responsive Design', 'Vercel'],
    deployment: 'Vercel',
    status: 'Live',
    features: [
      'Modern responsive UI',
      'Service pages',
      'Business-oriented layout',
      'ISP-focused design',
    ],
    gradient: 'from-blue-500/20 via-cyan-500/10 to-indigo-500/20',
    accent: '#3b82f6',
  },
  {
    id: 'cui-plagiarism',
    title: 'CUI Plagiarism Portal',
    description:
      'A plagiarism portal system for managing academic checking workflows with secure file handling and cloud-based integrations.',
    liveUrl: 'https://cui-plagiarism-portal-frontend.vercel.app/',
    githubUrl: null,
    tech: ['React', 'Node.js', 'Express.js', 'Supabase', 'Backblaze B2', 'Netlify', 'Vercel'],
    deployment: 'Vercel',
    status: 'Live',
    features: [
      'File upload & storage management',
      'Secure cloud storage integration',
      'Academic plagiarism workflow',
      'Backend integration',
    ],
    gradient: 'from-violet-500/20 via-purple-500/10 to-fuchsia-500/20',
    accent: '#8b5cf6',
    featured: true,
  },
  {
    id: 'quiz-website',
    title: 'Quiz Website',
    description:
      'An interactive quiz platform with engaging UI and dynamic quiz functionality.',
    liveUrl: 'https://quiz-website-blush-xi.vercel.app/',
    githubUrl: null,
    tech: ['HTML', 'CSS', 'JavaScript'],
    deployment: 'Vercel',
    status: 'Live',
    features: [
      'Interactive quiz platform',
      'Dynamic quiz functionality',
      'Engaging UI',
      'Responsive design',
    ],
    gradient: 'from-emerald-500/20 via-teal-500/10 to-green-500/20',
    accent: '#10b981',
  },
  {
    id: 'healthcare-website',
    title: 'Healthcare Website',
    description:
      'A responsive healthcare-related website with a clean modern interface and user-friendly experience.',
    liveUrl: 'https://healthcare-website-gold.vercel.app/',
    githubUrl: null,
    tech: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    deployment: 'Vercel',
    status: 'Live',
    features: [
      'Clean modern interface',
      'User-friendly experience',
      'Healthcare-focused layout',
      'Fully responsive design',
    ],
    gradient: 'from-sky-500/20 via-blue-500/10 to-indigo-500/20',
    accent: '#0ea5e9',
  },
]

export function getProjectThumbnail(url) {
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=800`
}
