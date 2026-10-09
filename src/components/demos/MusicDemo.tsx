import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import analysis from '../../lib/music/i-promise.json'
import { formatTime, fractionAt, freqToY, logBands, sliceAt, type TrackAnalysis } from '../../lib/music'
import { FLStudioLogo } from '../Logos'
import { PauseIcon, PlayIcon, RestartIcon } from '../icons'

const DATA = analysis as TrackAnalysis
const SPECTROGRAM = '/media/music/i-promise-spectrogram.webp'
const BANDS = 32
const TICKS = [100, 1000, 10000] // Hz, labelled on the spectrogram's log axis

/**
 * "I Promise" — Alice's track, as a scrubbable spectrogram with a live
 * spectrum (AI Studio draft's HarmorMusicVisualization, rebuilt).
 *
 * The MP3 is served from this site, so it's same-origin: the Web Audio
 * AnalyserNode always gets real samples. The audio element is created with
 * preload="auto" as soon as the page mounts, so playback starts instantly;
 * the pitch/level/partials data is precomputed from the same MP3 by
 * scripts/analyze-track.py and ships in this lazy chunk. The playhead and
 * spectrum are drawn in a rAF loop that writes to the DOM/canvas directly
 * (only while playing) instead of re-rendering React at 60 fps.
 */
