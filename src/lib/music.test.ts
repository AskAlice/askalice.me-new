import { describe, expect, it } from 'vitest'
import data from './music/i-promise.json'
import { TRACK } from './content'
import { formatTime, fractionAt, freqToY, logBands, sliceAt, type TrackAnalysis } from './music'

const D = data as TrackAnalysis
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

describe('i-promise.json integrity', () => {
  it('matches the TRACK metadata used for schema.org', () => {
    expect(D.track).toBe(TRACK.name)
    expect(D.duration).toBe(TRACK.durationSec)
    expect(D.audioUrl).toBe(TRACK.audioUrl)
  })
  it('has time-ordered slices inside the track, eight partials each', () => {
    D.slices.forEach((s, i) => {
      expect(s.harmonics).toHaveLength(8)
      expect(s.t).toBeGreaterThanOrEqual(0)
      expect(s.t).toBeLessThanOrEqual(D.duration)
      if (i) expect(s.t).toBeGreaterThan(D.slices[i - 1]!.t)
    })
  })
  it('carries the MP3 tag metadata and a log spectrogram axis', () => {
    expect(D.bpm).toBe(115)
    expect(D.encoder).toMatch(/FL Studio/)
    expect(D.spectrogram).toEqual({ fMin: 30, fMax: 16000, scale: 'log' })
    expect(D.slices.length).toBeCloseTo(D.duration / D.hop, -1)
  })
  it('labels every voiced slice with the note its frequency implies, silent ones with —', () => {
    for (const s of D.slices.filter((x) => x.freq === 0)) expect(s.note).toBe('—')
    for (const s of D.slices.filter((x) => x.freq > 0)) {
      const m = Math.round(69 + 12 * Math.log2(s.freq / 440))
      expect(`${NAMES[m % 12]}${Math.floor(m / 12) - 1}`).toBe(s.note)
    }
  })
})

describe('formatTime', () => {
  it.each([
    [0, '0:00'],
    [9.9, '0:09'],
    [207.38, '3:27'],
    [-4, '0:00'],
    [Number.NaN, '0:00'],
  ])('%s → %s', (s, want) => expect(formatTime(s)).toBe(want))
})

describe('sliceAt', () => {
  const s = [0, 1.6, 3.2].map((t) => ({ t, db: 0, rms: 0, freq: 440, note: 'A4', harmonics: [] }))
  it('returns the last slice starting at or before t, clamped at both ends', () => {
    expect(sliceAt(s, -1)!.t).toBe(0)
    expect(sliceAt(s, 0)!.t).toBe(0)
    expect(sliceAt(s, 1.59)!.t).toBe(0)
    expect(sliceAt(s, 1.6)!.t).toBe(1.6)
    expect(sliceAt(s, 99)!.t).toBe(3.2)
    expect(sliceAt([], 1)).toBeUndefined()
  })
  it('agrees with a linear scan on the real data', () => {
    for (let t = 0; t < D.duration; t += 0.37) {
      const linear = [...D.slices].reverse().find((x) => x.t <= t) ?? D.slices[0]
      expect(sliceAt(D.slices, t)).toBe(linear)
    }
  })
})

describe('freqToY', () => {
  it('puts fMax at the top, fMin at the bottom, and is log-linear between', () => {
    expect(freqToY(16000, 30, 16000)).toBeCloseTo(0)
    expect(freqToY(30, 30, 16000)).toBeCloseTo(1)
    const y1 = freqToY(100, 30, 16000)
    const y2 = freqToY(1000, 30, 16000)
    const y3 = freqToY(10000, 30, 16000)
    expect(y1 - y2).toBeCloseTo(y2 - y3) // decades are evenly spaced
  })
})

describe('fractionAt', () => {
  it('clamps to 0–1 and survives a zero-width element', () => {
    expect(fractionAt(50, 200)).toBe(0.25)
    expect(fractionAt(-5, 200)).toBe(0)
    expect(fractionAt(500, 200)).toBe(1)
    expect(fractionAt(5, 0)).toBe(0)
  })
})

describe('logBands', () => {
  it('reports the peak bin per log band, scaled 0–1', () => {
    const bins = new Uint8Array(1024)
    // 44.1 kHz → ~21.5 Hz per bin; put a full-scale tone at ~1 kHz (bin 46)
    bins[46] = 255
    const bands = logBands(bins, 44100, 32)
    expect(bands).toHaveLength(32)
    expect(Math.max(...bands)).toBe(1)
    const hit = bands.indexOf(1)
    const lo = 32 * (16000 / 32) ** (hit / 32)
    const hi = 32 * (16000 / 32) ** ((hit + 1) / 32)
    expect(1000).toBeGreaterThan(lo * 0.9)
    expect(1000).toBeLessThan(hi * 1.1)
  })
  it('is silent for silence and never returns empty bands', () => {
    expect(logBands(new Uint8Array(1024), 48000, 32).every((v) => v === 0)).toBe(true)
  })
})
