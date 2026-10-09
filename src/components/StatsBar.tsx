import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { STATS } from '../lib/content'

type Phase = 'idle' | 'armed' | 'run'

/**
 * Count-up drawn entirely by CSS (see `.count` in styles.css): the digits are
 * a ::after counter driven by an animatable `--n`, so the DOM text never holds
 * an intermediate value — crawlers and screen readers read the real figure from
 * the sr-only line. JS only flips a data attribute:
 *   idle  → shows the target (default; also for reduced motion)
 *   armed → drops to 0 while the strip is still within one screen below the viewport
 *   run   → transitions 0 → target once 40% visible
 */
function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let armed = false
    const arm = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting) return
        arm.disconnect()
        if (e.boundingClientRect.top >= window.innerHeight) {
          armed = true // still off-screen below: reset without a visible flash
          setPhase('armed')
        }
      },
      { rootMargin: '0px 0px 100% 0px' },
    )
    const play = new IntersectionObserver(
      ([e]) => {
        if (!e?.isIntersecting || !armed) return
        play.disconnect()
        // next frame, so the browser has painted 0 before the transition starts
        requestAnimationFrame(() => setPhase('run'))
      },
      { threshold: 0.4 },
    )
    arm.observe(el)
    play.observe(el)
    return () => {
      arm.disconnect()
      play.disconnect()
    }
  }, [])
  return <span ref={ref} className="count tabular-nums" data-phase={phase} style={{ '--target': target } as CSSProperties} />
}

/** "At a glance" strip between the hero and About — numbers lifted from the experience section. */
export function StatsBar() {
  return (
    <section aria-label="At a glance" className="section-pad pt-[clamp(48px,7vw,88px)]">
      <ul role="list" className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-14px m-0 p-0 list-none">
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