export default function MusicDemo() {
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0) // ~4×/s from timeupdate: text, partials, paused playhead
  const [hoverT, setHoverT] = useState<number | null>(null)
  const [buffered, setBuffered] = useState(0) // 0–1 of the track downloaded
  const [err, setErr] = useState('')

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gradRef = useRef<{ h: number; g: CanvasGradient } | null>(null)
  const dragging = useRef(false)

  const duration = DATA.duration
  const current = sliceAt(DATA.slices, hoverT ?? time)

  // Preload: start downloading the MP3 the moment the page mounts.
  useEffect(() => {
    const a = new Audio()
    a.preload = 'auto'
    a.src = DATA.audioUrl
    const onProgress = () => {
      if (a.buffered.length && a.duration) setBuffered(a.buffered.end(a.buffered.length - 1) / a.duration)
    }
    const handlers: [string, () => void][] = [
      ['play', () => setPlaying(true)],
      ['pause', () => setPlaying(false)],
      ['ended', () => setPlaying(false)],
      ['timeupdate', () => setTime(a.currentTime)],
      ['progress', onProgress],
      ['canplaythrough', onProgress],
      ['error', () => setErr('Couldn’t load the track.')],
    ]
    for (const [ev, fn] of handlers) a.addEventListener(ev, fn)
    audioRef.current = a
    return () => {
      for (const [ev, fn] of handlers) a.removeEventListener(ev, fn)
      a.pause()
      a.removeAttribute('src')
      a.load() // abort the download
      void ctxRef.current?.close()
      audioRef.current = null
      ctxRef.current = null
      analyserRef.current = null
    }
  }, [])

  /** Build the Web Audio graph once, inside the first user gesture (autoplay policy). */
  const ensureGraph = (a: HTMLAudioElement) => {
    if (ctxRef.current) return
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const an = ctx.createAnalyser()
    an.fftSize = 2048
    an.smoothingTimeConstant = 0.78
    ctx.createMediaElementSource(a).connect(an) // once per element, guarded by ctxRef
    an.connect(ctx.destination)
    ctxRef.current = ctx
    analyserRef.current = an
  }

  const toggle = async () => {
    const a = audioRef.current
    if (!a) return
    setErr('')
    try {
      if (a.paused) {
        ensureGraph(a)
        await ctxRef.current?.resume()
        await a.play()
      } else a.pause()
    } catch (e) {
      setErr(e instanceof Error && e.name === 'NotAllowedError' ? 'The browser blocked playback — press play again.' : 'Playback failed.')
    }
  }

  const seek = (t: number) => {
    const c = Math.min(duration, Math.max(0, t))
    if (audioRef.current) audioRef.current.currentTime = c
    setTime(c)
  }

  // rAF while playing: playhead + live spectrum, straight to the DOM/canvas
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const bins = new Uint8Array(1024)
    const draw = () => {
      const a = audioRef.current
      if (a && playheadRef.current) playheadRef.current.style.left = `${(a.currentTime / duration) * 100}%`
      const cv = canvasRef.current
      const an = analyserRef.current
      const g = cv?.getContext('2d')
      if (cv && an && g) {
        an.getByteFrequencyData(bins)
        const bands = logBands(bins, ctxRef.current?.sampleRate ?? 44100, BANDS)
        const { width: w, height: h } = cv
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

  const harmonics = current && current.freq > 0 ? current.harmonics : []
  const hmax = Math.max(...harmonics, 1e-6)
  const ctl = 'w-38px h-38px flex items-center justify-center rounded-11px border'
  const meta = [DATA.bpm ? `${DATA.bpm} BPM` : null, DATA.year, DATA.encoder?.replace(/^LAME in /, '')].filter(Boolean).join(' · ')

  return (
    <div className="border border-white/12 rounded-18px overflow-hidden bg-[#0e0b14]">
      <div className="flex items-center gap-14px flex-wrap px-18px py-14px border-b border-white/8">
        <span className="p-6px rounded-11px bg-black/40 border border-white/10 flex">
          <FLStudioLogo className="w-28px h-28px" />
        </span>
        <div className="min-w-0">
          <div className="text-17px font-600 text-bright">{DATA.track}</div>
          <div className="font-mono text-11.5px text-faint">
            {DATA.artist} · {formatTime(duration)}
            {meta && ` · ${meta}`}
          </div>
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
            className={`${ctl} bg-flamingo border-flamingo text-ink`}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>
      </div>

      <div className="p-18px">
        <div className="flex justify-between font-mono text-10.5px text-faint mb-6px">
          <span>frequency ↑ (log, {DATA.spectrogram.fMin} Hz – {DATA.spectrogram.fMax / 1000} kHz) · time →</span>
          <span>{buffered < 0.999 ? `preloading ${Math.round(buffered * 100)}%` : 'click or drag to scrub'}</span>
        </div>
        <div
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
          {TICKS.map((f) => (
            <span
              key={f}
              aria-hidden="true"
              className="absolute left-6px font-mono text-9.5px text-white/75 bg-black/55 px-4px rounded-3px pointer-events-none -translate-y-1/2"
              style={{ top: `${freqToY(f, DATA.spectrogram.fMin, DATA.spectrogram.fMax) * 100}%` }}
            >
              {f >= 1000 ? `${f / 1000}k` : f}
            </span>
          ))}
          <div
            className="absolute bottom-0 left-0 h-2px bg-white/35 pointer-events-none"
            style={{ width: `${buffered * 100}%` }}
            aria-hidden="true"
          />
          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-2px -ml-1px bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-none"
            style={{ left: `${(time / duration) * 100}%` }}
          />
          {hoverT !== null && current && (
            <div
              className="absolute top-8px -translate-x-1/2 bg-black/85 border border-white/15 rounded-8px px-8px py-4px font-mono text-10.5px text-bright whitespace-nowrap pointer-events-none"
              style={{ left: `${Math.min(90, Math.max(10, (hoverT / duration) * 100))}%` }}
            >
              {formatTime(hoverT)} · {current.freq > 0 ? (
                <>
                  <span className="text-butter">{current.note}</span> {current.freq} Hz ·{' '}
                </>
              ) : null}
              {current.db} dB
            </div>
          )}
        </div>

        {err && <p className="text-butter text-13.5px mt-10px mb-0">{err}</p>}

        <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] max-md:grid-cols-1 gap-16px mt-16px">
          <div className="border border-white/8 rounded-12px p-14px bg-black/25">
            <div className="flex justify-between font-mono text-11px mb-8px">
              <span className="text-body">live spectrum</span>
              <span className="text-faint">{playing ? 'Web Audio AnalyserNode' : 'press play'}</span>
            </div>
            <canvas ref={canvasRef} aria-hidden="true" className="w-full h-96px block" />
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
                {current && current.freq > 0 ? (
                  <>
                    <span className="text-butter">{current.note}</span> · {current.freq} Hz
                  </>
                ) : (
                  'quiet'
                )}
              </span>
            </div>
            <div className="flex items-end gap-6px h-96px">
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t-4px bg-gradient-to-t from-lilac to-pink"
                    style={{ height: `${harmonics.length ? Math.max(4, ((harmonics[i] ?? 0) / hmax) * 100) : 4}%` }}
                    title={current && current.freq > 0 ? `H${i + 1}: ${Math.round((i + 1) * current.freq)} Hz` : undefined}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-6px font-mono text-10px text-faint mt-4px">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="flex-1 text-center">H{i + 1}</span>
              ))}
            </div>
          </div>
        </div>
        <p className="font-mono text-10.5px text-faint mt-12px mb-0">
          Pitch, level and partials are precomputed from the MP3 itself ({DATA.slices.length} slices, one every {DATA.hop} s) by{' '}
          <code className="text-body">scripts/analyze-track.py</code>.
        </p>
      </div>
    </div>
  )
}
