import { Smartphone, Globe2, BrainCircuit } from 'lucide-react'

export const roadmapTracks = [
  {
    id: 'flutter-mobile',
    title: 'Flutter & Mobile Development',
    tagline: 'Cross-platform mobile applications with reactive UI and cloud sync',
    icon: Smartphone,
    gradient: 'from-purple-500 to-indigo-600',
    accentColor: '#a855f7',
    stages: [
      {
        stageNumber: '01',
        title: 'Core Dart & UI Architecture',
        status: 'completed',
        statusLabel: 'Mastered',
        summary:
          'Deep mastery of Dart object-oriented principles, widget hierarchy, responsive layouts, and local mobile storage.',
        milestones: [
          'Dart OOP, Async programming & Streams',
          'Custom Widgets & Material 3 UI design',
          'Local Persistence (SQLite, SharedPreferences)',
          'State Management with Provider & setState',
        ],
      },
      {
        stageNumber: '02',
        title: 'Cloud Integration & State Architecture',
        status: 'current',
        statusLabel: 'Current Focus',
        summary:
          'Developing production-grade mobile applications with Firebase backend, REST API consumption, and clean architecture.',
        milestones: [
          'Firebase Auth, Firestore & Cloud Storage',
          'RESTful API integration with Dio / HTTP',
          'Scalable state management (BLoC / Riverpod)',
          'Push notifications & offline caching',
        ],
      },
      {
        stageNumber: '03',
        title: 'Native Modules & App Store Release',
        status: 'upcoming',
        statusLabel: 'Upcoming Stage',
        summary:
          'Native Android Kotlin bridging, background services, mobile performance profiling, and Play Store publishing.',
        milestones: [
          'Platform Channels & Kotlin native interop',
          'Background task scheduling & audio services',
          'Automated CI/CD build pipelines with Fastlane',
          'Google Play Store release & app signing',
        ],
      },
    ],
  },
  {
    id: 'fullstack-web',
    title: 'Full-Stack Web Development',
    tagline: 'Modern reactive frontends, resilient RESTful APIs, and cloud databases',
    icon: Globe2,
    gradient: 'from-blue-500 to-cyan-600',
    accentColor: '#0ea5e9',
    stages: [
      {
        stageNumber: '01',
        title: 'Modern Frontend Architecture',
        status: 'completed',
        statusLabel: 'Mastered',
        summary:
          'Creating responsive, accessible, and fast web applications with modern component patterns and styling systems.',
        milestones: [
          'Semantic HTML5, CSS3 & Tailwind CSS',
          'Modern JavaScript (ES6+, Async/Await)',
          'React 18 Component Architecture & Custom Hooks',
          'Framer Motion & interactive micro-animations',
        ],
      },
      {
        stageNumber: '02',
        title: 'Backend Services & Cloud Persistence',
        status: 'current',
        statusLabel: 'Current Focus',
        summary:
          'Designing scalable server-side systems, RESTful endpoints, relational & document schemas, and cloud integrations.',
        milestones: [
          'Node.js & Express.js server development',
          'Laravel PHP backend framework',
          'Databases: MySQL schemas & MongoDB collections',
          'Supabase database & Backblaze B2 storage',
        ],
      },
      {
        stageNumber: '03',
        title: 'DevOps, Serverless & Microservices',
        status: 'upcoming',
        statusLabel: 'Upcoming Stage',
        summary:
          'Containerized deployment, serverless edge functions, CI/CD automated testing, and web real-time protocols.',
        milestones: [
          'Docker containerization & environment isolation',
          'GitHub Actions CI/CD workflows',
          'Serverless API functions & Edge middleware',
          'WebSockets for real-time bi-directional messaging',
        ],
      },
    ],
  },
  {
    id: 'ai-ml',
    title: 'Artificial Intelligence & Machine Learning',
    tagline: 'Practical machine learning models, data preprocessing, and predictive intelligence',
    icon: BrainCircuit,
    gradient: 'from-emerald-500 to-teal-600',
    accentColor: '#10b981',
    stages: [
      {
        stageNumber: '01',
        title: 'Data Science & Python Foundations',
        status: 'completed',
        statusLabel: 'Mastered',
        summary:
          'Applying Python, Pandas, and NumPy for data manipulation, exploratory analysis, and cleaning pipeline construction.',
        milestones: [
          'Python data science libraries (NumPy, Pandas)',
          'Exploratory Data Analysis (EDA) & visual charting',
          'Data cleaning, missing value imputation, outlier handling',
          'Feature encoding, scaling & normalization',
        ],
      },
      {
        stageNumber: '02',
        title: 'Classical ML & Predictive Analytics',
        status: 'current',
        statusLabel: 'Current Focus',
        summary:
          'Training predictive classification and regression models, evaluating performance, and building domain-focused predictors.',
        milestones: [
          'scikit-learn supervised learning algorithms',
          'Classification, Regression & Decision Trees',
          'Model evaluation metrics (Accuracy, F1-score, ROC-AUC)',
          'Predictive health recommendation application integration',
        ],
      },
      {
        stageNumber: '03',
        title: 'Generative AI & Agentic Systems',
        status: 'upcoming',
        statusLabel: 'Upcoming Stage',
        summary:
          'Leveraging advanced GenAI models, prompt engineering, multi-turn conversational agents, and edge inference.',
        milestones: [
          'Google Gemini API & multimodal prompting',
          'Retrieval-Augmented Generation (RAG) workflows',
          'Function calling & tool-augmented AI agents',
          'On-device AI model deployment for mobile',
        ],
      },
    ],
  },
]
