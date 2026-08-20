import { useSite } from './store'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Experience } from './components/Experience'
import { Demos } from './components/Demos'
import { Writing } from './components/Writing'
import { ResumeSection } from './components/ResumeSection'
import { Footer } from './components/Footer'
import { BlogIndex } from './views/BlogIndex'
import { Photography } from './views/Photography'
import { BlogPost } from './views/BlogPost'
import { DemoDetail } from './views/DemoDetail'

export default function App() {
  const view = useSite((s) => s.view)
  return (
    <div className="bg-ink text-bright min-h-100vh relative overflow-x-hidden">
      <Nav />
      {view === 'home' && (
        <div>
          <Hero />
          <About />
          <Experience />
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
    </div>
  )
}
