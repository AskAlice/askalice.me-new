import type { DemoId, PostId, View } from '../store'
import { POSTS } from './content'

export const SITE = 'https://askalice.me'
export const SECTIONS = ['work', 'demos', 'services', 'writing', 'resume'] as const
export type Section = (typeof SECTIONS)[number]
export const DEMO_IDS: DemoId[] = ['search', 'geo', 'flex', 'midi', 'pcbs', 'pov']

export type Route = {
  view: View
  demo: DemoId | null
  post: PostId | null
  section: Section | null
}

export function pathFor(r: Route): string {
  switch (r.view) {
    case 'photos':
      return '/photography'
    case 'blog':
      return '/blog'
    case 'post': {
      const slug = POSTS.find((p) => p.id === r.post)?.slug
      return slug ? `/blog/${slug}` : '/blog'
    }
    case 'demo':
      return r.demo ? `/demos/${r.demo}` : '/demos'
    case 'home':
      return r.section ? `/${r.section}` : '/'
    default: {
      const _x: never = r.view
      return _x
    }
  }
}

export function parsePath(pathname: string): Route {
  const p = pathname.replace(/\/+$/, '') || '/'
  if (p === '/photography') return { view: 'photos', demo: null, post: null, section: null }
  if (p === '/blog') return { view: 'blog', demo: null, post: null, section: null }
  const blog = /^\/blog\/([^/]+)$/.exec(p)
  if (blog) {
    const post = POSTS.find((x) => x.slug === blog[1])
    return post
      ? { view: 'post', demo: null, post: post.id, section: null }
      : { view: 'blog', demo: null, post: null, section: null }
  }
  const demo = /^\/demos\/([^/]+)$/.exec(p)
  if (demo && DEMO_IDS.includes(demo[1] as DemoId)) {
    return { view: 'demo', demo: demo[1] as DemoId, post: null, section: null }
  }
  const sec = p.slice(1)
  if (SECTIONS.includes(sec as Section)) {
    return { view: 'home', demo: null, post: null, section: sec as Section }
  }
  return { view: 'home', demo: null, post: null, section: null }
}

export function absUrl(path: string): string {
  return `${SITE}${path === '/' ? '/' : path}`
}

function assertRoutes() {
  const cases: [string, Route][] = [
    ['/', { view: 'home', demo: null, post: null, section: null }],
    ['/work', { view: 'home', demo: null, post: null, section: 'work' }],
    ['/services', { view: 'home', demo: null, post: null, section: 'services' }],
    ['/photography', { view: 'photos', demo: null, post: null, section: null }],
    ['/blog', { view: 'blog', demo: null, post: null, section: null }],
    ['/blog/animating-flexbox-children', { view: 'post', demo: null, post: 1, section: null }],
    ['/demos/flex', { view: 'demo', demo: 'flex', post: null, section: null }],
  ]
  for (const [path, want] of cases) {
    const got = parsePath(path)
    if (JSON.stringify(got) !== JSON.stringify(want) || pathFor(got) !== path) {
      throw new Error(`routes: ${path}`)
    }
  }
}

// optional chain: this module is also loaded by vite.config.ts (via lib/schema), where import.meta.env is undefined
if (import.meta.env?.DEV) assertRoutes()
