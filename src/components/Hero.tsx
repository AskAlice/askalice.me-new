import { useSite } from '../store'
import { LINKS } from '../lib/content'
import { ShaderPlane } from './gl/ShaderPlane'
import { ShaderEditor } from './ShaderEditor'
import { ArrowRightIcon, DownloadIcon } from './icons'

export function Hero() {
  const { warpSrc, showEditor, toggleEditor, scrollOrHome, setWarpErr } = useSite()
  return (
    <section className="relative min-h-100vh pt-66px px-[clamp(18px,5vw,56px)] overflow-hidden">
      <div className="absolute inset-0">
        <ShaderPlane frag={warpSrc} withWarp maxDpr={1.5} onErr={setWarpErr} />
        <div className="absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_0%,rgba(23,21,30,0)_26%,rgba(23,21,30,0.5)_72%,#17151e_100%)]" />
        <div className="relative h-100vh max-w-1080px mx-auto flex flex-col justify-center pb-70px">
          <div className="inline-flex items-center gap-9px bg-white/8 border border-white/16 rounded-full px-16px py-8px backdrop-blur-6px w-max mb-28px animate-[heroIn_.6s_ease_both]">
            <span className="font-mono text-12px text-rose">domain-warped fbm · 6 octaves · live GLSL</span>
          </div>
          <h1 className="text-[clamp(48px,9vw,124px)] leading-[0.92] font-700 tracking-[-0.045em] m-0 [text-shadow:0_4px_50px_rgba(0,0,0,0.5)] animate-[heroIn_.7s_ease_.05s_both]">
            Alice Knag
          </h1>
          <p className="text-[clamp(19px,2.5vw,31px)] text-[#f3eef8] max-w-660px mt-26px mb-0 leading-[1.35] [text-shadow:0_2px_22px_rgba(0,0,0,0.45)] animate-[heroIn_.7s_ease_.14s_both]">
            Front-end-leaning full-stack engineer. I make{' '}
            <span className="text-white font-600">pretty things with JavaScript.</span>
          </p>
          <div className="flex gap-13px mt-38px flex-wrap animate-[heroIn_.7s_ease_.22s_both]">
            <span
              onClick={() => scrollOrHome('demos')}
              className="flex items-center gap-9px cursor-pointer bg-flamingo text-ink font-600 text-15.5px px-26px py-14px rounded-full shadow-[0_10px_28px_rgba(245,112,138,0.45)] transition-transform duration-150 hover:-translate-y-2px"
            >
              See the demos <ArrowRightIcon />
            </span>
            <a
              href={LINKS.resumePdf}
              download="Alice Knag — Résumé.pdf"
              className="flex items-center gap-9px text-15.5px font-600 px-26px py-14px rounded-full bg-white/12 border border-white/22 text-white transition-transform duration-150 hover:-translate-y-2px"
            >
              <DownloadIcon />
              Résumé
            </a>
            <span
              onClick={toggleEditor}
              className="flex items-center gap-8px cursor-pointer font-mono text-13.5px font-500 px-22px py-14px rounded-full bg-white/6 border border-white/20 text-rose transition-transform duration-150 hover:-translate-y-2px"
            >
              {'</>'} edit shader
            </span>
          </div>
        </div>
        {showEditor && <ShaderEditor />}
      </div>
    </section>
  )
}
