import type { MouseEvent, ReactNode } from 'react'
import { useSite } from '../store'

/**
 * Real <a href> (crawlable, middle-clickable) that routes in-app via the
 * History API on a plain left click. `onNavigate` runs before in-app routing,
 * e.g. to close the mobile menu.
 */
export function AppLink({
  href,
  className,
  children,
  ariaLabel,
  ariaCurrent,
  onNavigate,
}: {
  href: string
  className?: string
  children: ReactNode
  ariaLabel?: string
  ariaCurrent?: 'page' | 'location'
  onNavigate?: () => void
}) {
  const goPath = useSite((s) => s.goPath)
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    onNavigate?.()
    goPath(href)
  }
  return (
    <a href={href} className={className} onClick={onClick} aria-label={ariaLabel} aria-current={ariaCurrent}>
      {children}
    </a>
  )
}
