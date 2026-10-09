// Data helpers for the "I Promise" demo (/demos/music).
//
// Provenance: the 128 analysis slices and the spectrogram image come from the
// AI Studio draft. Before keeping them they were checked against each other:
// per-slice loudness (dB) correlates r≈0.90 with the spectrogram's column
// brightness (≈0 for shuffled data), and every slice's note name matches its
// frequency. The draft's BPM, key, "arrangement sections" and its synthetic
// "live FFT" (sine-wave beats plus pink noise) could not be verified and were
// dropped. The live spectrum is a real Web Audio AnalyserNode.

export interface MusicSlice {
  /** seconds from track start */
  t: number
  /** loudness, dBFS */
  db: number
  rms: number
  /** dominant pitch, Hz */
  freq: number
  note: string
  /** relative amplitude of partials H1–H8 */
  harmonics: number[]
}

export interface TrackAnalysis {
  track: string
  artist: string
  duration: number
  audioUrl: string
  slices: MusicSlice[]
}

/** m:ss for a time in seconds (negative and NaN clamp to 0:00). */
export function formatTime(secs: number): string {
  const s = Number.isFinite(secs) && secs > 0 ? Math.floor(secs) : 0
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** The analysis slice covering time `t` (last slice whose start ≤ t), clamped to the track. */
export function sliceAt(slices: readonly MusicSlice[], t: number): MusicSlice | undefined {
  if (slices.length === 0) return undefined
  let lo = 0
  let hi = slices.length - 1
  if (!(t > slices[0]!.t)) return slices[0]
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (slices[mid]!.t <= t) lo = mid
    else hi = mid - 1
  }
  return slices[lo]
}

/** Fraction 0–1 of `x` across an element of width `w` (pointer → scrub position). */
export function fractionAt(x: number, w: number): number {
  if (!(w > 0)) return 0
  return Math.min(1, Math.max(0, x / w))
}

/**
 * Collapse AnalyserNode byte bins (0–255, linear 0…nyquist) into `n`
 * log-spaced bands between `fMin` and `fMax`, each the peak bin in its range,
 * scaled to 0–1. Empty ranges borrow the nearest bin so no band is dead.
 */
export function logBands(bins: ArrayLike<number>, sampleRate: number, n: number, fMin = 32, fMax = 16000): number[] {
  const nyquist = sampleRate / 2
  const binHz = nyquist / bins.length
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    const lo = fMin * (fMax / fMin) ** (i / n)
    const hi = fMin * (fMax / fMin) ** ((i + 1) / n)
    const a = Math.min(bins.length - 1, Math.floor(lo / binHz))
    const b = Math.min(bins.length - 1, Math.max(a, Math.ceil(hi / binHz) - 1))
    let peak = 0
    for (let k = a; k <= b; k++) peak = Math.max(peak, bins[k] ?? 0)
    out.push(peak / 255)
  }
  return out
}
