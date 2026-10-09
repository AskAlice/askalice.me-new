import { useEffect } from 'react'
import { parsePath } from './lib/routes'
import { EMU_LLC } from './lib/env'
import { useSite } from './store'
import { Nav } from './components/Nav'
import { Seo } from './components/Seo'
import { Hero } from './components/Hero'
import { StatsBar } from './components/StatsBar'
import { About } from './components/About'
import { Experience } from './components/Experience'
import { Demos } from './components/Demos'
import { Writing } from './components/Writing'
import { ResumeSection } from './components/ResumeSection'
import { Footer } from './components/Footer'
import { Team } from './components/Team'
import { BlogIndex } from './views/BlogIndex'
import { Photography } from './views/Photography'
import { BlogPost } from './views/BlogPost'
import { DemoDetail } from './views/DemoDetail'

export default function App() {
  const view = useSite((s) => s.view)
  const applyRoute = useSite((s) => s.applyRoute)

  useEffect(() => {
    const onPop = () => applyRoute(parsePath(location.pathname), true)
    window.addEventListener('popstate', onPop)
    const boot = parsePath(location.pathname)
    if (boot.section) applyRoute(boot, true)
    return () => window.removeEventListener('popstate', onPop)
  }, [applyRoute])

  return (
    <div className="bg-ink text-bright min-h-100vh relative overflow-x-hidden">
      <Seo />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-8px focus:left-8px focus:z-200 focus:bg-flamingo focus:text-ink focus:px-14px focus:py-8px focus:rounded-8px focus:font-600"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        {view === 'home' && (
          <div>
            <Hero />
            {!EMU_LLC && <StatsBar />}
            <About />
            {EMU_LLC ? <Team /> : <Experience />}
            <Demos />
            <Writing />
            <ResumeSection />
            <Footer />
          </div>
        )}
        {view === 'blog' && <BlogIndex />}
        {view === 'photos' && <Photography />}
        {view === 'post' && <BlogPost />}
        {view === 'demo' && <DemoDetail />}
      </main>
    </div>
  )
}
