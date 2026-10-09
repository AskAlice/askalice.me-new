// schema.org JSON-LD, built from the same content the page renders so the two
// can't drift. Used at runtime by <Seo> (per-route graphs) and at build time by
// the jsonLd() Vite plugin, which bakes the home graph into index.html for
// crawlers that don't run JavaScript.
import { GRAVATAR, LINKS, ROLES, SERVICES, TRACK } from './content'
import { SITE } from './routes'

export const OG_IMG = `${GRAVATAR}?s=512&d=identicon`
export const HOME_TITLE = 'Alice Knag — pretty things with JavaScript'
const PERSON_ID = `${SITE}/#person`
const EMU_ID = `${SITE}/#emu-llc`

/** Emu LLC, Alice's company — the contracting entity for the Services offers. */
export function emuLlcLd() {
  return { '@type': 'Organization', '@id': EMU_ID, name: 'Emu LLC', url: `${SITE}/services` }
}

// From the résumé (ResumeSection / scripts/build-resume.ts), not ROLES.
const SCHOOLS = ['University of Colorado Boulder', 'University of Arizona']

/** Compact author/provider reference — enough for Google's author markup. */
export function personRef() {
  return { '@type': 'Person', '@id': PERSON_ID, name: 'Alice Knag', url: SITE }
}

/** The OfferCatalog behind the Services section: one Offer → Service per card. */
export function offerCatalogLd() {
  return {
    '@type': 'OfferCatalog',
    name: 'Contract services',
    url: `${SITE}/#services`, // /services canonicalises to the home page
    itemListElement: SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        '@id': `${SITE}/#service-${s.id}`, // matches the card's DOM id
        name: s.title,
        description: s.blurb,
        provider: { '@id': EMU_ID },
        areaServed: { '@type': 'AdministrativeArea', name: 'Denver metropolitan area, Colorado' },
      },
    })),
  }
}

/** Full Person node: identity, current employers and skills derived from ROLES, plus services. */
export function personLd() {
  const current = ROLES.filter((r) => r.current && r.company !== 'Independent')
  const skills = [...new Set(ROLES.flatMap((r) => r.tags))]
  return {
    ...personRef(),
    email: LINKS.email,
    image: OG_IMG,
    jobTitle: 'Software Engineer',
    address: { '@type': 'PostalAddress', addressLocality: 'Arvada', addressRegion: 'CO', addressCountry: 'US' },
    sameAs: [LINKS.github, LINKS.linkedin],
    worksFor: current.map((r) => ({ '@type': 'Organization', name: r.company })),
    alumniOf: SCHOOLS.map((name) => ({ '@type': 'CollegeOrUniversity', name })),
    knowsAbout: skills,
    hasOfferCatalog: offerCatalogLd(),
  }
}

/** Graph for the home page (and every home section such as /work or /services). */
export function homeGraph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      personLd(),
      emuLlcLd(),
      { '@type': 'WebSite', '@id': `${SITE}/#site`, name: 'Alice Knag', url: SITE, publisher: { '@id': PERSON_ID } },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE}/#home`,
        url: SITE,
        name: HOME_TITLE,
        mainEntity: { '@id': PERSON_ID }, // Google's ProfilePage markup keys on mainEntity
        isPartOf: { '@id': `${SITE}/#site` },
      },
    ],
  }
}

/** ISO 8601 duration (PT#M#S) for a length in seconds. */
export function isoDuration(secs: number): string {
  const s = Math.round(secs)
  return `PT${Math.floor(s / 60)}M${s % 60}S`
}

/** MusicRecording for /demos/music: Alice's track, with the MP3 as its AudioObject. */
export function musicRecordingLd(pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: TRACK.name,
    url: pageUrl,
    duration: isoDuration(TRACK.durationSec),
    byArtist: personRef(),
    image: `${SITE}${TRACK.image}`,
    audio: { '@type': 'AudioObject', contentUrl: `${SITE}${TRACK.audioUrl}`, encodingFormat: 'audio/mpeg', duration: isoDuration(TRACK.durationSec) },
  }
}

/**
 * Serialise JSON-LD for inline <script>. Escapes `<` so no string in the data
 * can close the script element early.
 */
export function jsonLdScript(data: unknown): string {
  const body = JSON.stringify(data).replace(/</g, '\\u003c')
  return `<script type="application/ld+json" id="jsonld">${body}</script>`
}
