import { GRAVATAR, LINKS } from '../lib/content'
import { PinIcon, CheckCircleIcon, MailIcon } from './icons'

export function About() {
  return (
    <section className="section-pad py-[clamp(70px,11vw,140px)]">
      <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] max-md:grid-cols-1 gap-[clamp(36px,6vw,80px)] items-start">
        <div>
          <div className="eyebrow mb-24px">
            <span className="eyebrow-rule" />01 / about
          </div>
          <h2 className="text-[clamp(28px,4vw,46px)] leading-[1.15] font-600 tracking-[-0.02em] mt-0 mb-28px">
            Raised by the internet.
          </h2>
          <p className="text-18px leading-[1.7] text-body mt-0 mb-20px">
            The first website I built was in 7th grade — a LAMP stack that let kids slip past the school's
            enterprise web filter to play Flash games. I've been making things on the web ever since.
          </p>
          <p className="text-18px leading-[1.7] text-body mt-0 mb-20px">
            Since then I've shipped full-stack products at <span className="text-bright">PlayStation</span> and{' '}
            <span className="text-bright">Section.io</span>, now engineer high-converting lead-gen systems at{' '}
            <span className="text-bright">Peklava</span>, and have run on-call as a platform reliability engineer.
            Full-stack range, with a real knack for aesthetics.
          </p>
          <p className="text-18px leading-[1.7] text-body m-0">
            These days I love <span className="text-pink">react-three-fiber, three.js, lottie, websockets, WebRTC</span>{' '}
            and openpilot — and I keep a free-time hand in{' '}
            <a href={LINKS.riseintime} target="_blank" rel="noreferrer" className="text-pink border-b border-flamingo/40">
              riseintime.com
            </a>
            .
          </p>
        </div>
        <div>
          <div className="relative w-full max-w-280px">
            <div className="absolute -inset-10px rounded-full blur-14px opacity-50 animate-[spinSlow_18s_linear_infinite] bg-[conic-gradient(from_180deg,rgb(245,112,138),rgb(241,122,178),rgb(184,92,71),rgb(223,100,136),rgb(246,149,57),rgb(245,112,138))]" />
            <img
              src={`${GRAVATAR}?s=480&d=identicon`}
              alt="Alice Knag"
              className="relative w-full aspect-square object-cover rounded-full border-2 border-white/12 block"
            />
          </div>
          <div className="flex flex-col mt-24px border border-white/9 rounded-14px overflow-hidden bg-card">
            <div className="flex items-center gap-11px px-16px py-13px border-b border-white/6">
              <PinIcon size={16} className="text-flamingo" />
              <span className="text-13.5px text-faint">based in</span>
              <span className="text-13.5px text-bright ml-auto">Arvada, CO</span>
            </div>
            <div className="flex items-center gap-11px px-16px py-13px border-b border-white/6">
              <CheckCircleIcon className="text-mint" />
              <span className="text-13.5px text-faint">status</span>
              <span className="text-13.5px text-mint ml-auto">open to work</span>
            </div>
            <a href={`mailto:${LINKS.email}`} className="flex items-center gap-11px px-16px py-13px">
              <MailIcon className="text-sky" />
              <span className="text-13.5px text-faint">email</span>
              <span className="text-13.5px text-bright ml-auto">{LINKS.email}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
