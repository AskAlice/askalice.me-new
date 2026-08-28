import { create } from 'zustand'
import { WARP_FRAG_DEFAULT } from './shaders/warp.frag'
import { parsePath, pathFor, type Route } from './lib/routes'

export type View = 'home' | 'blog' | 'post' | 'demo' | 'photos'
export type DemoId = 'search' | 'geo' | 'flex' | 'midi' | 'pcbs'
export type PostId = 1 | 2 | 3

interface SiteState {
  view: View
  activeDemo: DemoId | null
  activePost: PostId | null
  showEditor: boolean
  warpSrc: string
  warpErr: string
  go: (view: View, opts?: { demo?: DemoId; post?: PostId }) => void
  goPath: (href: string) => void
  scrollOrHome: (id: string) => void
  applyRoute: (r: Route, scroll: boolean) => void
  toggleEditor: () => void
  setWarpSrc: (src: string) => void
  setWarpErr: (err: string) => void
  resetShader: () => void
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' })
}

function push(path: string) {
  if (location.pathname !== path) history.pushState(null, '', path)
}

const boot = parsePath(typeof location === 'undefined' ? '/' : location.pathname)

export const useSite = create<SiteState>((set, get) => ({
  view: boot.view,
  activeDemo: boot.demo,
  activePost: boot.post,
  showEditor: false,
  warpSrc: WARP_FRAG_DEFAULT,
  warpErr: '',
  applyRoute: (r, scroll) => {
    const wasHome = get().view === 'home'
    set({ view: r.view, activeDemo: r.demo, activePost: r.post })
    if (!scroll) return
    if (r.view === 'home' && r.section) {
      if (wasHome) scrollToSection(r.section)
      else setTimeout(() => scrollToSection(r.section!), 60)
    } else {
      window.scrollTo(0, 0)
    }
  },
  goPath: (href) => {
    const r = parsePath(href)
    push(pathFor(r))
    get().applyRoute(r, true)
  },
  go: (view, opts = {}) => {
    get().goPath(pathFor({ view, demo: opts.demo ?? null, post: opts.post ?? null, section: null }))
  },
  scrollOrHome: (id) => get().goPath(`/${id}`),
  toggleEditor: () => set((s) => ({ showEditor: !s.showEditor })),
  setWarpSrc: (warpSrc) => set({ warpSrc }),
  setWarpErr: (warpErr) => set({ warpErr }),
  resetShader: () => set({ warpSrc: WARP_FRAG_DEFAULT, warpErr: '' }),
}))
