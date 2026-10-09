import { describe, expect, it } from 'vitest'
import { countAt, easeOutCubic } from './countUp'

describe('easeOutCubic', () => {
  it('pins the endpoints and clamps out-of-range input', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(-3)).toBe(0)
    expect(easeOutCubic(7)).toBe(1)
  })
  it('is monotonic and front-loaded', () => {
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875)
    for (let t = 0; t < 1; t += 0.05) expect(easeOutCubic(t + 0.05)).toBeGreaterThanOrEqual(easeOutCubic(t))
  })
})

describe('countAt', () => {
  it('starts at 0 and lands exactly on the target', () => {
    expect(countAt(80, 0)).toBe(0)
    expect(countAt(80, 1)).toBe(80)
    expect(countAt(80, 1.4)).toBe(80)
  })
  it('only yields integers and never overshoots', () => {
    for (let t = 0; t <= 1; t += 0.01) {
      const v = countAt(35, t)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeLessThanOrEqual(35)
    }
  })
  it('handles a target of 1 (the "1M+" stat)', () => {
    expect(countAt(1, 0.1)).toBe(0)
    expect(countAt(1, 1)).toBe(1)
  })
})
