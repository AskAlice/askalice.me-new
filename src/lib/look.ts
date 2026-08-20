// Shader palettes + intensity presets from the handoff's "Tweakable Params".
// The shipped design uses palette Flamingo at intensity Hyper.
export type Vec3 = [number, number, number]

export const PALETTES: Record<string, [Vec3, Vec3, Vec3, Vec3]> = {
  'Oil Slick': [[0.58, 0.2, 0.78], [0.1, 0.4, 0.72], [0.08, 0.7, 0.55], [0.94, 0.74, 0.26]],
  Flamingo: [[0.96, 0.44, 0.54], [0.7, 0.64, 0.97], [0.56, 0.79, 0.96], [0.5, 0.88, 0.69]],
  Lagoon: [[0.4, 0.78, 0.95], [0.45, 0.9, 0.72], [0.36, 0.82, 0.85], [0.55, 0.7, 0.95]],
  Ultraviolet: [[0.62, 0.52, 0.97], [0.85, 0.4, 0.85], [0.96, 0.5, 0.7], [0.45, 0.42, 0.85]],
  Mono: [[0.9, 0.55, 0.62], [0.74, 0.55, 0.64], [0.58, 0.52, 0.6], [0.94, 0.74, 0.78]],
}

export const INTENSITIES = {
  Calm: { speed: 0.5, warp: 3.2, amp: 0.85 },
  Balanced: { speed: 1.0, warp: 4.2, amp: 1.0 },
  Hyper: { speed: 2.0, warp: 5.6, amp: 1.3 },
} as const

export const LOOK = {
  palette: PALETTES.Flamingo,
  ...INTENSITIES.Hyper,
}
