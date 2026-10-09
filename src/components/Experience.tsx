import { useState, type ReactNode } from 'react'
import { ROLES, type Role } from '../lib/content'
import { CalendarIcon, PinIcon, CpuIcon, PlayBadgeIcon, CodeIcon, PencilIcon } from './icons'

const BADGES: ReactNode[] = [
  <span key="cam" className="font-700 text-15px">CAM</span>,
  <CpuIcon key="cpu" />,
  <span key="p" className="font-700 text-22px">P</span>,
  <PlayBadgeIcon key="ps" />,
  <CodeIcon key="code" />,
  <PencilIcon key="pencil" />,
]

/**
 * Native <details> disclosure for a role's extra highlights (and optional
 * screen capture). From the AI Studio draft's expandable timeline, but
 * JS-free: the text is in the DOM for crawlers and works without hydration.
 */
function RoleDetails({ role }: { role: Omit<Role, 'badge'> }) {
  // the video only mounts (and downloads) while open — autoPlay would otherwise override preload="none"
  const [open, setOpen] = useState(false)
  if (!role.highlights?.length && !role.media) return null
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <details className="disclosure mt-14px max-w-640px" onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary className="inline-flex items-center gap-8px cursor-pointer font-mono text-12.5px text-pink select-none">
        <span aria-hidden="true" className="disclosure-icon inline-block transition-transform duration-150">+</span>
        {[role.highlights?.length ? `${role.highlights.length} highlights` : '', role.media ? 'screen capture' : '']
          .filter(Boolean)
          .join(' · ')}
      </summary>
      {role.highlights && (
        <ul role="list" className="list-none p-0 mt-14px mb-0 flex flex-col gap-9px">
          {role.highlights.map((h) => (
            <li key={h} className="grid grid-cols-[auto_1fr] gap-11px text-body text-15px leading-[1.55]">
              <span aria-hidden="true" className="w-6px h-6px rounded-full mt-9px" style={{ background: role.companyColor }} />
              {h}
            </li>
          ))}
        </ul>
      )}
      {role.media && open && (
        <figure className="m-0 mt-18px">
          <video
            className="w-full h-auto block rounded-12px border border-white/10 bg-[#0e0c14]"
            poster={role.media.poster}
            aria-label={role.media.alt}
            width={1114}
            height={760}
            muted
            loop
            playsInline
            preload="none"
            autoPlay={!reduced}
            controls={reduced}
          >
            <source src={role.media.webm} type="video/webm" />
            <source src={role.media.mp4} type="video/mp4" />
          </video>
          <figcaption className="font-mono text-11.5px text-faint mt-9px">{role.media.caption}</figcaption>
        </figure>
      )}
    </details>
  )
}

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
              <RoleDetails role={r} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
