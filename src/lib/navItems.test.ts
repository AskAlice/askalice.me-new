import { describe, expect, it } from 'vitest'
import { NAV_ITEMS, NAV_SECTION_IDS, currentNavHref } from './navItems'
import { parsePath } from './routes'

describe('currentNavHref', () => {
  it('maps sub-views to their parent item', () => {
    expect(currentNavHref('post', null)).toBe('/writing')
    expect(currentNavHref('blog', 'work')).toBe('/writing')
    expect(currentNavHref('demo', null)).toBe('/demos')
    expect(currentNavHref('photos', null)).toBe('/photography')
  })
  it('uses the scroll-spied section on home, and nothing between sections', () => {
    expect(currentNavHref('home', 'resume')).toBe('/resume')
    expect(currentNavHref('home', null)).toBeNull()
    expect(currentNavHref('home', 'not-a-section')).toBeNull()
  })
})

describe('NAV_ITEMS', () => {
  it('every href is a route the router understands (no dead links for crawlers)', () => {
    for (const i of NAV_ITEMS) {
      const r = parsePath(i.href)
      const ok = i.section ? r.section === i.section : r.view !== 'home'
      expect(ok, i.href).toBe(true)
    }
  })
  it('exposes only the section-backed ids to the scroll-spy', () => {
    expect(NAV_SECTION_IDS).toEqual(['work', 'demos', 'services', 'writing', 'resume'])
  })
})
