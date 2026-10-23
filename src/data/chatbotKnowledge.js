/**
 * Verified Knowledge Base for Urooj Khadim's Personal Portfolio Assistant
 * 
 * All responses MUST be grounded in these verified facts.
 * Never invent qualifications, companies, certificates, or achievements.
 */

export const VERIFIED_PORTFOLIO_FACTS = {
  name: 'Urooj Khadim',
  title: 'Software Developer | Flutter, Web & AI/ML',
  tagline: 'Building practical digital solutions across mobile applications, web development, and intelligent systems.',
  location: 'Vehari, Pakistan (Available for Remote work & Internships)',
  education: {
    degree: 'Bachelor of Software Engineering (BS SE)',
    institution: 'COMSATS University Islamabad, Vehari Campus',
    status: 'Currently Enrolled (Senior Student)',
    coursework: [
      'Object-Oriented Programming (OOP)',
      'Data Structures & Algorithms',
      'Mobile App Development',
      'Web Development & Advanced Web Development',
      'Software Construction & Development',
      'Software Quality Engineering (SQE)',
      'Database Management Systems',
      'Computer Networks',
      'Information Security',
    ],
  },
  contact: {
    email: 'uroojkhadim505@gmail.com',
    phone: '0313-6576128',
    github: 'https://github.com/uroojkhadim',
    linkedin: 'https://www.linkedin.com/in/urooj-khadim-26a334364',
    cvPath: '/cv/Urooj_Khadim_CV.pdf',
    cvFilename: 'Urooj_Khadim_CV.pdf',
    resumePath: '/cv/Urooj_Khadim_Resume.pdf',
    resumeFilename: 'Urooj_Khadim_Resume.pdf',
  },
  skills: {
    programming: ['Python', 'Java', 'C++', 'Dart', 'Kotlin', 'JavaScript (ES6+)'],
    webDevelopment: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Laravel', 'RESTful APIs', 'Backend Development', 'Full-Stack Architecture'],
    mobileDevelopment: ['Flutter', 'Dart', 'Android Development', 'Kotlin', 'Android XML'],
    databases: ['MySQL', 'MongoDB', 'SQLite', 'Supabase', 'Firebase Firestore / Realtime'],
    aiAndMl: ['Python-based Machine Learning', 'scikit-learn', 'Data Preprocessing', 'Model Training', 'Predictive Analytics'],
    tools: ['Git', 'GitHub', 'Visual Studio Code', 'Android Studio', 'Cursor', 'Dev C++', 'Vercel', 'Netlify', 'Firebase'],
  },
  flutterProjects: [
    {
      name: 'CV Maker App',
      description: 'A mobile application for creating and managing professional CVs and resumes with dynamic template formatting and export features.',
    },
    {
      name: 'Predictive Healthcare & Recommendation System',
      description: 'Flutter mobile application for health metric tracking, risk prediction using machine learning, and personalized wellness recommendations.',
    },
    {
      name: 'Task Management Mobile App',
      description: 'Productivity application built to organize daily tasks, set priorities, track deadlines, and maintain offline-ready productivity.',
    },
    {
      name: 'Musify App',
      description: 'Modern audio streaming mobile application featuring custom playlist curation and high-fidelity sound playback interface.',
    },
    {
      name: 'WeMuslim App',
      description: 'Islamic utility mobile app offering prayer time schedules, daily supplications, and an interactive digital Tasbeeh counter.',
    },
    {
      name: 'POS Coffee Shop Inventory Management System',
      description: 'Point-of-sale mobile solution designed for cafe workflows, featuring rapid order processing and stock inventory tracking.',
    },
  ],
  webProjects: [
    {
      name: 'Snapback Conversation Builder',
      description: 'Visual builder for conversational flows, interactive bot dialogues, and automated branch testing.',
      liveUrl: 'https://snapback-conversation-builder.lovable.app/',
    },
    {
      name: 'Techars',
      description: 'Full-stack software and digital services agency showcase presenting technology stacks and client solutions.',
      liveUrl: 'https://techars.vercel.app',
    },
    {
      name: '6 Star Hospitality',
      description: 'Luxury hospitality website featuring booking inquiry flows and guest services showcase.',
      liveUrl: 'https://6starhospitality.online/',
    },
    {
      name: 'CUI Plagiarism Portal',
      description: 'Academic document checking and verification portal for university library administration with secure cloud storage.',
      liveUrl: 'https://cui-plagiarism-portal-frontend.vercel.app/',
    },
    {
      name: 'FlickCom ISP Website',
      description: 'Responsive ISP business website with modern broadband service tiers and coverage portal.',
      liveUrl: 'https://flickcom-isp.vercel.app/',
    },
    {
      name: 'Cafeteria Management System',
      description: 'Web-based cafeteria food ordering and kitchen operations management system powered by Firebase.',
      liveUrl: 'https://cafeteria-management-main.firebaseapp.com',
    },
    {
      name: 'Quiz Website',
      description: 'Interactive quiz platform with timed questions and software engineering challenges.',
      liveUrl: 'https://quiz-website-blush-xi.vercel.app/',
    },
    {
      name: 'Healthcare Website',
      description: 'Modern healthcare clinic website with appointment booking and medical specialty directories.',
      liveUrl: 'https://healthcare-website-gold.vercel.app/',
    },
  ],
  experience: [
    {
      company: 'The GamiTron (PVT) Ltd',
      position: 'Android Developer',
      period: 'July 2026 – August 2026',
      location: 'Lahore Division, Punjab, Pakistan',
      description: 'Engineered Android features, optimized UI layouts, and integrated REST APIs.',
    },
    {
      company: 'Rhombix Technologies',
      position: 'Frontend Developer',
      period: 'March 2026 – July 2026',
      location: 'Remote',
      description: 'Developed responsive web interfaces, enhanced performance, and integrated client-side components.',
    },
    {
      company: 'DevelopersHub Corporation©',
      position: 'Intern — Android App Developer',
      period: 'December 2025 – April 2026',
      location: 'Remote / Hybrid',
      description: 'Contributed to Android mobile projects using Java and Kotlin, lifecycle debugging, and layout prototyping.',
    },
  ],
}

