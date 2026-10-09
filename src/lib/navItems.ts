import type { View } from '../store'

export interface NavItem {
  href: string
  label: string
  /** home-page section id this item scrolls to */
  section?: string
  /** sub-views that belong to this item (e.g. a blog post lights up "Writing") */
  views?: View[]
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/work', label: 'Work', section: 'work' },
  { href: '/demos', label: 'Demos', section: 'demos', views: ['demo'] },
  { href: '/services', label: 'Services', section: 'services' },
  { href: '/photography', label: 'Photography', views: ['photos'] },
  { href: '/writing', label: 'Writing', section: 'writing', views: ['blog', 'post'] },
  { href: '/resume', label: 'Résumé', section: 'resume' },
]

export const NAV_SECTION_IDS: readonly string[] = NAV_ITEMS.flatMap((i) => (i.section ? [i.section] : []))

/**
 * The href of the nav item that is "current": a matching sub-view wins;
 * on the home view, the section under the viewport midline; otherwise none.
 */
export function currentNavHref(view: View, section: string | null): string | null {
  const byView = NAV_ITEMS.find((i) => i.views?.includes(view))
  if (byView) return byView.href
  if (view !== 'home' || !section) return null
  return NAV_ITEMS.find((i) => i.section === section)?.href ?? null
}
