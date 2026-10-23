import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { NavigationProvider, useNavigation } from './context/NavigationContext'
import { DataProvider } from './context/DataContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingScreen from './components/ui/LoadingScreen'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Experience from './components/sections/Experience'
import Projects from './components/sections/Projects'
import Education from './components/sections/Education'
import Roadmap from './components/sections/Roadmap'
import Resume from './components/sections/Resume'
import Contact from './components/sections/Contact'
import Chatbot from './components/chat/Chatbot'
import { navLinks } from './data/personal'

const SECTION_IDS = navLinks.map((link) => link.id)

function PortfolioContent() {
  const { setActiveSection } = useNavigation()

  // Active section scroll spy
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY + 140

          for (let i = SECTION_IDS.length - 1; i >= 0; i--) {
            const section = document.getElementById(SECTION_IDS[i])
            if (section && section.offsetTop <= scrollPosition) {
              setActiveSection(SECTION_IDS[i])
              break
            }
          }
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setActiveSection])

  return (
    <main className="relative">
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Projects />
      <Education />
      <Roadmap />
      <Resume />
      <Contact />
    </main>
  )
}

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ThemeProvider>
      <DataProvider>
      <NavigationProvider>
        <AnimatePresence>
          {loading && <LoadingScreen />}
        </AnimatePresence>
        <div className="flex min-h-screen flex-col bg-surface-light text-slate-900 transition-colors duration-300 dark:bg-surface-dark dark:text-slate-100">
          <Navbar />
          <div className="flex-1">
            <PortfolioContent />
          </div>
          <Footer />
          <Chatbot />
        </div>
      </NavigationProvider>
      </DataProvider>
    </ThemeProvider>
  )
}

export default App
