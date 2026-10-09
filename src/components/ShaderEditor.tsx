import { useEffect } from 'react'
import { useSite } from '../store'

/** Floating GLSL editor bound to the hero's live fragment source. Escape closes it. */
export function ShaderEditor() {
  const { warpSrc, warpErr, setWarpSrc, resetShader, toggleEditor } = useSite()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleEditor()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleEditor])
  return (
    // Phones: bottom sheet across the full width (46vw was ~180px wide on a phone).
    // md+: the original floating panel, top-right of the hero.
    <div
      id="shader-editor"
      role="region"
      aria-label="Shader editor"
      className="fixed left-12px right-12px bottom-12px z-150 max-h-60vh md:absolute md:left-auto md:bottom-auto md:top-90px md:right-[clamp(16px,4vw,40px)] md:z-9 md:w-[min(460px,46vw)] md:max-h-72vh flex flex-col bg-[rgba(14,11,20,0.82)] md:bg-[rgba(14,11,20,0.6)] backdrop-blur-13px border border-white/16 rounded-14px shadow-[0_24px_70px_rgba(0,0,0,0.55)] overflow-hidden"
    >
      <div className="flex items-center gap-10px px-13px py-11px border-b border-white/10">
        <span className="flex gap-6px">
          <span className="w-11px h-11px rounded-full bg-[#ff5f57]" />
          <span className="w-11px h-11px rounded-full bg-[#febc2e]" />
          <span className="w-11px h-11px rounded-full bg-[#28c840]" />
        </span>
        <span className="font-mono text-12px text-[#cfc9da]">frag.glsl</span>
        <span
          className={`font-mono text-11px whitespace-nowrap overflow-hidden text-ellipsis max-w-210px ${warpErr ? 'text-pink' : 'text-mint'}`}
        >
          {warpErr ? `✕ ${warpErr}` : '● compiled'}
        </span>
        <button
          type="button"
          onClick={resetShader}
          className="ml-auto font-mono text-11px text-muted px-9px py-3px border border-white/14 rounded-7px hover:text-white"
        >
          reset
        </button>
        <button type="button" onClick={toggleEditor} aria-label="Close shader editor" className="font-mono text-14px text-muted px-6px py-2px hover:text-white">
          ✕
        </button>
      </div>
      <textarea
        value={warpSrc}
        onChange={(e) => setWarpSrc(e.target.value)}
        spellCheck={false}
        aria-label="Fragment shader source"
        className="flex-auto min-h-180px md:min-h-320px resize-none border-none outline-none bg-transparent text-[#e9e4f2] font-mono text-11.5px leading-[1.6] p-14px whitespace-pre overflow-auto"
      />
      <div className="px-13px py-9px border-t border-white/10 font-mono text-10.5px text-ghost">
        edit the fragment shader — it recompiles as you type
      </div>
    </div>
  )
}
