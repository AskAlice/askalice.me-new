import { useSite } from '../store'

export function ShaderEditor() {
  const { warpSrc, warpErr, setWarpSrc, resetShader, toggleEditor } = useSite()
  return (
    <div className="absolute top-90px right-[clamp(16px,4vw,40px)] z-9 w-[min(460px,46vw)] max-h-72vh flex flex-col bg-[rgba(14,11,20,0.6)] backdrop-blur-13px border border-white/16 rounded-14px shadow-[0_24px_70px_rgba(0,0,0,0.55)] overflow-hidden">
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
        <span
          onClick={resetShader}
          className="ml-auto font-mono text-11px text-muted cursor-pointer px-9px py-3px border border-white/14 rounded-7px hover:text-white"
        >
          reset
        </span>
        <span onClick={toggleEditor} className="font-mono text-14px text-muted cursor-pointer px-6px py-2px hover:text-white">
          ✕
        </span>
      </div>
      <textarea
        value={warpSrc}
        onChange={(e) => setWarpSrc(e.target.value)}
        spellCheck={false}
        className="flex-auto min-h-320px resize-none border-none outline-none bg-transparent text-[#e9e4f2] font-mono text-11.5px leading-[1.6] p-14px whitespace-pre overflow-auto"
      />
      <div className="px-13px py-9px border-t border-white/10 font-mono text-10.5px text-ghost">
        edit the fragment shader — it recompiles as you type
      </div>
    </div>
  )
}
