import { afterEach, describe, expect, it, vi } from 'vitest'
import { GET } from '../../api/suggest'

const req = (q: string) => new Request(`https://askalice.me/api/suggest?type=json&useApiKeys=true&q=${encodeURIComponent(q)}`)

afterEach(() => vi.unstubAllGlobals())

describe('api/suggest', () => {
  it('rejects empty and over-long queries without calling upstream', async () => {
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    expect((await GET(req('  '))).status).toBe(400)
    expect((await GET(req('x'.repeat(201)))).status).toBe(400)
    expect(f).not.toHaveBeenCalled()
  })
  it('forwards only q to the fixed upstream (never useApiKeys) and relays JSON', async () => {
    const f = vi.fn(async () => new Response('[{"suggestion":"a"}]', { status: 200 }))
    vi.stubGlobal('fetch', f)
    const res = await GET(req('google.com mx'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual([{ suggestion: 'a' }])
    const url = new URL(String((f.mock.calls[0] as unknown[])[0]))
    expect(url.origin + url.pathname).toBe('https://search.emu.sh/suggest')
    expect(url.searchParams.get('q')).toBe('google.com mx')
    expect(url.searchParams.get('type')).toBe('json')
    expect(url.searchParams.has('useApiKeys')).toBe(false)
  })
  it('maps upstream failures to 502 and timeouts to 504', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })))
    expect((await GET(req('a'))).status).toBe(502)
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>', { status: 200 })))
    expect((await GET(req('a'))).status).toBe(502)
    vi.stubGlobal('fetch', vi.fn(async () => { throw Object.assign(new Error('t'), { name: 'TimeoutError' }) }))
    expect((await GET(req('a'))).status).toBe(504)
  })
})
