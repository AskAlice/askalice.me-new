import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      ink: '#17151e',          // page background
      pit: '#1c1925',          // footer / github cards
      card: '#211d2b',         // surfaces
      carddeep: '#1a1722',     // surface gradient end
      bright: '#ece9f2',       // text primary
      body: '#b9b3c6',         // body text
      body2: '#c5c0d2',        // post body text
      muted: '#9b95aa',        // muted text
      faint: '#8b8698',        // faint labels
      ghost: '#6b6678',        // mono footer text
      flamingo: '#f5708a',     // primary accent
      pink: '#ff8aa0',         // accent text / hover
      rose: '#ffd0da',         // hero badge text
      sky: '#8fc9f5',
      lilac: '#b3a4f7',
      mint: '#7fe0b0',
      butter: '#ffd47e',
    },
    fontFamily: {
      sans: "'Space Grotesk', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },
  shortcuts: {
    // section eyebrow: `01 / about`
    eyebrow: 'flex items-center gap-10px font-mono text-13px text-flamingo',
    'eyebrow-rule': 'w-24px h-1px bg-flamingo',
    // bordered mono tech chip
    'tech-chip': 'font-mono text-11.5px text-body border border-white/12 rounded-6px px-9px py-4px',
    // nav text link
    'nav-link': 'text-14px font-medium text-muted px-13px py-8px rounded-9px cursor-pointer transition-all duration-150 hover:text-bright hover:bg-flamingo/12',
    'section-pad': 'max-w-1080px mx-auto px-[clamp(18px,5vw,56px)]',
  },
})
