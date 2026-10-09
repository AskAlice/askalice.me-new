import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ROLES, SERVICES } from './content'
import { homeGraph, jsonLdScript, offerCatalogLd, personLd } from './schema'

describe('personLd', () => {
  const p = personLd()
  it('is a Person with a stable @id', () => {
    expect(p['@type']).toBe('Person')
    expect(p['@id']).toBe('https://askalice.me/#person')
  })
  it('derives employers from current, non-independent ROLES', () => {
    const want = ROLES.filter((r) => r.current && r.company !== 'Independent').map((r) => r.company)
    expect(p.worksFor.map((o) => o.name)).toEqual(want)
    expect(want).toContain('Peklava, LLC')
  })
  it('lists each skill tag once', () => {
    expect(new Set(p.knowsAbout).size).toBe(p.knowsAbout.length)
    expect(p.knowsAbout).toContain('Kubernetes')
  })
})

describe('offerCatalogLd', () => {
  const c = offerCatalogLd()
  it('has one Offer → Service per Services card, provided by the Person', () => {
    expect(c.itemListElement).toHaveLength(SERVICES.length)
    for (const [i, o] of c.itemListElement.entries()) {
      expect(o['@type']).toBe('Offer')
      expect(o.itemOffered['@type']).toBe('Service')
      expect(o.itemOffered.name).toBe(SERVICES[i]!.title)
      expect(o.itemOffered.provider).toEqual({ '@id': 'https://askalice.me/#person' })
    }
  })
  it('gives every service a unique fragment id', () => {
    const ids = c.itemListElement.map((o) => o.itemOffered['@id'])
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('homeGraph', () => {
  it('contains Person, WebSite and ProfilePage', () => {
    expect(homeGraph()['@graph'].map((n) => n['@type'])).toEqual(['Person', 'WebSite', 'ProfilePage'])
  })
})

describe('jsonLdScript', () => {
  it('escapes "<" so data cannot close the script tag', () => {
    const html = jsonLdScript({ x: '</script><script>alert(1)</script>' })
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    expect(JSON.parse(html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''))).toEqual({
      x: '</script><script>alert(1)</script>',
    })
  })
})

describe('index.html', () => {
  it('keeps the placeholder the build plugin fills (and no hand-written JSON-LD copy)', () => {
    const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8')
    expect(html).toContain('<!--jsonld-->')
    expect(html).not.toContain('application/ld+json')
  })
})
