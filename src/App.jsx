import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LoadingScreen from './components/ui/LoadingScreen'
import Hero from './components/sections/Hero'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Projects from './components/sections/Projects'
import Education from './components/sections/Education'
import Contact from './components/sections/Contact'

function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ThemeProvider>
      {loading && <LoadingScreen />}
      <div className="min-h-screen bg-surface-light text-slate-900 transition-colors duration-300 dark:bg-surface-dark dark:text-slate-100">
        <Navbar />
        <main>
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Education />
          <Contact />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
