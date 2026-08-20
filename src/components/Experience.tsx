import type { ReactNode } from 'react'
import { ROLES } from '../lib/content'
import { CalendarIcon, PinIcon, PlayBadgeIcon, CodeIcon, PencilIcon } from './icons'

const BADGES: ReactNode[] = [
  <span key="p" className="font-700 text-22px">P</span>,
  <PlayBadgeIcon key="ps" />,
  <CodeIcon key="code" />,
  <PencilIcon key="pencil" />,
]

export function Experience() {
  return (
    <section id="work" className="section-pad py-[clamp(40px,7vw,90px)] scroll-mt-80px">
      <div className="eyebrow mb-24px">
        <span className="eyebrow-rule" />02 / experience
      </div>
      <h2 className="text-[clamp(28px,4vw,46px)] leading-[1.1] font-600 tracking-[-0.02em] mt-0 mb-44px">
        Where I've shipped.
      </h2>
      <div className="flex flex-col">
        {ROLES.map((r, i) => (
          <div
            key={r.company}
            className={`grid grid-cols-[auto_1fr] gap-20px py-26px border-t border-white/8 ${i === ROLES.length - 1 ? 'border-b' : ''}`}
          >
            <div
              className="w-54px h-54px rounded-15px flex items-center justify-center"
              style={{ background: r.badgeBg, color: r.companyColor }}
            >
              {BADGES[i]}
            </div>
            <div>
              <div className="flex items-baseline gap-11px flex-wrap mb-7px">
                <h3 className="text-21px font-600 m-0">{r.title}</h3>
                <span className="text-16px font-500" style={{ color: r.companyColor }}>{r.company}</span>
                {r.current && (
                  <span className="text-11px font-600 text-mint bg-mint/15 rounded-full px-9px py-3px">Current</span>
                )}
              </div>
              <div className="flex gap-16px flex-wrap mb-12px">
                <span className="flex items-center gap-6px text-13px text-faint"><CalendarIcon />{r.dates}</span>
                <span className="flex items-center gap-6px text-13px text-faint"><PinIcon />{r.location}</span>
              </div>
              <p className={`text-muted text-15.5px leading-[1.6] mt-0 max-w-640px ${r.tags.length ? 'mb-14px' : 'mb-0'}`}>
                {r.description}
              </p>
              {r.tags.length > 0 && (
                <div className="flex gap-7px flex-wrap">
                  {r.tags.map((t) => (
                    <span key={t} className="tech-chip">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
