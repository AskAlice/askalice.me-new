// Env-driven site variants. Set VITE_EMU_LLC=1 (or true) at build time to
// switch the site into the emu LLC variant (team roster instead of solo mode).
const raw = import.meta.env.VITE_EMU_LLC
export const EMU_LLC = raw === '1' || raw === 'true'
