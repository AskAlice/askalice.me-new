import { lazy, Suspense } from 'react'
import { useSite } from '../store'
import { DEMOS } from '../lib/content'
import { GeoCanvas } from '../components/demos/GeoCanvas'
import { FlexChips } from '../components/demos/FlexChips'
import { AppLink } from '../components/AppLink'

// Each interactive demo is its own chunk, fetched only on its page
// (the music one also carries the track analysis JSON).
const MusicDemo = lazy(() => import('../components/demos/MusicDemo'))
const PcbSlideshow = lazy(() => import('../components/demos/PcbSlideshow').then((m) => ({ default: m.PcbSlideshow })))
const OmniboxDemo = lazy(() => import('../components/demos/OmniboxDemo').then((m) => ({ default: m.OmniboxDemo })))

const Placeholder = ({ h }: { h: string }) => <div className={`${h} border border-white/12 rounded-18px bg-[#121018]`} aria-busy="true" />

export function DemoDetail() {
  const activeDemo = useSite((s) => s.activeDemo) ?? 'search'
  const demo = DEMOS[activeDemo]
  return (
    <div className="max-w-1000px mx-auto px-[clamp(18px,5vw,56px)] pt-110px pb-90px min-h-100vh">
      <AppLink href="/demos" className="font-mono text-13px text-muted">
        ← demos
      </AppLink>
      <h1 className="text-[clamp(30px,5vw,52px)] font-700 tracking-[-0.025em] mt-28px mb-10px">{demo.title}</h1>
      <p className="text-muted text-17px max-w-640px mt-0 mb-30px leading-[1.55]">{demo.desc}</p>

      {activeDemo === 'search' && (
        <div className="mb-22px">
          <Suspense fallback={<Placeholder h="h-360px" />}>
            <OmniboxDemo />
          </Suspense>
        </div>
      )}
      {activeDemo === 'pcbs' && (
        <div className="mb-22px">
          <Suspense fallback={<Placeholder h="h-560px" />}>
            <PcbSlideshow />
          </Suspense>
          <p className="font-mono text-11.5px text-faint mt-10px mb-0">
            Boards brainstormed and generated with AI tooling (Kimi), rendered with KiCad’s raytracer. Specs from the repo README. No board has been through a physical run yet.
          </p>
        </div>
      )}
      {activeDemo === 'music' && (
        <Suspense fallback={<Placeholder h="h-420px" />}>
          <MusicDemo />
        </Suspense>
      )}
      {demo.features && activeDemo !== 'pcbs' && (
        <div className="flex flex-col gap-22px mb-8px">
          {demo.features.map((f) => (
            <div key={f.title} className="border border-white/12 rounded-16px overflow-hidden bg-card">
              <div className="p-20px">
                <h2 className="text-16px font-600 m-0">{f.title}</h2>
                <p className="text-muted text-14px leading-[1.55] mt-8px mb-0">{f.desc}</p>
              </div>
              {f.img && (
                <img src={f.img} alt={f.title} className="w-full block border-t border-white/8" />
              )}
            </div>
          ))}
        </div>
      )}
      {(activeDemo === 'midi' || activeDemo === 'pov') && demo.embed && (
        <div className="border border-white/12 rounded-16px overflow-hidden relative bg-[#0e0c14]">
          <iframe
            src={demo.embed}
            title={demo.title}
            className={`w-full border-0 block ${activeDemo === 'pov' ? 'h-[clamp(460px,78vh,860px)]' : 'h-[clamp(320px,55vh,560px)]'}`}
            allow="autoplay"
            loading="lazy"
          />
          <span className="absolute bottom-16px left-18px font-mono text-12px text-white/70 pointer-events-none">
            {demo.note ?? 'Click the demo to play sound.'}
          </span>
        </div>
      )}
      {activeDemo === 'geo' && (
        <div className="border border-white/12 rounded-16px overflow-hidden h-[clamp(320px,55vh,560px)] relative bg-[#0e0c14]">
          <GeoCanvas />
          <span className="absolute bottom-16px left-18px font-mono text-12px text-white/55 pointer-events-none">
            trails come from one translucent rect per frame
          </span>
        </div>
      )}
      {activeDemo === 'flex' && (
        <div className="border border-white/12 rounded-16px h-[clamp(320px,55vh,560px)] flex items-center justify-center p-40px bg-ink [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:32px_32px]">
          <div className="text-center">
            <FlexChips large />
            <div className="font-mono text-12.5px text-faint mt-28px">tap any chip to toggle — siblings reflow with easing</div>
          </div>
        </div>
      )}

      <div className="flex gap-10px flex-wrap mt-26px">
        <span className="font-mono text-12px text-body border border-white/12 rounded-7px px-11px py-6px">{demo.tech}</span>
        {demo.live && (
          <a
            href={demo.live}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-12px text-sky border border-sky/30 rounded-7px px-11px py-6px"
          >
            {activeDemo === 'pov' ? 'full screen ↗' : activeDemo === 'music' ? 'MP3 ↗' : 'live site ↗'}
          </a>
        )}
        {demo.repo && (
          <a
            href={demo.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-12px text-pink border border-flamingo/30 rounded-7px px-11px py-6px"
          >
            view source ↗
          </a>
        )}
      </div>
    </div>
  )
}
