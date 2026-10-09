import { useEffect, useRef, useState } from 'react'
import { STATS } from '../lib/content'
import { countAt } from '../lib/countUp'

const DURATION_MS = 1300

/**
 * Animates 0 → target once the element first scrolls into view. Renders the
 * final value until then, so crawlers, no-JS snapshots and reduced-motion
 * users always get the real number; only below-the-fold mounts animate.
 */
function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [n, setN] = useState(target)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (el.getBoundingClientRect().top < window.innerHeight) return // already visible: don't flash a reset
    let raf = 0
    setN(0)
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = (now - t0) / DURATION_MS
        setN(countAt(target, t))
        if (t < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      setN(target)
    }
  }, [target])
  return (
    <span ref={ref} className="tabular-nums">
      {n}
    </span>
  )
}

/** "At a glance" strip between the hero and About — numbers lifted from the experience section. */
export function StatsBar() {
  return (
    <section aria-label="At a glance" className="section-pad pt-[clamp(48px,7vw,88px)]">
      <ul className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-14px m-0 p-0 list-none">
        {STATS.map((s) => (
          <li key={s.label} className="relative overflow-hidden border border-white/9 rounded-16px bg-card px-22px py-20px">
            <span aria-hidden="true" className="absolute top-0 left-22px w-28px h-2px" style={{ background: s.color }} />
            <span className="sr-only">{`${s.prefix ?? ''}${s.value}${s.suffix} ${s.label}`}</span>
            <div aria-hidden="true" className="text-[clamp(34px,4vw,44px)] font-700 tracking-[-0.03em] leading-none text-bright">
              {s.prefix}
              <CountUp target={s.value} />
              <span style={{ color: s.color }}>{s.suffix}</span>
            </div>
            <div aria-hidden="true" className="mt-10px text-15px font-600 text-bright">{s.label}</div>
            <div className="mt-4px font-mono text-11.5px text-faint leading-[1.5]">{s.source}</div>
          </li>
        ))}
      </ul>
    </section>
  )
}
