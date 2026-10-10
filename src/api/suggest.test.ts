import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET, LIMITS, allow, rateKey, upstreamUrl } from '../../api/suggest'

let ipSeq = 0
// each request gets its own client IP so the rate limiter doesn't couple tests
const reqUrl = (url: string, ip = `203.0.113.${++ipSeq % 250}`) =>
  new Request(url, { headers: { 'x-forwarded-for': `${ip}, 10.0.0.1` } })
const req = (q: string, ip?: string) => reqUrl(`https://askalice.me/api/suggest?q=${encodeURIComponent(q)}`, ip)

afterEach(() => vi.unstubAllGlobals())

describe('api/suggest', () => {
  it('rejects empty and over-long queries without calling upstream', async () => {
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    expect((await GET(req('  '))).status).toBe(400)
    expect((await GET(req('x'.repeat(201)))).status).toBe(400)
    expect((await GET(req('🦤'.repeat(201)))).status).toBe(400)
    expect(f).not.toHaveBeenCalled()
  })
  it('counts the limit in code points, so 200 emoji are accepted', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('[]', { status: 200 })))
    expect((await GET(req('🦤'.repeat(200)))).status).toBe(200)
  })
  it('rejects any parameter besides q (they would split the edge cache)', async () => {
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    for (const extra of ['type=xml', 'useApiKeys=false', 'x=1', 'Q=a']) {
      expect((await GET(reqUrl(`https://askalice.me/api/suggest?q=a&${extra}`))).status).toBe(400)
    }
    expect(f).not.toHaveBeenCalled()
  })
  it('forwards q to the fixed upstream, always with useApiKeys=true, refusing redirects, and relays JSON', async () => {
    const f = vi.fn(async () => new Response('[{"suggestion":"a"}]', { status: 200 }))
    vi.stubGlobal('fetch', f)
    const res = await GET(req('google.com mx'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([{ suggestion: 'a' }])
    const url = new URL(String((f.mock.calls[0] as unknown[])[0]))
    expect(url.origin + url.pathname).toBe('https://search.emu.sh/suggest')
    expect(url.searchParams.get('q')).toBe('google.com mx')
    expect(url.searchParams.get('type')).toBe('json')
    expect(url.searchParams.get('useApiKeys')).toBe('true')
    expect([...url.searchParams.keys()].sort()).toEqual(['client', 'q', 'type', 'useApiKeys'])
    expect((f.mock.calls[0] as unknown[])[1]).toMatchObject({ redirect: 'error' })
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

describe('upstreamUrl', () => {
  it.each(['a&useApiKeys=false', 'a#frag', 'a\r\nHost: x', 'a/../../x', '%26'])('keeps %j inside q on the fixed host', (q) => {
    const url = new URL(upstreamUrl(q))
    expect(url.origin + url.pathname).toBe('https://search.emu.sh/suggest')
    expect(url.searchParams.get('q')).toBe(q)
    expect([...url.searchParams.keys()].sort()).toEqual(['client', 'q', 'type', 'useApiKeys'])
  })
})

describe('rateKey', () => {
  it('keeps IPv4 as-is and unwraps IPv4-mapped IPv6', () => {
    expect(rateKey('203.0.113.9')).toBe('203.0.113.9')
    expect(rateKey('::ffff:203.0.113.9')).toBe('203.0.113.9')
  })
  it('groups IPv6 by /64, whatever the notation', () => {
    const a = rateKey('2001:db8:1:2:aaaa::1')
    expect(a).toBe('2001:db8:1:2::/64')
    expect(rateKey('2001:0DB8:0001:0002:ffff:ffff:ffff:ffff')).toBe(a)
    expect(rateKey('2001:db8:1:3::1')).not.toBe(a)
    expect(rateKey('2001:db8::1')).toBe('2001:db8:0:0::/64')
    expect(rateKey('::1')).toBe('0:0:0:0::/64')
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
  it('rotating IPv6 addresses inside one /64 share a limit', () => {
    const t0 = 3_000_000
    for (let i = 1; i <= 5; i++) expect(allow(`2001:db8:5:5::${i}`, t0)).toBe(true)
    expect(allow('2001:db8:5:5::99', t0)).toBe(false)
  })
  it('prunes expired clients first, so an active client keeps its count when the table fills', async () => {
    vi.resetModules()
    const m = await import('../../api/suggest') // fresh limiter state
    const t0 = 4_000_000
    const t1 = t0 + 120_000 // every t0 window has expired by now
    for (let i = 0; i < m.MAX_TRACKED - 1; i++) m.allow(`10.0.${(i >> 8) & 255}.${i & 255}`, t0)
    for (let i = 0; i < 5; i++) expect(m.allow('192.0.2.50', t1)).toBe(true) // table is now full
    expect(m.allow('192.0.2.51', t1)).toBe(true) // new client → prune
    expect(m.trackedCount()).toBe(2)
    expect(m.allow('192.0.2.50', t1)).toBe(false) // its burst count survived the prune
  })
  it('stays bounded when every tracked client is still active', async () => {
    vi.resetModules()
    const m = await import('../../api/suggest')
    for (let i = 0; i < m.MAX_TRACKED * 2; i++) m.allow(`172.16.${(i >> 8) & 255}.${i & 255}`, 5_000_000)
    expect(m.trackedCount()).toBeLessThanOrEqual(m.MAX_TRACKED)
  })
  it('exports the configured limits', () => {
    expect(LIMITS).toEqual([
      [5, 1_000],
      [100, 60_000],
    ])
  })
})