export const SUGGESTED_QUESTIONS = [
  'Who is Urooj Khadim?',
  'What are her technical skills?',
  'Tell me about her Flutter projects',
  'Where can I view her live projects?',
  'What is her work experience?',
  'How can I download her CV or Resume?',
]

/**
 * Intelligent deterministic & fuzzy knowledge base retriever
 * Ensures zero-failure offline and fallback conversational answers.
 */
export function getKnowledgeBaseAnswer(query) {
  const q = (query || '').toLowerCase().trim()

  // 1. Identity & Background
  if (
    q.includes('who is') ||
    q.includes('about urooj') ||
    q.includes('tell me about') ||
    q.includes('introduction') ||
    q.includes('background') ||
    q.includes('who are you')
  ) {
    return `**Urooj Khadim** is a **Software Developer** specializing in **Flutter, Web & AI/ML**, currently completing her Bachelor of Software Engineering at **COMSATS University Islamabad (Vehari Campus)**.

She builds practical digital solutions across mobile applications, web development, and intelligent systems. Her experience covers Android/Flutter mobile applications, modern React/Node.js web platforms, and Python-driven machine learning models.

Explore her story in the [About Me](#about) section!`
  }

  // 2. Skills
  if (
    q.includes('skill') ||
    q.includes('tech stack') ||
    q.includes('technologies') ||
    q.includes('languages') ||
    q.includes('what can she do')
  ) {
    return `Here is a summary of Urooj's verified technical competencies:

- **Programming:** Python, Java, C++, Dart, Kotlin, JavaScript (ES6+)
- **Mobile Development:** Flutter, Dart, Android Development, Kotlin, Android XML
- **Web & Full-Stack:** React, HTML5/CSS3, Laravel, Node.js, RESTful APIs
- **Databases & Cloud:** MySQL, MongoDB, SQLite, Supabase, Firebase
- **AI & ML:** Python ML, scikit-learn, data preprocessing, model training, predictive analytics
- **Tools:** Git, GitHub, VS Code, Android Studio, Cursor, Vercel

You can explore detailed competency cards in the [Skills](#skills) section!`
  }

  // 3. Flutter & Mobile
  if (
    q.includes('flutter') ||
    q.includes('mobile app') ||
    q.includes('android') ||
    q.includes('dart') ||
    q.includes('cv maker')
  ) {
    return `Yes! **Flutter and mobile application development** is one of Urooj's core specializations.

Her Flutter & mobile projects include:
1. **CV Maker App** — Mobile application for creating and managing professional CVs and resumes.
2. **Predictive Healthcare & Recommendation System** — Vital health tracking & ML risk forecasting.
3. **Task Management Mobile App** — Offline-ready daily task & priority manager.
4. **Musify App** — Music playback & playlist audio streaming app.
5. **WeMuslim App** — Islamic prayer schedule & digital Tasbeeh counter.
6. **POS Coffee Shop Inventory System** — Cafe point-of-sale & real-time stock manager.

You can inspect all mobile applications in the [Projects](#projects) section under the Flutter tab!`
  }

  // 4. Live Projects / Web Development
  if (
    q.includes('live project') ||
    q.includes('live demo') ||
    q.includes('web project') ||
    q.includes('website') ||
    q.includes('deployed') ||
    q.includes('full stack') ||
    q.includes('snapback') ||
    q.includes('techars') ||
    q.includes('hospitality')
  ) {
    return `Urooj has developed and deployed several live full-stack web applications:

1. **[Snapback Conversation Builder](https://snapback-conversation-builder.lovable.app/)** — Interactive bot conversation flow designer.
2. **[Techars](https://techars.vercel.app)** — Digital services and technology agency portal.
3. **[6 Star Hospitality](https://6starhospitality.online/)** — Premium hospitality showcase with reservation inquiry flow.
4. **[CUI Plagiarism Portal](https://cui-plagiarism-portal-frontend.vercel.app/)** — Academic originality checking system with Supabase cloud.
5. **[FlickCom ISP Website](https://flickcom-isp.vercel.app/)** — Broadband service portal.
6. **[Cafeteria Management System](https://cafeteria-management-main.firebaseapp.com)** — Food ordering & kitchen queue platform.
7. **[Quiz Website](https://quiz-website-blush-xi.vercel.app/)** — Timed software engineering quiz platform.
8. **[Healthcare Website](https://healthcare-website-gold.vercel.app/)** — Clinic booking & directory portal.

All live demos can be launched directly from the [Projects](#projects) section!`
  }

  // 5. AI / Machine Learning
  if (
    q.includes('ai') ||
    q.includes('ml') ||
    q.includes('machine learning') ||
    q.includes('predictive') ||
    q.includes('data science') ||
    q.includes('scikit')
  ) {
    return `Urooj has hands-on experience in **AI and Machine Learning**, specifically with **Python, scikit-learn, and predictive analytics**.

Key highlights:
- Developed the **Predictive Healthcare & Recommendation System** mobile application, integrating predictive algorithms for health risk assessments.
- Skilled in **data preprocessing, feature scaling, exploratory data analysis (EDA), and supervised classification/regression**.
- Following an active AI/ML learning roadmap spanning data engineering to generative AI integrations.

Check out the AI learning track in the [Roadmap](#roadmap) section!`
  }

  // 6. Experience & Internships
  if (
    q.includes('internship') ||
    q.includes('experience') ||
    q.includes('work') ||
    q.includes('certificate') ||
    q.includes('job') ||
    q.includes('gamitron') ||
    q.includes('rhombix') ||
    q.includes('developershub')
  ) {
    return `Urooj has industry and development experience across three key software engineering roles:

1. **The GamiTron (PVT) Ltd** — *Android Developer* (July 2026 – August 2026, Lahore Division, Punjab, Pakistan).
2. **Rhombix Technologies** — *Frontend Developer* (March 2026 – July 2026).
3. **DevelopersHub Corporation©** — *Intern — Android App Developer* (December 2025 – April 2026).

You can inspect the full role details and timeline in the [Experience](#experience) section!`
  }

  // 7. CV / Resume Download
  if (
    q.includes('cv') ||
    q.includes('resume') ||
    q.includes('download') ||
    q.includes('pdf')
  ) {
    return `You can download Urooj Khadim's credentials directly:

- **[Download CV (PDF)](/cv/Urooj_Khadim_CV.pdf)** — Detailed overview of coursework, projects, and skills.
- **[Download Resume (PDF)](/cv/Urooj_Khadim_Resume.pdf)** — Industry-focused summary of development roles and technical competencies.

You can also visit the [Resume](#resume) section to preview the documents interactively!`
  }

  // 8. Contact & Socials
  if (
    q.includes('contact') ||
    q.includes('hire') ||
    q.includes('email') ||
    q.includes('phone') ||
    q.includes('linkedin') ||
    q.includes('github') ||
    q.includes('message')
  ) {
    return `You can reach out to Urooj directly through:

- **Email:** [uroojkhadim505@gmail.com](mailto:uroojkhadim505@gmail.com)
- **Phone:** 0313-6576128
- **LinkedIn:** [linkedin.com/in/urooj-khadim-26a334364](https://www.linkedin.com/in/urooj-khadim-26a334364)
- **GitHub:** [github.com/uroojkhadim](https://github.com/uroojkhadim)
- **Contact Form:** Send a message directly via the [Contact](#contact) section!`
  }

  // 9. Education
  if (
    q.includes('education') ||
    q.includes('university') ||
    q.includes('degree') ||
    q.includes('comsats') ||
    q.includes('college') ||
    q.includes('academic')
  ) {
    return `Urooj Khadim is pursuing her **Bachelor of Software Engineering (BS SE)** at **COMSATS University Islamabad, Vehari Campus** (2023 – Present).

Her relevant coursework includes Object-Oriented Programming, Data Structures & Algorithms, Mobile App Development, Web & Advanced Web Development, Software Quality Engineering (SQE), and Database Management Systems.

Learn more in the [Education](#education) section!`
  }

  // 10. Default fallback
  return `Thank you for asking! I don't have verified details specifically regarding that topic in Urooj's portfolio records.

To get the exact information, please feel free to reach out to Urooj directly at **uroojkhadim505@gmail.com** or leave a message through the [Contact](#contact) form.

You can also explore her [Projects](#projects), [Skills](#skills), [Experience](#experience), [Education](#education), or [Download her CV](/cv/Urooj_Khadim_CV.pdf).`
}
