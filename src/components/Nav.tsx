import { useEffect, useState } from 'react'
import { LINKS } from '../lib/content'
import { NAV_ITEMS, NAV_SECTION_IDS, currentNavHref } from '../lib/navItems'
import { useActiveSection } from '../lib/useActiveSection'
import { useSite } from '../store'
import { AppLink } from './AppLink'
import { CloseIcon, GithubIcon, LinkedinIcon, MenuIcon } from './icons'

/**
 * Primary navigation. Desktop (lg+): inline links. Phones/tablets: a menu
 * button that opens a stacked panel (pattern from the AI Studio draft, but
 * every entry stays a real <a href> so crawlers can follow it).
 * The current section/view is marked with aria-current.
 */
export function Nav() {
  const view = useSite((s) => s.view)
  const section = useActiveSection(NAV_SECTION_IDS, view === 'home')
  const current = currentNavHref(view, section)
  const [open, setOpen] = useState(false)

  // close on Escape and whenever the route view changes
  useEffect(() => setOpen(false), [view])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const ariaFor = (href: string) =>
    href === current ? (NAV_ITEMS.find((i) => i.href === href)?.views?.includes(view) ? 'page' : 'location') : undefined

  return (
    <nav aria-label="Primary" className="fixed top-0 left-0 right-0 z-100 bg-[rgba(23,21,30,0.78)] backdrop-blur-14px border-b border-white/7">
      <div className="h-66px flex items-center justify-between px-[clamp(18px,5vw,56px)]">
        <AppLink href="/" className="flex items-center gap-11px whitespace-nowrap" onNavigate={() => setOpen(false)}>
          <span className="w-32px h-32px bg-flamingo rounded-10px flex items-center justify-center font-700 text-13px text-ink shadow-[0_4px_14px_rgba(245,112,138,0.5)]">
            AK
          </span>
          <span className="font-600 text-15.5px tracking-[-0.2px]">alice knag</span>
        </AppLink>

        <div className="hidden lg:flex items-center gap-4px">
          {NAV_ITEMS.map((i) => (
            <AppLink
              key={i.href}
              href={i.href}
              ariaCurrent={ariaFor(i.href)}
              className={`nav-link ${i.href === current ? '!text-bright bg-flamingo/12' : ''}`}
            >
              {i.label}
            </AppLink>
          ))}
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

        <button
          type="button"
          className="lg:hidden w-42px h-42px -mr-6px flex items-center justify-center rounded-11px text-bright bg-white/5 border border-white/10"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div id="mobile-nav" className="lg:hidden border-t border-white/7 bg-[rgba(23,21,30,0.96)] px-[clamp(18px,5vw,56px)] pt-6px pb-20px shadow-[0_24px_40px_rgba(0,0,0,0.45)]">
          {NAV_ITEMS.map((i) => (
            <AppLink
              key={i.href}
              href={i.href}
              ariaCurrent={ariaFor(i.href)}
              onNavigate={() => setOpen(false)}
              className={`flex items-center gap-12px py-14px text-18px font-500 border-b border-white/6 ${i.href === current ? 'text-bright' : 'text-muted'}`}
            >
              <span className={`w-6px h-6px rounded-full ${i.href === current ? 'bg-flamingo' : 'bg-white/12'}`} />
              {i.label}
            </AppLink>
          ))}
          <div className="flex gap-10px mt-18px">
            <a
              href={LINKS.github}
              target="_blank"
              rel="me noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-8px text-14px text-ink bg-flamingo py-12px rounded-full font-600"
            >
              <GithubIcon />
              GitHub
            </a>
            <a
              href={LINKS.linkedin}
              target="_blank"
              rel="me noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-8px text-14px text-bright bg-white/6 border border-white/12 py-12px rounded-full font-600"
            >
              <LinkedinIcon />
              LinkedIn
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
