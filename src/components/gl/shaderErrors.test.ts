import { describe, expect, it } from 'vitest'
import { shortErr } from './shaderErrors'

describe('shortErr', () => {
  it('rewrites the ANGLE/Mesa "ERROR: 0:N:" prefix to "line N"', () => {
    expect(shortErr("ERROR: 0:12: 'x' : undeclared identifier\nERROR: 1 compilation errors")).toBe(
      "line 12: 'x' : undeclared identifier",
    )
  })
  it('skips blank leading lines and caps the length for the status chip', () => {
    const out = shortErr(`\n\n  ERROR: 0:3: ${'y'.repeat(200)}`)
    expect(out.startsWith('line 3:')).toBe(true)
    expect(out.length).toBeLessThanOrEqual(52)
  })
  it('falls back to a generic message on an empty log', () => {
    expect(shortErr('')).toBe('compile error')
  })
})
