import type { ReactNode } from 'react'
import { FLStudioLogo, PlayStationLogo, SectionLogo, UniversityOfArizonaLogo } from './Logos'

const ITEMS: { name: string; note: string; tag: string; logo: ReactNode; tint: string }[] = [
  {
    name: 'PlayStation',
    note: 'Software engineer, web platforms',
    tag: 'Sony Interactive · 2022–23',
    logo: <PlayStationLogo className="w-34px h-34px" />,
    tint: 'rgba(143,201,245,0.10)',
  },
  {
    name: 'Section.io',
    note: 'Full-stack and platform reliability',
    tag: 'Edge platform · 2019–21',
    logo: <SectionLogo className="w-34px h-34px" />,
    tint: 'rgba(179,164,247,0.10)',
  },
  {
    name: 'University of Arizona',
    note: 'Cyber Operations & Pre-Law',
    tag: 'Tucson, AZ · 2024',
    logo: <UniversityOfArizonaLogo className="w-34px h-34px" />,
    tint: 'rgba(245,112,138,0.10)',
  },
  {
    name: 'FL Studio',
    note: 'Music production',
    tag: 'Image-Line',
    logo: <FLStudioLogo className="w-34px h-34px" />,
    tint: 'rgba(255,212,126,0.10)',
  },
]

/**
 * "Where I've been" logo strip (AI Studio draft's AffiliationLogos), restyled
 * with the site tokens. Subtitles stick to what the résumé says.
 */
export function AffiliationLogos() {
  return (
    <section aria-label="Affiliations" className="section-pad pt-16px">
      <ul role="list" className="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-12px list-none p-0 m-0">
        {ITEMS.map((i) => (
          <li
            key={i.name}
            className="flex items-center gap-14px border border-white/9 rounded-14px px-16px py-14px"
            style={{ background: i.tint }}
          >
            <span className="shrink-0 p-6px rounded-11px bg-black/35 border border-white/10 flex">{i.logo}</span>
            <span className="min-w-0">
              <span className="block text-15px font-600 text-bright leading-[1.25]">{i.name}</span>
              <span className="block text-13px text-body leading-[1.35]">{i.note}</span>
              <span className="block font-mono text-10.5px text-faint mt-3px">{i.tag}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
