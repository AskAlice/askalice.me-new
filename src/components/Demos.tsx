import { useSite } from '../store'
import { GITHUB_CARDS } from '../lib/content'
import { FlexChips } from './demos/FlexChips'
import { GeoCanvas } from './demos/GeoCanvas'

export function Demos() {
  const go = useSite((s) => s.go)
  return (
    <section id="demos" className="max-w-1180px mx-auto px-[clamp(18px,5vw,56px)] py-[clamp(60px,9vw,120px)] scroll-mt-80px">
      <div className="eyebrow mb-24px">
        <span className="eyebrow-rule" />03 / live demos
      </div>
      <h2 className="text-[clamp(28px,4vw,46px)] leading-[1.1] font-600 tracking-[-0.02em] mt-0 mb-14px">
        Things running right here in the page.
      </h2>
      <p className="text-muted text-17px max-w-620px mt-0 mb-44px leading-[1.55]">
        No screenshots — every tile below is real, interactive code. Click one to open the full demo.
      </p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-18px mb-64px">
        {/* react-flex-animations */}
        <div className="border border-white/10 rounded-16px overflow-hidden bg-card flex flex-col">
          <div className="h-200px bg-ink [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] flex items-center justify-center p-18px overflow-hidden">
            <FlexChips />
          </div>
          <div className="p-20px">
            <div className="flex items-center justify-between gap-10px">
              <h3 className="text-18px font-600 m-0">react-flex-animations</h3>
              <span className="font-mono text-11px text-flamingo border border-flamingo/30 rounded-5px px-7px py-3px">TS</span>
            </div>
            <p className="text-muted text-14px leading-[1.55] mt-9px mb-16px">
              Tap a chip — watch the flexbox children collapse and reflow smoothly. My npm library, live.
            </p>
            <span onClick={() => go('demo', { demo: 'flex' })} className="font-mono text-12.5px text-pink cursor-pointer">
              open demo →
            </span>
          </div>
        </div>

        {/* Shader Field */}
        <div className="border border-white/10 rounded-16px overflow-hidden bg-card flex flex-col">
          <div
            onClick={() => go('demo', { demo: 'shader' })}
            className="h-200px cursor-pointer relative overflow-hidden bg-[radial-gradient(60%_80%_at_30%_30%,rgba(245,112,138,0.55),transparent_60%),radial-gradient(50%_60%_at_75%_70%,rgba(143,201,245,0.45),transparent_60%),#14111b]"
          >
            <div className="absolute inset-0 h-40% animate-[scan_3.5s_linear_infinite] bg-[linear-gradient(transparent,rgba(245,112,138,0.12)_50%,transparent)]" />
            <span className="absolute bottom-14px left-16px font-mono text-11px text-white/75">▶ click to run shader</span>
          </div>
          <div className="p-20px">
            <div className="flex items-center justify-between gap-10px">
              <h3 className="text-18px font-600 m-0">Shader Field</h3>
              <span className="font-mono text-11px text-sky border border-sky/30 rounded-5px px-7px py-3px">GLSL</span>
            </div>
            <p className="text-muted text-14px leading-[1.55] mt-9px mb-16px">
              A mouse-reactive WebGL fragment shader. Raw GL, no three.js — just math and a full-screen triangle.
            </p>
            <span onClick={() => go('demo', { demo: 'shader' })} className="font-mono text-12.5px text-pink cursor-pointer">
              open demo →
            </span>
          </div>
        </div>

        {/* Spin / Afterimage */}
        <div className="border border-white/10 rounded-16px overflow-hidden bg-card flex flex-col">
          <div onClick={() => go('demo', { demo: 'geo' })} className="h-200px cursor-pointer relative bg-[#14111b]">
            <GeoCanvas />
            <span className="absolute bottom-14px left-16px font-mono text-11px text-white/60">afterimage trails</span>
          </div>
          <div className="p-20px">
            <div className="flex items-center justify-between gap-10px">
              <h3 className="text-18px font-600 m-0">Spin / Afterimage</h3>
              <span className="font-mono text-11px text-lilac border border-lilac/30 rounded-5px px-7px py-3px">Canvas</span>
            </div>
            <p className="text-muted text-14px leading-[1.55] mt-9px mb-16px">
              Basic geometry arranged in fancy ways, trails from one translucent rect, auto-rotation set to a ridiculous value.
            </p>
            <span onClick={() => go('demo', { demo: 'geo' })} className="font-mono text-12.5px text-pink cursor-pointer">
              open demo →
            </span>
          </div>
        </div>
      </div>

      <h3 className="text-18px font-600 mt-0 mb-20px font-mono">// more on github</h3>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-14px">
        {GITHUB_CARDS.map((c) => (
          <a
            key={c.name}
            href={c.href}
            target="_blank"
            rel="noreferrer"
            className="border border-white/9 rounded-13px p-20px bg-pit transition-all duration-150 hover:border-flamingo/40 hover:-translate-y-2px"
          >
            <div className="flex justify-between items-center mb-12px">
              <span className="font-mono text-14px text-bright">{c.name}</span>
              <span className="text-ghost">↗</span>
            </div>
            <p className="text-muted text-13.5px leading-[1.5] mt-0 mb-14px">{c.desc}</p>
            <span className="font-mono text-11px" style={{ color: c.langColor }}>● {c.lang}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
