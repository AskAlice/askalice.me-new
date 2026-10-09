import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET, LIMITS, allow } from '../../api/suggest'

let ipSeq = 0
// each request gets its own client IP so the rate limiter doesn't couple tests
const req = (q: string, ip = `203.0.113.${++ipSeq % 250}`) =>
  new Request(`https://askalice.me/api/suggest?type=xml&useApiKeys=false&q=${encodeURIComponent(q)}`, {
    headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` },
  })

afterEach(() => vi.unstubAllGlobals())

describe('api/suggest', () => {
  it('rejects empty and over-long queries without calling upstream', async () => {
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    expect((await GET(req('  '))).status).toBe(400)
    expect((await GET(req('x'.repeat(201)))).status).toBe(400)
    expect(f).not.toHaveBeenCalled()
  })
  it('forwards only q to the fixed upstream, always with useApiKeys=true, and relays JSON', async () => {
    const f = vi.fn(async () => new Response('[{"suggestion":"a"}]', { status: 200 }))
    vi.stubGlobal('fetch', f)
    const res = await GET(req('google.com mx'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([{ suggestion: 'a' }])
    const url = new URL(String((f.mock.calls[0] as unknown[])[0]))
    expect(url.origin + url.pathname).toBe('https://search.emu.sh/suggest')
    expect(url.searchParams.get('q')).toBe('google.com mx')
    expect(url.searchParams.get('type')).toBe('json') // caller's type=xml ignored
    expect(url.searchParams.get('useApiKeys')).toBe('true') // caller's useApiKeys=false ignored
    expect([...url.searchParams.keys()].sort()).toEqual(['client', 'q', 'type', 'useApiKeys'])
  })
  it('maps upstream failures to 502 and timeouts to 504', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))
    expect((await GET(req('a'))).status).toBe(502)
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>', { status: 200 })))
    expect((await GET(req('a'))).status).toBe(502)
    vi.stubGlobal('fetch', vi.fn(async () => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }) }))
    expect((await GET(req('a'))).status).toBe(504)
  })
  it('rate-limits a burst from one client before the upstream is called', async () => {
    const f = vi.fn(async () => new Response('[]', { status: 200 }))
    vi.stubGlobal('fetch', f)
    const ip = '198.51.100.7'
    for (let i = 0; i < 5; i++) expect((await GET(req('a', ip))).status).toBe(200)
    const limited = await GET(req('a', ip)) // 6th within the same second
    expect(limited.status).toBe(429)
    expect(limited.headers.get('retry-after')).toBe('1')
    expect(f).toHaveBeenCalledTimes(5)
    expect((await GET(req('a', '198.51.100.8'))).status).toBe(200) // other clients unaffected
  })
})

describe('allow (5/s and 100/min)', () => {
  it('limits bursts to 5 per second', () => {
    const t0 = 1_000_000
    for (let i = 0; i < 5; i++) expect(allow('192.0.2.1', t0)).toBe(true)
    expect(allow('192.0.2.1', t0 + 10)).toBe(false)
    expect(allow('192.0.2.1', t0 + 1_000)).toBe(true) // next second
  })
  it('caps a steady client at 100 per minute', () => {
    const t0 = 2_000_000
    let ok = 0
    for (let i = 0; i < 150; i++) if (allow('192.0.2.2', t0 + i * 250)) ok++ // 4/s for 37.5 s
    expect(ok).toBe(100)
    expect(allow('192.0.2.2', t0 + 60_000)).toBe(true) // fresh minute
  })
  it('exports the configured limits', () => {
    expect(LIMITS).toEqual([
      [5, 1_000],
      [100, 60_000],
    ])
  })
})
