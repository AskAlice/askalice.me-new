import { useEffect, useRef, useState } from 'react'
import { GeoCanvas } from '../../components/demos/GeoCanvas'
import { P, H2, Code, Pre, Quote } from './ui'

function AlphaPlayground() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [alpha, setAlpha] = useState(0.16)
  const alphaRef = useRef(alpha)
  alphaRef.current = alpha
  useEffect(() => {
    const c = ref.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    let t = 0
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const dpr = Math.min(1.75, window.devicePixelRatio || 1)
      const w = c.clientWidth
      const h = c.clientHeight
      if (c.width !== Math.floor(w * dpr)) {
        c.width = Math.floor(w * dpr)
        c.height = Math.floor(h * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = `rgba(14,12,20,${alphaRef.current})`
      ctx.fillRect(0, 0, w, h)
      t += 0.045
      const x = w / 2 + Math.cos(t) * w * 0.36
      const y = h / 2 + Math.sin(t * 1.7) * h * 0.3
      ctx.fillStyle = '#f5708a'
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="mb-28px">
      <div className="border border-white/10 rounded-16px overflow-hidden h-180px relative bg-[#0e0c14]">
        <canvas ref={ref} className="absolute inset-0 w-full h-full block" role="img" aria-label="A dot tracing a curve, trail length controlled by the slider" />
      </div>
      <label className="flex items-center gap-12px font-mono text-12px text-faint mt-10px">
        <span>alpha = {alpha.toFixed(2)}</span>
        <input
          type="range"
          min={0.02}
          max={0.6}
          step={0.02}
          value={alpha}
          onChange={(e) => setAlpha(Number(e.target.value))}
          className="flex-1 accent-[#f5708a]"
        />
        <span>{alpha < 0.1 ? 'comet' : alpha > 0.4 ? 'barely a smear' : 'trail'}</span>
      </label>
    </div>
  )
}

export function TrailsArticle() {
  return (
    <div className="text-18px leading-[1.75] text-body2">
      <P>
        The spinning cubes on this site leave afterimage trails. There's no shader pass, no frame
        buffer of history, no particle system replaying old positions. The entire effect is that I
        never clear the canvas. This is it, running live:
      </P>
      <div className="border border-white/10 rounded-16px overflow-hidden h-260px relative bg-[#0e0c14] mb-28px">
        <GeoCanvas />
      </div>
      <P>
        The reflex at the top of every canvas render loop is{' '}
        <Code>ctx.clearRect(0, 0, w, h)</Code>: wipe to transparent, draw the new frame. That's
        correct and it's also why you have no trails — every frame is an orphan with no memory of
        the last one. The fix is to replace the wipe with fog:
      </P>
      <Pre lang="js">{`// instead of ctx.clearRect(0, 0, w, h):
ctx.fillStyle = 'rgba(14, 12, 20, 0.16)'  // background color, low alpha
ctx.fillRect(0, 0, w, h)
// ...then draw this frame's geometry on top`}</Pre>
      <P>
        Each frame paints a translucent rectangle of the background color over everything.
        Whatever was on the canvas doesn't vanish — it gets 16% closer to the background. Old
        frames don't get cleared, they get forgotten, gradually.
      </P>

      <H2>Alpha is your trail-length knob</H2>
      <P>
        The decay is exponential: after <Code>n</Code> frames, a pixel retains{' '}
        <Code>(1 - a)^n</Code> of its distance from the background. At <Code>a = 0.16</Code> a
        pixel is half-faded in ~4 frames and under 1% after ~26 — about 0.4s of trail at 60fps.
        Drop to <Code>0.05</Code> and 1% takes ~90 frames: long comet tails. Push toward{' '}
        <Code>0.5</Code> and the past dies in a couple frames. Drag it yourself:
      </P>
      <AlphaPlayground />
      <Quote>
        One number, painted once per frame, buys you what looks like a motion-blur system.
      </Quote>

      <H2>The gotcha: trails that never quite die</H2>
      <P>
        Canvas compositing is 8-bit per channel, rounded each frame. A faded pixel should end
        exactly at the background color, but once it's within a few counts, the per-frame step{' '}
        <Code>delta × a</Code> rounds to zero and the fade stalls. The residue sits roughly{' '}
        <Code>0.5 / a</Code> levels away — at <Code>a = 0.16</Code> that's ~3 counts, a permanent
        faint smear everywhere anything ever moved. Three fixes, pick by how visible it is:
      </P>
      <P>
        <strong className="text-bright">Ignore it.</strong> On a near-black background, 3 counts
        is invisible. That's what this site does.
      </P>
      <P>
        <strong className="text-bright">Amortized clear.</strong> Every few hundred frames, paint
        the rect at full opacity once. Cheap, and the blink hides inside the normal fade.
      </P>
      <P>
        <strong className="text-bright">Fade alpha, not color.</strong> Keep the canvas
        transparent over a CSS background and erase instead of painting:
      </P>
      <Pre lang="js">{`ctx.globalCompositeOperation = 'destination-out'
ctx.fillStyle = 'rgba(0, 0, 0, 0.16)'   // only alpha matters here
ctx.fillRect(0, 0, w, h)
ctx.globalCompositeOperation = 'source-over'`}</Pre>
      <P>
        <Code>destination-out</Code> multiplies the alpha channel down, and alpha rounding works
        in your favor — pixels genuinely reach 0 and the page background shows through clean. Or
        go rounding-aware: since residue ≈ <Code>0.5 / a</Code>, just pick an alpha big enough
        that it lands under one count of your palette's contrast.
      </P>

      <H2>Two production details</H2>
      <P>
        <strong className="text-bright">Device pixel ratio.</strong> The fog rect has to cover the
        whole bitmap or the uncovered strip never fades. Set the transform every frame and work in
        CSS pixels — that's how <Code>GeoCanvas</Code> does it, with DPR capped at 1.75 because
        trails hide the difference anyway:
      </P>
      <Pre lang="js">{`const dpr = Math.min(1.75, window.devicePixelRatio || 1)
if (c.width !== Math.floor(w * dpr)) {
  c.width = Math.floor(w * dpr)   // resize also wipes the canvas — trails restart, fine
  c.height = Math.floor(h * dpr)
}
ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
ctx.fillRect(0, 0, w, h)          // CSS-pixel coords now cover the full bitmap`}</Pre>
      <P>
        <strong className="text-bright">Reduced motion.</strong> Trails are decoration. If{' '}
        <Code>matchMedia('(prefers-reduced-motion: reduce)')</Code> matches, skip the loop and
        draw one static frame with a full clear. The technique costs one <Code>fillRect</Code> —
        the least you can pay for motion blur, and the easiest to turn off.
      </P>
    </div>
  )
}
