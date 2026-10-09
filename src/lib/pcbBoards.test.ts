import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PCB_BOARDS, pcbMedia, stepIndex } from './pcbBoards'

const pub = (p: string) => new URL(`../../public${p}`, import.meta.url)

describe('PCB_BOARDS', () => {
  it('has unique ids', () => {
    const ids = PCB_BOARDS.map((b) => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it.each(PCB_BOARDS.map((b) => [b.id, b] as const))('%s has its media in public/', (_id, b) => {
    const m = pcbMedia(b)
    expect(existsSync(pub(m.render))).toBe(true)
    if (m.turntable) expect(existsSync(pub(m.turntable))).toBe(true)
  })
  it('flags the mains board', () => {
    expect(PCB_BOARDS.find((b) => b.id === 'relaymini-c3')?.warning).toMatch(/mains/i)
  })
})

describe('stepIndex', () => {
  it('wraps both ways', () => {
    expect(stepIndex(0, -1, 12)).toBe(11)
    expect(stepIndex(11, 1, 12)).toBe(0)
    expect(stepIndex(5, 25, 12)).toBe(6)
  })
})
