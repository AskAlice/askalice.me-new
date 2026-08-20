import { create } from 'zustand'
import { WARP_FRAG_DEFAULT } from './shaders/warp.frag'

export type View = 'home' | 'blog' | 'post' | 'demo' | 'photos'
export type DemoId = 'shader' | 'geo' | 'flex'
export type PostId = 1 | 2 | 3

interface SiteState {
  view: View
  activeDemo: DemoId | null
  activePost: PostId | null
  showEditor: boolean
  warpSrc: string
  warpErr: string
  go: (view: View, opts?: { demo?: DemoId; post?: PostId }) => void
  scrollOrHome: (id: string) => void
  toggleEditor: () => void
  setWarpSrc: (src: string) => void
  setWarpErr: (err: string) => void
  resetShader: () => void
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: 'smooth' })
}

export const useSite = create<SiteState>((set, get) => ({
  view: 'home',
  activeDemo: null,
  activePost: null,
  showEditor: false,
  warpSrc: WARP_FRAG_DEFAULT,
  warpErr: '',
  go: (view, opts = {}) => {
    set({ view, activeDemo: opts.demo ?? null, activePost: opts.post ?? null })
    window.scrollTo(0, 0)
  },
  scrollOrHome: (id) => {
    if (get().view !== 'home') {
      set({ view: 'home', activeDemo: null, activePost: null })
      setTimeout(() => scrollToSection(id), 60)
    } else {
      scrollToSection(id)
    }
  },
  toggleEditor: () => set((s) => ({ showEditor: !s.showEditor })),
  setWarpSrc: (warpSrc) => set({ warpSrc }),
  setWarpErr: (warpErr) => set({ warpErr }),
  resetShader: () => set({ warpSrc: WARP_FRAG_DEFAULT, warpErr: '' }),
}))
