import { useEffect } from 'react'
import { useSite } from '../store'
import { DEMOS, GRAVATAR, LINKS, POSTS } from '../lib/content'
import { SITE, absUrl, pathFor } from '../lib/routes'

const DESC =
  'Front-end-leaning full-stack engineer in Arvada, CO. Portfolio, live WebGL demos, writing, and résumé.'
const OG_IMG = `${GRAVATAR}?s=512&d=identicon`

function upsert(sel: string, tag: 'meta' | 'link', attrs: Record<string, string>) {
  let el = document.head.querySelector(sel) as HTMLElement | null
  if (!el) {
    el = document.createElement(tag)
    document.head.appendChild(el)
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
}

function setJsonLd(data: unknown) {
  let el = document.getElementById('jsonld') as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = 'jsonld'
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function person() {
  return {
    '@type': 'Person',
    '@id': `${SITE}/#person`,
    name: 'Alice Knag',
    url: SITE,
    email: LINKS.email,
    image: OG_IMG,
    jobTitle: 'Software Engineer',
    address: { '@type': 'PostalAddress', addressLocality: 'Arvada', addressRegion: 'CO', addressCountry: 'US' },
    sameAs: [LINKS.github, LINKS.linkedin],
  }
}

export function Seo() {
  const view = useSite((s) => s.view)
  const activePost = useSite((s) => s.activePost)
  const activeDemo = useSite((s) => s.activeDemo)
  const post = POSTS.find((p) => p.id === activePost)
  const demo = activeDemo ? DEMOS[activeDemo] : null

  useEffect(() => {
    const route = { view, demo: activeDemo, post: activePost, section: null }
    const path = pathFor(route)
    const url = absUrl(path)
    const canonical = view === 'home' ? absUrl('/') : url

    let title = 'Alice Knag — pretty things with JavaScript'
    let description = DESC
    let type = 'website'
    let ld: unknown = {
      '@context': 'https://schema.org',
      '@graph': [
        person(),
        { '@type': 'WebSite', '@id': `${SITE}/#site`, name: 'Alice Knag', url: SITE, publisher: { '@id': `${SITE}/#person` } },
        { '@type': 'ProfilePage', '@id': `${SITE}/#home`, url: SITE, name: title, about: { '@id': `${SITE}/#person` }, isPartOf: { '@id': `${SITE}/#site` } },
      ],
    }

    if (view === 'blog') {
      title = 'Writing — Alice Knag'
      description = 'Notes from the workbench — front-end craft, WebGL, and the occasional self-driving car.'
      ld = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url,
        isPartOf: { '@id': `${SITE}/#site` },
        author: { '@id': `${SITE}/#person` },
      }
    } else if (view === 'post' && post) {
      title = `${post.title} — Alice Knag`
      description = post.excerpt
      type = 'article'
      ld = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.published,
        author: person(),
        url,
        image: OG_IMG,
        mainEntityOfPage: url,
      }
    } else if (view === 'photos') {
      title = 'Photography — Alice Knag'
      description = 'Off the keyboard — fire spinners, festivals, and the Front Range.'
      ld = {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: title,
        description,
        url,
        author: { '@id': `${SITE}/#person` },
      }
    } else if (view === 'demo' && demo && activeDemo) {
      title = `${demo.title} — Alice Knag`
      description = demo.desc
      ld = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: demo.title,
        description: demo.desc,
        codeRepository: demo.repo,
        url,
        author: { '@id': `${SITE}/#person` },
        programmingLanguage: demo.tech,
      }
    }

    document.title = title
    upsert('meta[name="description"]', 'meta', { name: 'description', content: description })
    upsert('link[rel="canonical"]', 'link', { rel: 'canonical', href: canonical })
    upsert('meta[property="og:title"]', 'meta', { property: 'og:title', content: title })
    upsert('meta[property="og:description"]', 'meta', { property: 'og:description', content: description })
    upsert('meta[property="og:url"]', 'meta', { property: 'og:url', content: canonical })
    upsert('meta[property="og:type"]', 'meta', { property: 'og:type', content: type })
    upsert('meta[property="og:image"]', 'meta', { property: 'og:image', content: OG_IMG })
    upsert('meta[name="twitter:card"]', 'meta', { name: 'twitter:card', content: 'summary' })
    upsert('meta[name="twitter:title"]', 'meta', { name: 'twitter:title', content: title })
    upsert('meta[name="twitter:description"]', 'meta', { name: 'twitter:description', content: description })
    setJsonLd(ld)
  }, [view, activePost, activeDemo, post, demo])

  return null
}
