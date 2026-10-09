// schema.org JSON-LD, built from the same content the page renders so the two
// can't drift. Used at runtime by <Seo> (per-route graphs) and at build time by
// the jsonLd() Vite plugin, which bakes the home graph into index.html for
// crawlers that don't run JavaScript.
import { GRAVATAR, LINKS, ROLES, SERVICES } from './content'
import { SITE } from './routes'

export const OG_IMG = `${GRAVATAR}?s=512&d=identicon`
export const HOME_TITLE = 'Alice Knag — pretty things with JavaScript'
const PERSON_ID = `${SITE}/#person`

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
    url: `${SITE}/services`,
    itemListElement: SERVICES.map((s) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        '@id': `${SITE}/services#${s.id}`,
        name: s.title,
        description: s.blurb,
        provider: { '@id': PERSON_ID },
        areaServed: ['Denver metro, Colorado', 'Remote'],
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
      { '@type': 'WebSite', '@id': `${SITE}/#site`, name: 'Alice Knag', url: SITE, publisher: { '@id': PERSON_ID } },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE}/#home`,
        url: SITE,
        name: HOME_TITLE,
        about: { '@id': PERSON_ID },
        isPartOf: { '@id': `${SITE}/#site` },
      },
    ],
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
