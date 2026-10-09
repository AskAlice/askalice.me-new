import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { POSTS } from './content'
import { DEMO_IDS, SECTIONS, parsePath, pathFor } from './routes'

describe('parsePath ⇄ pathFor', () => {
  const paths = [
    '/',
    '/photography',
    '/blog',
    ...SECTIONS.map((s) => `/${s}`),
    ...DEMO_IDS.map((d) => `/demos/${d}`),
    ...POSTS.map((p) => `/blog/${p.slug}`),
  ]
  it.each(paths)('%s round-trips', (path) => {
    expect(pathFor(parsePath(path))).toBe(path)
  })
  it('ignores trailing slashes and falls back to home for unknown paths', () => {
    expect(parsePath('/services/').section).toBe('services')
    expect(parsePath('/nope')).toEqual({ view: 'home', demo: null, post: null, section: null })
    expect(parsePath('/blog/not-a-post').view).toBe('blog')
  })
})

describe('vercel.json', () => {
  // Every client route must be rewritten to index.html, otherwise Vercel sends
  // it to the legacy-droplet proxy and a deep link (or a crawler) gets the old site.
  const cfg = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')) as {
    rewrites: { source: string; destination: string }[]
  }
  const spa = cfg.rewrites.filter((r) => r.destination === '/index.html').map((r) => r.source)
  const top = spa.find((s) => s.startsWith('/(')) ?? ''
  const demos = spa.find((s) => s.startsWith('/demos/(')) ?? ''

  it.each([...SECTIONS, 'photography', 'blog'])('rewrites /%s to the SPA', (seg) => {
    expect(top.slice(2, -1).split('|')).toContain(seg)
  })
  it.each(DEMO_IDS)('rewrites /demos/%s to the SPA', (id) => {
    expect(demos.slice('/demos/('.length, -1).split('|')).toContain(id)
  })
  it('rewrites blog posts to the SPA', () => {
    expect(spa).toContain('/blog/:slug')
  })
})

describe('sitemap.xml', () => {
  // A route missing here is still reachable, but crawlers find it later (or never).
  const locs = [...readFileSync(new URL('../../public/sitemap.xml', import.meta.url), 'utf8').matchAll(/<loc>https:\/\/askalice\.me([^<]*)<\/loc>/g)].map((m) => m[1] || '/')
  it.each(POSTS.map((p) => p.slug))('lists /blog/%s', (slug) => {
    expect(locs).toContain(`/blog/${slug}`)
  })
  it.each(DEMO_IDS)('lists /demos/%s', (id) => {
    expect(locs).toContain(`/demos/${id}`)
  })
})
