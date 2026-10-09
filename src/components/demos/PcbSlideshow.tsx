import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { PCB_BOARDS, PCB_REPO, pcbMedia, stepIndex } from '../../lib/pcbBoards'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '../icons'

const AUTOPLAY_MS = 6000

/** Warm the browser cache for one image without rendering it. */
function preload(src: string | null) {
  if (!src) return
  const im = new Image()
  im.decoding = 'async'
  im.src = src
}

/**
 * Board-by-board viewer for the home-automation-pcbs swarm (AI Studio draft's
 * PcbSwarmSlideshow, rebuilt): turntable GIF or raytraced top render, specs
 * from the repo README, prev/next, board chips and optional autoplay.
 * Differences from the draft: no 20 MB preload of every GIF on page load
 * (only the neighbours), autoplay is off for reduced motion and pauses while
 * hovered or focused, and arrow keys work when the viewer has focus.
 */
export function PcbSlideshow() {
  const [i, setI] = useState(0)
  const [view, setView] = useState<'turntable' | 'render'>('turntable')
  const [playing, setPlaying] = useState(() => !matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [hold, setHold] = useState(false) // hovered or focused
  const [loaded, setLoaded] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const n = PCB_BOARDS.length
  const board = PCB_BOARDS[i]!
  const media = pcbMedia(board)
  const src = view === 'turntable' && media.turntable ? media.turntable : media.render

  useEffect(() => setLoaded(false), [src])

  // neighbours only, in the current view
  useEffect(() => {
    for (const d of [1, -1]) {
      const m = pcbMedia(PCB_BOARDS[stepIndex(i, d, n)]!)
      preload(view === 'turntable' && m.turntable ? m.turntable : m.render)
    }
  }, [i, view, n])

  useEffect(() => {
    if (!playing || hold) return
    const t = setTimeout(() => setI((x) => stepIndex(x, 1, n)), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [i, playing, hold, n])

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') setI((x) => stepIndex(x, 1, n))
    else if (e.key === 'ArrowLeft') setI((x) => stepIndex(x, -1, n))
    else return
    e.preventDefault()
  }

  const btn = 'w-36px h-36px flex items-center justify-center rounded-10px bg-white/6 border border-white/12 text-body hover:text-bright'
  const seg = (on: boolean) => `px-11px py-6px rounded-8px font-mono text-11.5px ${on ? 'bg-white/14 text-bright' : 'text-muted hover:text-bright'}`

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="home-automation-pcbs boards"
      tabIndex={0}
      onKeyDown={onKey}
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setHold(false)
      }}
      className="border border-white/12 rounded-18px overflow-hidden bg-[#121018] outline-none focus-visible:border-flamingo/60"
    >
      <div className="flex items-center justify-between gap-12px flex-wrap px-18px py-12px border-b border-white/8 bg-white/3">
        <div className="font-mono text-12px text-muted">
          board <span className="text-bright">{i + 1}</span> / {n} · <span className="text-pink">{board.name}</span>
        </div>
        <div className="flex items-center gap-8px">
          <div className="flex p-3px rounded-10px bg-white/5 border border-white/10" role="group" aria-label="View">
            <button type="button" className={seg(view === 'turntable')} aria-pressed={view === 'turntable'} onClick={() => setView('turntable')}>
              turntable
            </button>
            <button type="button" className={seg(view === 'render')} aria-pressed={view === 'render'} onClick={() => setView('render')}>
              top render
            </button>
          </div>
          <button type="button" className={btn} aria-label={playing ? 'Pause autoplay' : 'Start autoplay'} onClick={() => setPlaying((p) => !p)}>
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button type="button" className={btn} aria-label="Previous board" onClick={() => setI((x) => stepIndex(x, -1, n))}>
            <ChevronLeftIcon />
          </button>
          <button type="button" className={btn} aria-label="Next board" onClick={() => setI((x) => stepIndex(x, 1, n))}>
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] max-lg:grid-cols-1">
        <div className="relative min-h-320px flex items-center justify-center p-20px bg-[#0b0910] [background-image:radial-gradient(rgba(143,201,245,0.08)_1px,transparent_1px)] [background-size:20px_20px] border-r border-white/8 max-lg:border-r-0 max-lg:border-b">
          {!loaded && (
            <span className="absolute font-mono text-11.5px text-faint" aria-hidden="true">
              loading {view === 'turntable' && media.turntable ? 'turntable' : 'render'}…
            </span>
          )}
          <img
            key={src}
            src={src}
            alt={`${board.name} — ${view === 'turntable' && media.turntable ? '360° turntable of the' : 'raytraced top render of the'} KiCad 3D model`}
            width={view === 'turntable' && media.turntable ? 784 : 1376}
            height={view === 'turntable' && media.turntable ? 480 : 872}
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`relative max-h-380px w-auto max-w-full h-auto object-contain transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {view === 'turntable' && !media.turntable && (
            <span className="absolute top-14px left-16px font-mono text-11px text-faint">no turntable yet — showing the render</span>
          )}
        </div>

        <div aria-live="polite" className="p-24px flex flex-col">
          <div className="font-mono text-11px text-mint mb-8px">{board.status}</div>
          <h3 className="text-24px font-600 m-0 tracking-[-0.01em]">{board.name}</h3>
          <p className="text-pink text-15px mt-4px mb-14px">{board.role}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-14px gap-y-5px m-0 mb-14px font-mono text-12px">
            <dt className="text-faint">MCU</dt>
            <dd className="m-0 text-bright">{board.mcu}</dd>
            <dt className="text-faint">stack</dt>
            <dd className="m-0 text-bright">{board.ecosystem}</dd>
            <dt className="text-faint">firmware</dt>
            <dd className="m-0 text-body break-all">{board.firmware}</dd>
          </dl>
          {board.warning && (
            <p className="text-13.5px leading-[1.5] text-butter bg-butter/10 border border-butter/25 rounded-10px px-12px py-9px mt-0 mb-14px">
              ⚠ {board.warning}
            </p>
          )}
          <ul role="list" className="list-none p-0 m-0 flex flex-col gap-8px text-14px text-body leading-[1.55]">
            {board.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <div className="flex gap-6px flex-wrap mt-16px">
            {board.parts.map((p) => (
              <span key={p} className="tech-chip">{p}</span>
            ))}
          </div>
          <a
            href={`${PCB_REPO}/tree/main/boards/${board.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto pt-18px font-mono text-12.5px text-pink"
          >
            board files on GitHub ↗
          </a>
        </div>
      </div>

      <div className="flex gap-6px overflow-x-auto px-14px py-12px border-t border-white/8 [scrollbar-width:thin]">
        {PCB_BOARDS.map((b, j) => (
          <button
            key={b.id}
            type="button"
            aria-current={j === i ? 'true' : undefined}
            onClick={() => setI(j)}
            className={`shrink-0 font-mono text-11.5px px-11px py-6px rounded-full border ${j === i ? 'bg-flamingo text-ink border-flamingo font-600' : 'text-muted border-white/12 hover:text-bright'}`}
          >
            {b.name}
          </button>
        ))}
      </div>
    </div>
  )
}
