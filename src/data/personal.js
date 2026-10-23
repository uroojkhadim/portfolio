import { cvLinks } from './cv'

export const personalInfo = {
  name: 'Urooj Khadim',
  title: 'Software Engineering Student',
  role: 'Full Stack / Web & Mobile Developer',
  university: 'COMSATS University Islamabad, Vehari Campus',
  degree: 'Bachelor of Software Engineering (BS SE)',
  tagline: 'Building thoughtful digital experiences with clean code and modern design.',
  intro:
    'I am a passionate Software Engineering student at COMSATS University Islamabad (Vehari Campus) focused on crafting responsive web applications, cross-platform mobile solutions, and user-centered interfaces. I combine technical fundamentals with practical project experience to deliver reliable, scalable software.',
  email: 'uroojkhadim505@gmail.com',
  phone: '0313-6576128',
  github: 'https://github.com/uroojkhadim',
  linkedin: 'https://www.linkedin.com/in/urooj-khadim-26a334364',
  cv: cvLinks.path,
  cvDownload: cvLinks.download,
  cvFilename: cvLinks.filename,
  location: 'Vehari, Pakistan · Available for Remote & Internships',
  profileImage: '/profile.png',
}

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'resume', label: 'Documents' },
  { id: 'contact', label: 'Contact' },
]

export const aboutInterests = [
  {
    title: 'Web & Full-Stack Development',
    description: 'Building responsive, scalable web applications with React, Node.js, and modern backends.',
  },
  {
    title: 'Mobile App Development',
    description: 'Creating cross-platform mobile experiences with Flutter, Dart, and native Android concepts.',
  },
  {
    title: 'AI & Machine Learning',
    description: 'Applying Python, scikit-learn, and predictive analytics to solve domain-specific problems.',
  },
  {
    title: 'Software Quality & Architecture',
    description: 'Applying clean architecture, reliable testing, and scalable database schemas.',
  },
]
