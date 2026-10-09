import { LINKS, SERVICES } from '../lib/content'
import { AppLink } from './AppLink'
import { ArrowRightIcon, MailIcon } from './icons'

const MAILTO = `mailto:${LINKS.email}?subject=${encodeURIComponent('Project inquiry via askalice.me')}`

/**
 * "What I can do for you" grid. Layout idea from the AI Studio draft's
 * services bento; every card links to the part of the site that backs it up,
 * and the CTA is a plain mailto (the draft's contact form never sent anything).
 * Mirrored in schema.org as the Person's OfferCatalog (see lib/schema.ts).
 */
export function Services() {
  return (
    <section id="services" className="section-pad py-[clamp(60px,9vw,120px)] scroll-mt-80px">
      <div className="eyebrow mb-24px">
        <span className="eyebrow-rule" />04 / services
      </div>
      <div className="flex items-end justify-between gap-24px flex-wrap mb-40px">
        <div>
          <h2 className="text-[clamp(28px,4vw,46px)] leading-[1.1] font-600 tracking-[-0.02em] mt-0 mb-14px">
            Hire me for a project.
          </h2>
          <p className="text-muted text-17px max-w-560px m-0 leading-[1.55]">
            Contract and freelance work, based in Arvada, Colorado. Denver metro or remote.
          </p>
        </div>
        <a
          href={MAILTO}
          className="flex items-center gap-9px bg-flamingo text-ink font-600 text-15px px-22px py-13px rounded-full whitespace-nowrap shadow-[0_10px_28px_rgba(245,112,138,0.4)] transition-transform duration-150 hover:-translate-y-2px"
        >
          <MailIcon />
          Start a conversation
        </a>
      </div>
      <ul role="list" className="grid grid-cols-2 max-md:grid-cols-1 gap-16px list-none p-0 m-0">
        {SERVICES.map((s) => (
          <li key={s.id} id={`service-${s.id}`} className="flex flex-col border border-white/10 rounded-18px bg-gradient-to-b from-card to-carddeep p-26px">
            <span aria-hidden="true" className="w-34px h-3px rounded-full mb-20px" style={{ background: s.color }} />
            <h3 className="text-21px font-600 m-0">{s.title}</h3>
            <p className="text-muted text-15px leading-[1.6] mt-10px mb-18px">{s.blurb}</p>
            <ul role="list" className="list-none p-0 m-0 flex flex-col gap-8px mb-22px">
              {s.deliverables.map((d) => (
                <li key={d} className="grid grid-cols-[auto_1fr] gap-10px text-14.5px text-body leading-[1.5]">
                  <span aria-hidden="true" className="font-mono" style={{ color: s.color }}>→</span>
                  {d}
                </li>
              ))}
            </ul>
            <AppLink href={s.proof.href} className="mt-auto inline-flex items-center gap-7px font-mono text-12.5px text-pink">
              see the {s.proof.label} <ArrowRightIcon size={14} />
            </AppLink>
          </li>
        ))}
      </ul>
    </section>
  )
}
