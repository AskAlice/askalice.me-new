import { useEffect, useRef } from 'react'

// Spin / Afterimage demo: two nested wireframe cubes on offset axes.
// Trails come from painting a translucent rect each frame instead of clearing.
const V: [number, number, number][] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
]
const E: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
]

export function GeoCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return
    let ang = 0
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
      ctx.fillStyle = 'rgba(14,12,20,0.16)'
      ctx.fillRect(0, 0, w, h)
      ang += 0.035
      const a = ang
      const cx = w / 2
      const cy = h / 2
      const scale = Math.min(w, h) * 0.26
      const proj = (v: number[]) => {
        const [x, y, z] = v
        const x1 = x * Math.cos(a) - z * Math.sin(a)
        const z1 = x * Math.sin(a) + z * Math.cos(a)
        const y1 = y * Math.cos(a * 0.7) - z1 * Math.sin(a * 0.7)
        const z2 = y * Math.sin(a * 0.7) + z1 * Math.cos(a * 0.7)
        const persp = 3 / (3 + z2)
        return [cx + x1 * scale * persp, cy + y1 * scale * persp]
      }
      const draw = (rot: number, col: string) => {
        ctx.strokeStyle = col
        ctx.lineWidth = 1.4
        for (const e of E) {
          const p1 = proj(V[e[0]].map((n) => n * rot))
          const p2 = proj(V[e[1]].map((n) => n * rot))
          ctx.beginPath()
          ctx.moveTo(p1[0], p1[1])
          ctx.lineTo(p2[0], p2[1])
          ctx.stroke()
        }
      }
      draw(1.0, 'rgba(245,112,138,0.92)')
      draw(0.55, 'rgba(179,164,247,0.6)')
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full block" />
}
