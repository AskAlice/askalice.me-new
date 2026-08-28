import type { MouseEvent, ReactNode } from 'react'
import { useSite } from '../store'

export function AppLink({
  href,
  className,
  children,
  ariaLabel,
}: {
  href: string
  className?: string
  children: ReactNode
  ariaLabel?: string
}) {
  const goPath = useSite((s) => s.goPath)
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    goPath(href)
  }
  return (
    <a href={href} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </a>
  )
}
