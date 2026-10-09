import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import analysis from '../../lib/music/i-promise.json'
import { formatTime, fractionAt, logBands, sliceAt, type TrackAnalysis } from '../../lib/music'
import { FLStudioLogo } from '../Logos'
import { PauseIcon, PlayIcon, RestartIcon } from '../icons'

const DATA = analysis as TrackAnalysis
const SPECTROGRAM = '/media/music/i-promise-spectrogram.webp'
const BANDS = 32

/** 'probing' while we check CORS on first play; 'on' = real AnalyserNode; 'off' = audio only. */
type Live = 'idle' | 'probing' | 'on' | 'off'

/**
 * Can the browser read samples from `url`? Media from another origin only
 * reaches an AnalyserNode when the host sends CORS headers; otherwise Web
 * Audio outputs silence. A CORS-mode request answers that without guessing.
 */
async function corsReadable(url: string): Promise<boolean> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 4000)
  try {
    const res = await fetch(url, { mode: 'cors', signal: ctrl.signal })
    ctrl.abort() // headers are enough; don't download the track twice
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

/**
 * "I Promise" — Alice's track, as a scrubbable spectrogram with a live
 * spectrum (AI Studio draft's HarmorMusicVisualization, rebuilt).
 * Audio is created on the first Play click (the draft downloaded the MP3 on
 * every page load). The playhead and spectrum are drawn in a rAF loop that
 * writes to the DOM/canvas directly instead of re-rendering React at 60 fps.
 */
export default function MusicDemo() {
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0) // updated ~4×/s for text and partials
  const [hoverT, setHoverT] = useState<number | null>(null)
  const [live, setLive] = useState<Live>('idle')
  const [err, setErr] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pendingSeek = useRef(0)
  const dragging = useRef(false)
  const mounted = useRef(true)
  const setupRef = useRef<Promise<HTMLAudioElement | null> | null>(null)
  const probeRef = useRef<Promise<boolean> | null>(null)
  const gradRef = useRef<{ h: number; g: CanvasGradient } | null>(null)

  const duration = DATA.duration
  const current = sliceAt(DATA.slices, hoverT ?? time)

  /**
   * Create the audio element (+ Web Audio graph when CORS allows) once. Concurrent
   * callers share one in-flight promise; returns null if the page unmounted mid-setup.
   */
  const ensureAudio = (): Promise<HTMLAudioElement | null> => {
    if (audioRef.current) return Promise.resolve(audioRef.current)
    setupRef.current ??= setupAudio()
    return setupRef.current
  }

  const setupAudio = async (): Promise<HTMLAudioElement | null> => {
    setLive('probing')
    const readable = await (probeRef.current ?? corsReadable(DATA.audioUrl))
    if (!mounted.current) return null
    const a = new Audio()
    a.preload = 'auto'
    if (readable) a.crossOrigin = 'anonymous'
    a.src = DATA.audioUrl
    a.addEventListener('loadedmetadata', () => (a.currentTime = pendingSeek.current), { once: true })
    a.addEventListener('play', () => setPlaying(true))
    a.addEventListener('pause', () => setPlaying(false))
    a.addEventListener('ended', () => setPlaying(false))
    a.addEventListener('timeupdate', () => setTime(a.currentTime))
    a.addEventListener('error', () => setErr('Couldn’t load the track from emu.bz.'))
    audioRef.current = a
    if (readable) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx()
      const an = ctx.createAnalyser()
      an.fftSize = 2048
      an.smoothingTimeConstant = 0.78
      ctx.createMediaElementSource(a).connect(an)
      an.connect(ctx.destination)
      ctxRef.current = ctx
      analyserRef.current = an
    }
    setLive(readable ? 'on' : 'off')
    return a
  }

  const toggle = async () => {
    setErr('')
    try {
      const a = await ensureAudio()
      if (!a || !mounted.current) return
      if (a.paused) {
        await ctxRef.current?.resume()
        await a.play()
      } else a.pause()
    } catch (e) {
      setErr(e instanceof Error && e.name === 'NotAllowedError' ? 'The browser blocked playback — press play again.' : 'Playback failed.')
    }
  }

  const seek = (t: number) => {
    const c = Math.min(duration, Math.max(0, t))
    pendingSeek.current = c
    if (audioRef.current) audioRef.current.currentTime = c
    setTime(c)
  }

  // rAF while playing: playhead position + live spectrum, straight to the DOM.
  // When paused, the playhead's left comes from the `time` state in render.
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const bins = new Uint8Array(1024)
    const draw = () => {
      const a = audioRef.current
      const t = a ? a.currentTime : pendingSeek.current
      if (playheadRef.current) playheadRef.current.style.left = `${(t / duration) * 100}%`
      const cv = canvasRef.current
      const an = analyserRef.current
      if (cv && an) {
        an.getByteFrequencyData(bins)
        const bands = logBands(bins, ctxRef.current?.sampleRate ?? 44100, BANDS)
        const g = cv.getContext('2d')
        if (g) {
          const w = cv.width
          const h = cv.height
          g.clearRect(0, 0, w, h)
          if (gradRef.current?.h !== h) {
            const grad = g.createLinearGradient(0, h, 0, 0)
            grad.addColorStop(0, '#b3a4f7')
            grad.addColorStop(0.55, '#f5708a')
            grad.addColorStop(1, '#ffd47e')
            gradRef.current = { h, g: grad }
          }
          g.fillStyle = gradRef.current.g
          const bw = w / BANDS
          bands.forEach((v, i) => {
            const bh = Math.max(2, v * h)
            g.fillRect(i * bw + 1, h - bh, bw - 2, bh)
          })
        }
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [duration, playing])

  // size the canvas backing store to its CSS box
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = Math.max(1, Math.round(cv.clientWidth * dpr))
      cv.height = Math.max(1, Math.round(cv.clientHeight * dpr))
    })
    ro.observe(cv)
    return () => ro.disconnect()
  }, [live])

  // Probe CORS when the browser is idle, so the click → play() gap stays short
  // (Safari drops the user gesture across a slow await).
  useEffect(() => {
    const start = () => {
      probeRef.current ??= corsReadable(DATA.audioUrl)
    }
    const hasIdle = typeof window.requestIdleCallback === 'function' // missing in older Safari
    const id = hasIdle ? window.requestIdleCallback(start, { timeout: 2000 }) : window.setTimeout(start, 600)
    return () => (hasIdle ? window.cancelIdleCallback(id) : window.clearTimeout(id))
  }, [])

  // tear down on leave: stop the download as well as playback, release the context
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      const a = audioRef.current
      if (a) {
        a.pause()
        a.removeAttribute('src')
        a.load()
      }
      void ctxRef.current?.close()
      audioRef.current = null
      ctxRef.current = null
      analyserRef.current = null
      setupRef.current = null
    }
  }, [])

  const tAt = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return fractionAt(e.clientX - r.left, r.width) * duration
  }
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return // primary button / touch / pen only
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    seek(tAt(e))
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const t = tAt(e)
    setHoverT(t)
    if (dragging.current) seek(t)
  }
  const endDrag = () => {
    dragging.current = false
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 5, ArrowLeft: -5, PageUp: 30, PageDown: -30 }[e.key]
    if (step !== undefined) seek(time + step)
    else if (e.key === 'Home') seek(0)
    else if (e.key === 'End') seek(duration)
    else if (e.key === ' ' || e.key === 'Enter') void toggle()
    else return
    e.preventDefault()
  }

  const hmax = Math.max(...(current?.harmonics ?? [1]), 1e-6)
  const ctl = 'w-38px h-38px flex items-center justify-center rounded-11px border'

  return (
    <div className="border border-white/12 rounded-18px overflow-hidden bg-[#0e0b14]">
      <div className="flex items-center gap-14px flex-wrap px-18px py-14px border-b border-white/8">
        <span className="p-6px rounded-11px bg-black/40 border border-white/10 flex">
          <FLStudioLogo className="w-28px h-28px" />
        </span>
        <div className="min-w-0">
          <div className="text-17px font-600 text-bright">{DATA.track}</div>
          <div className="font-mono text-11.5px text-faint">{DATA.artist} · original track · {formatTime(duration)}</div>
        </div>
        <div className="ml-auto flex items-center gap-8px">
          <span className="font-mono text-12px text-body tabular-nums">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <button type="button" aria-label="Restart" onClick={() => seek(0)} className={`${ctl} bg-white/6 border-white/12 text-body hover:text-bright`}>
            <RestartIcon />
          </button>
          <button
            type="button"
            aria-label={playing ? 'Pause' : 'Play I Promise'}
            onClick={() => void toggle()}
            disabled={live === 'probing'}
            className={`${ctl} bg-flamingo border-flamingo text-ink disabled:opacity-60`}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>

      <div className="p-18px">
        <div className="flex justify-between font-mono text-10.5px text-faint mb-6px">
          <span>frequency ↑ (log) · time →</span>
          <span>click or drag to scrub</span>
        </div>
        <div
          ref={stageRef}
          role="slider"
          tabIndex={0}
          aria-label="Track position"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          onPointerLeave={() => setHoverT(null)}
          onKeyDown={onKey}
          className="relative h-[clamp(140px,22vw,210px)] rounded-12px overflow-hidden border border-white/12 bg-black cursor-crosshair select-none touch-pan-y outline-none focus-visible:border-flamingo/70"
        >
          <img src={SPECTROGRAM} alt="Spectrogram of I Promise" width={2400} height={320} draggable={false} className="absolute inset-0 w-full h-full object-fill pointer-events-none opacity-90" />
          <div ref={playheadRef} className="absolute top-0 bottom-0 w-2px -ml-1px bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none" style={{ left: `${(time / duration) * 100}%` }} />
          {hoverT !== null && current && (
            <div
              className="absolute top-8px -translate-x-1/2 bg-black/85 border border-white/15 rounded-8px px-8px py-4px font-mono text-10.5px text-bright whitespace-nowrap pointer-events-none"
              style={{ left: `${Math.min(92, Math.max(8, (hoverT / duration) * 100))}%` }}
            >
              {formatTime(hoverT)} · <span className="text-butter">{current.note}</span> {current.freq} Hz · {current.db} dB
            </div>
          )}
        </div>

        {err && <p className="text-butter text-13.5px mt-10px mb-0">{err}</p>}

        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] max-md:grid-cols-1 gap-16px mt-16px">
          <div className="border border-white/8 rounded-12px p-14px bg-black/25">
            <div className="flex justify-between font-mono text-11px mb-8px">
              <span className="text-body">live spectrum</span>
              <span className="text-faint">
                {live === 'on' ? 'Web Audio AnalyserNode' : live === 'off' ? 'unavailable' : live === 'probing' ? 'checking…' : 'press play'}
              </span>
            </div>
            {live === 'off' ? (
              <p className="text-13px text-muted leading-[1.5] m-0 h-96px">
                The track is served from emu.bz without CORS headers, so the browser won’t let this page read its samples. It still plays. Serving the MP3 from askalice.me (or adding <code className="font-mono text-pink">Access-Control-Allow-Origin</code> on emu.bz) turns the live spectrum on.
              </p>
            ) : (
              <canvas ref={canvasRef} aria-hidden="true" className="w-full h-96px block" />
            )}
            <div className="flex justify-between font-mono text-10px text-faint mt-4px">
              <span>32 Hz</span>
              <span>500 Hz</span>
              <span>16 kHz</span>
            </div>
          </div>

          <div className="border border-white/8 rounded-12px p-14px bg-black/25">
            <div className="flex justify-between font-mono text-11px mb-8px">
              <span className="text-body">partials H1–H8</span>
              <span className="text-faint">
                {current ? (
                  <>
                    <span className="text-butter">{current.note}</span> · {current.freq} Hz
                  </>
                ) : null}
              </span>
            </div>
            <div className="flex items-end gap-6px h-96px">
              {(current?.harmonics ?? []).map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t-4px bg-gradient-to-t from-lilac to-pink"
                    style={{ height: `${Math.max(4, (h / hmax) * 100)}%` }}
                    title={`H${i + 1}: ${Math.round((i + 1) * (current?.freq ?? 0))} Hz`}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-6px font-mono text-10px text-faint mt-4px">
              {(current?.harmonics ?? []).map((_, i) => (
                <span key={i} className="flex-1 text-center">H{i + 1}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="font-mono text-10.5px text-faint mt-12px mb-0">
          Pitch, level and partials come from an offline analysis of the track: {DATA.slices.length} slices, one every ~1.6 s.
        </p>
      </div>
    </div>
  )
}
