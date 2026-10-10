import { describe, expect, it } from 'vitest'
import { MAX_QUERY, clampQuery, classifyQuery, parseSuggestions, searchUrl, suggestEndpoint } from './omnibox'

describe('classifyQuery (mirrors search.emu.sh routing)', () => {
  it.each([
    ['google.com mx', { kind: 'dig', domain: 'google.com', record: 'MX' }],
    ['dig askalice.me a', { kind: 'dig', domain: 'askalice.me', record: 'A' }],
    ['sub.example.co.uk TXT', { kind: 'dig', domain: 'sub.example.co.uk', record: 'TXT' }],
    ['1.1.1.1', { kind: 'ip', ip: '1.1.1.1' }],
    ['2606:4700:4700::1111', { kind: 'ip', ip: '2606:4700:4700::1111' }],
    ['!gh home-automation-pcbs', { kind: 'bang', bang: 'gh', rest: 'home-automation-pcbs' }],
    ['!w', { kind: 'bang', bang: 'w', rest: '' }],
    ['denver weather', { kind: 'search' }],
    ['999.1.1.1', { kind: 'search' }],
    ['google.com mxx', { kind: 'search' }],
  ])('%s', (q, want) => {
    expect(classifyQuery(q)).toEqual(want)
  })
})

describe('parseSuggestions', () => {
  const dns = {
    suggestion: '!redirect https://toolbox.googleapps.com/apps/dig/?cache=0#MX/google.com',
    suggestType: 'ENTITY',
    suggestSubtypes: [512, 433],
    suggestDetail: { a: 'google.com 300 IN MX 10 smtp.google.com', t: 'google.com 300 IN MX 10 smtp.google.com', i: 'https://cdn.ip2location.com/assets/img/flags/us.png', dc: '#DE5833' },
    suggestRelevance: 1024,
  }
  const plain = { suggestion: 'denver weather radar', suggestType: 'QUERY', suggestDetail: {}, suggestRelevance: 600 }

  it('turns !redirect rows into links titled by the entity text', () => {
    const [r] = parseSuggestions([dns])
    expect(r).toMatchObject({ text: 'google.com 300 IN MX 10 smtp.google.com', href: 'https://toolbox.googleapps.com/apps/dig/?cache=0#MX/google.com', type: 'ENTITY' })
    expect(r!.annotation).toBeUndefined() // same as text → not repeated
    expect(r!.image).toBe('https://cdn.ip2location.com/assets/img/flags/us.png')
  })
  it('flattens nested arrays and sorts by relevance', () => {
    expect(parseSuggestions([[plain], [[dns]]]).map((r) => r.type)).toEqual(['ENTITY', 'QUERY'])
  })
  it('drops non-https images and redirect targets', () => {
    const r = parseSuggestions([{ ...dns, suggestion: '!redirect javascript:alert(1)', suggestDetail: { t: 'x', i: 'http://e.com/a.png' } }])
    expect(r[0]).toMatchObject({ text: 'x', href: undefined, image: undefined })
  })
  it('ignores junk, de-duplicates and caps the list', () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ suggestion: `q${i % 12}`, suggestRelevance: i }))
    const out = parseSuggestions([null, 3, 'x', { suggestion: 5 }, ...many], 8)
    expect(out).toHaveLength(8)
    expect(new Set(out.map((r) => r.text)).size).toBe(8)
    expect(parseSuggestions({ not: 'an array' })).toEqual([])
  })
})

describe('urls', () => {
  it('encodes the query for the engine and the proxy', () => {
    expect(searchUrl(' !gh a&b ')).toBe('https://search.emu.sh/search?q=!gh%20a%26b')
    expect(suggestEndpoint('a b')).toBe('/api/suggest?q=a%20b') // only q: other params would split the edge cache
  })
  it('truncates over-long queries before sending', () => {
    const q = decodeURIComponent(suggestEndpoint('x'.repeat(500)).split('q=')[1]!)
    expect(q).toHaveLength(MAX_QUERY)
  })
  it('never cuts an emoji in half at the limit (encodeURIComponent would throw)', () => {
    const s = 'x'.repeat(MAX_QUERY - 1) + '🦤🦤'
    expect(Array.from(clampQuery(s))).toHaveLength(MAX_QUERY)
    expect(clampQuery(s).endsWith('🦤')).toBe(true)
    expect(() => suggestEndpoint(s)).not.toThrow()
    expect(() => searchUrl(s)).not.toThrow()
  })
  it('replaces lone surrogates instead of throwing', () => {
    expect(clampQuery('a\uD83Eb')).toBe('a\uFFFDb')
    expect(() => suggestEndpoint('\uDD24')).not.toThrow()
  })
})
