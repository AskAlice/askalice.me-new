import { useSite } from '../store'
import { DEMOS } from '../lib/content'
import { ShaderPlane } from '../components/gl/ShaderPlane'
import { GeoCanvas } from '../components/demos/GeoCanvas'
import { FlexChips } from '../components/demos/FlexChips'
import { FIELD_FRAG } from '../shaders/field.frag'

export function DemoDetail() {
  const go = useSite((s) => s.go)
  const activeDemo = useSite((s) => s.activeDemo) ?? 'shader'
  const demo = DEMOS[activeDemo]
  return (
    <div className="max-w-1000px mx-auto px-[clamp(18px,5vw,56px)] pt-110px pb-90px min-h-100vh">
      <span onClick={() => go('home')} className="font-mono text-13px text-muted cursor-pointer">
        ← back home
      </span>
      <h1 className="text-[clamp(30px,5vw,52px)] font-700 tracking-[-0.025em] mt-28px mb-10px">{demo.title}</h1>
      <p className="text-muted text-17px max-w-640px mt-0 mb-30px leading-[1.55]">{demo.desc}</p>

      {activeDemo === 'shader' && (
        <div className="border border-white/12 rounded-16px overflow-hidden h-[clamp(320px,55vh,560px)] relative bg-[#0e0c14]">
          <ShaderPlane frag={FIELD_FRAG} maxDpr={1.75} />
          <span className="absolute bottom-16px left-18px font-mono text-12px text-white/65 pointer-events-none">
            move your mouse — the field follows
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
        <a
          href={demo.repo}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-12px text-pink border border-flamingo/30 rounded-7px px-11px py-6px"
        >
          view source ↗
        </a>
      </div>
    </div>
  )
}
