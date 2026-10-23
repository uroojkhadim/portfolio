/**
 * Experience & Professional Roles Configuration
 * 
 * Contains verified professional experiences ordered most recent first.
 */

export const professionalExperiences = [
  {
    id: 'gamitron',
    company: 'The GamiTron (PVT) Ltd',
    role: 'Android Developer',
    duration: 'July 2026 – August 2026',
    location: 'Lahore Division, Punjab, Pakistan',
    type: 'Professional Experience',
    description:
      'Learned Android development fundamentals, including Kotlin, Jetpack Compose, and XML-based UI layouts.',
    skills: ['Android Development', 'Kotlin', 'Jetpack Compose', 'XML Layouts'],
    certificateUrl: null, // No fabricated certificate
  },
  {
    id: 'rhombix',
    company: 'Rhombix Technologies',
    role: 'Frontend Developer',
    duration: 'March 2026 – July 2026',
    location: 'Remote',
    type: 'Professional Experience',
    description:
      'Worked in a frontend development role, building and refining user-facing web interfaces.',
    skills: ['Frontend Development', 'Web Interfaces', 'HTML/CSS', 'JavaScript'],
    certificateUrl: null, // No fabricated certificate
  },
  {
    id: 'developershub',
    company: 'DevelopersHub Corporation©',
    role: 'Intern — Android App Developer',
    duration: 'December 2025 – April 2026',
    location: 'Remote',
    type: 'Internship',
    description:
      'Gained internship experience in Android application development and mobile app workflows.',
    skills: ['Android Development', 'Mobile App Workflows', 'Kotlin', 'UI Design'],
    certificateUrl: null, // No fabricated certificate
  },
]

export const experienceOverview = {
  headline: 'Software Developer | Flutter, Web & AI/ML',
  tagline: 'Building practical digital solutions across mobile applications, web development, and intelligent systems.',
  specialties: ['Android & Flutter', 'Frontend & Full-Stack', 'AI / ML Integration'],
}

// Backward compatibility alias
export const internships = professionalExperiences
