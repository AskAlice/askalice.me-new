import { useEffect, useState } from 'react'

/**
 * Scroll-spy: returns the id of whichever of `ids` currently crosses the
 * viewport's horizontal midline, or null between sections. Uses one
 * IntersectionObserver with a 1%-tall band instead of a scroll listener (the
 * AI Studio draft recomputed offsets on every scroll event).
 * `ids` must be referentially stable (a module-level constant).
 */
export function useActiveSection(ids: readonly string[], enabled: boolean): string | null {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    if (!enabled) {
      setActive(null)
      return
    }
    const els = ids.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => e !== null)
    if (els.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        // clear first, then set, so a hand-off between adjacent sections lands on the new one
        for (const e of entries) if (!e.isIntersecting) setActive((cur) => (cur === e.target.id ? null : cur))
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-49% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids, enabled])
  return active
}
