# Urooj Khadim — Developer Portfolio

A modern, premium, fully responsive developer portfolio built with **React**, **Tailwind CSS**, and **Framer Motion**. Designed to be recruiter-friendly, internship-ready, and freelance-client ready.

## Features

- Premium glassmorphism UI with blue/purple gradients
- Dark / light mode toggle with persistence
- Sticky responsive navbar with active section highlighting
- Smooth scroll navigation and subtle Framer Motion animations
- Seven polished sections: Hero, About, Skills, Projects, Education, Contact, Footer
- SEO-friendly meta tags and accessible markup
- Only real deployed projects — no dummy placeholders

## Tech Stack

- React 18 + Vite
- Tailwind CSS 3
- Framer Motion
- Lucide React icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
portfolio/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── layout/      # Navbar, Footer
│   │   ├── sections/    # Hero, About, Skills, Projects, Education, Contact
│   │   └── ui/          # Shared UI components
│   ├── context/         # Theme provider
│   ├── data/            # Personal info, projects, skills, education
│   ├── hooks/           # Active section scroll hook
│   ├── App.jsx
│   └── main.jsx
├── index.html
└── package.json
```

## Deployment

Deploy the `dist` folder to [Vercel](https://vercel.com), [Netlify](https://netlify.com), or any static host:

```bash
npm run build
```

## License

MIT License
