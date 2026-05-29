export const MOBILE_REPO_URL =
  'https://github.com/uroojkhadim/FA23-BSE-019-5A-UroojKhadim'

const repoLinks = {
  status: 'Completed',
  liveUrl: MOBILE_REPO_URL,
  githubUrl: MOBILE_REPO_URL,
}

export const mobileProjects = [
  {
    id: 'predictive-healthcare',
    title: 'Predictive Healthcare & Recommendation System',
    description:
      'A healthcare-focused mobile application developed using Flutter for health prediction, recommendations, and an interactive modern user experience.',
    tech: ['Flutter', 'Dart', 'Firebase'],
    features: [
      'Prediction system',
      'Recommendation system',
      'Modern UI',
      'Responsive mobile experience',
    ],
    gradient: 'from-rose-500/40 via-pink-500/25 to-red-500/30',
    screenGradient: 'from-rose-600 to-pink-700',
    accent: '#f43f5e',
    type: 'mobile',
    ...repoLinks,
  },
  {
    id: 'todo-list-mobile',
    title: 'To-Do List Mobile App',
    description:
      'A full-stack productivity mobile application for task management with authentication and backend integration.',
    tech: ['React Native', 'Node.js', 'Express.js', 'MongoDB'],
    features: [
      'Task management',
      'Authentication',
      'Backend integration',
      'Responsive mobile UI',
    ],
    gradient: 'from-indigo-500/40 via-blue-500/25 to-violet-500/30',
    screenGradient: 'from-indigo-600 to-violet-700',
    accent: '#6366f1',
    type: 'mobile',
    ...repoLinks,
  },
  {
    id: 'musify',
    title: 'Musify App',
    description:
      'A modern music streaming and listening mobile application with a clean user interface and engaging experience.',
    tech: ['Flutter', 'Dart', 'Firebase'],
    features: [
      'Music UI',
      'Playlist interaction',
      'Modern mobile design',
      'Responsive experience',
    ],
    gradient: 'from-purple-500/40 via-fuchsia-500/25 to-violet-500/30',
    screenGradient: 'from-purple-600 to-fuchsia-700',
    accent: '#a855f7',
    type: 'mobile',
    ...repoLinks,
  },
  {
    id: 'wemuslim',
    title: 'WeMuslim App',
    description:
      'A modern Islamic mobile application designed with useful features and a clean user-friendly experience.',
    tech: ['Flutter', 'Dart', 'Firebase'],
    features: [
      'Islamic utility features',
      'Modern interface',
      'Smooth user experience',
      'Responsive mobile design',
    ],
    gradient: 'from-emerald-500/40 via-teal-500/25 to-green-500/30',
    screenGradient: 'from-emerald-600 to-teal-700',
    accent: '#10b981',
    type: 'mobile',
    ...repoLinks,
  },
  {
    id: 'pos-coffee-shop',
    title: 'POS Coffee Shop Inventory Management System',
    description:
      'A mobile inventory and point-of-sale management system for coffee shop operations with product and inventory handling.',
    tech: ['Flutter', 'Dart', 'Firebase'],
    features: [
      'Inventory management',
      'POS functionality',
      'Product handling',
      'Modern responsive interface',
    ],
    gradient: 'from-amber-500/40 via-orange-500/25 to-yellow-500/30',
    screenGradient: 'from-amber-600 to-orange-700',
    accent: '#f59e0b',
    type: 'mobile',
    ...repoLinks,
  },
]
