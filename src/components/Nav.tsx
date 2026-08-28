import { LINKS } from '../lib/content'
import { GithubIcon, LinkedinIcon } from './icons'
import { AppLink } from './AppLink'

export function Nav() {
  return (
    <nav aria-label="Primary" className="fixed top-0 left-0 right-0 h-66px z-100 flex items-center justify-between px-[clamp(18px,5vw,56px)] bg-[rgba(23,21,30,0.78)] backdrop-blur-14px border-b border-white/7">
      <AppLink href="/" className="flex items-center gap-11px">
        <span className="w-32px h-32px bg-flamingo rounded-10px flex items-center justify-center font-700 text-13px text-ink shadow-[0_4px_14px_rgba(245,112,138,0.5)]">
          AK
        </span>
        <span className="font-600 text-15.5px tracking-[-0.2px]">alice knag</span>
      </AppLink>
      <div className="flex items-center gap-4px">
        <AppLink href="/work" className="nav-link">Work</AppLink>
        <AppLink href="/demos" className="nav-link">Demos</AppLink>
        <AppLink href="/photography" className="nav-link">Photography</AppLink>
        <AppLink href="/writing" className="nav-link">Writing</AppLink>
        <AppLink href="/resume" className="nav-link">Résumé</AppLink>
        <a
          href={LINKS.linkedin}
          target="_blank"
          rel="me noopener noreferrer"
          aria-label="Alice Knag on LinkedIn"
          className="w-38px h-38px flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-muted ml-8px transition-all duration-150 hover:text-sky hover:-translate-y-1px"
        >
          <LinkedinIcon />
        </a>
        <a
          href={LINKS.github}
          target="_blank"
          rel="me noopener noreferrer"
          className="flex items-center gap-7px text-14px text-ink bg-flamingo px-16px py-9px rounded-full font-600 ml-4px shadow-[0_6px_18px_rgba(245,112,138,0.4)] transition-transform duration-150 hover:-translate-y-1px"
        >
          <GithubIcon />
          GitHub
        </a>
      </div>
    </nav>
  )
}
