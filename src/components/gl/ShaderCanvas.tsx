// Raw-WebGL full-screen fragment shader. Replaces the three.js + R3F
// <ShaderPlane>: the hero only ever drew one triangle with one program, so the
// ~230 KB (gzip) three/fiber/drei chunk bought nothing. Idea ported from the
// AI Studio draft's ShaderHeroBackground, then hardened:
//   - safe recompile: a bad edit reports its error and the last good program keeps rendering
//   - shaders/programs are deleted after use (the draft leaked one pair per keystroke)
//   - WebGL context loss/restore is handled
//   - the loop pauses while the canvas is off-screen
import { useEffect, useRef } from 'react'
import { LOOK } from '../../lib/look'
import { SCREEN_VERT } from '../../shaders/vert'
import { shortErr } from './shaderErrors'

const UNIFORMS = ['u_time', 'u_res', 'u_mouse', 'u_speed', 'u_warp', 'u_amp', 'u_c0', 'u_c1', 'u_c2', 'u_c3'] as const
type UniformName = (typeof UNIFORMS)[number]

interface Prog {
  program: WebGLProgram
  loc: Record<UniformName, WebGLUniformLocation | null>
}

/** Compile one shader stage; returns the shader or the driver's info log. */
function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | string {
  const sh = gl.createShader(type)
  if (!sh) return 'could not create shader'
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return sh
  const log = gl.getShaderInfoLog(sh) || 'compile error'
  gl.deleteShader(sh)
  return log
}

/** Build, link and configure a program for `frag`; returns it or a compile/link error string. */
function buildProgram(gl: WebGLRenderingContext, frag: string): Prog | string {
  const vs = compile(gl, gl.VERTEX_SHADER, SCREEN_VERT)
  if (typeof vs === 'string') return vs
  const fs = compile(gl, gl.FRAGMENT_SHADER, frag)
  if (typeof fs === 'string') {
    gl.deleteShader(vs)
    return fs
  }
  const program = gl.createProgram()
  if (!program) return 'could not create program'
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.bindAttribLocation(program, 0, 'position')
  gl.linkProgram(program)
  // shaders are owned by the program once linked; flag them for deletion now
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || 'link error'
    gl.deleteProgram(program)
    return log
  }
  const loc = Object.fromEntries(UNIFORMS.map((n) => [n, gl.getUniformLocation(program, n)])) as Prog['loc']
  gl.useProgram(program)
  gl.uniform1f(loc.u_speed, LOOK.speed)
  gl.uniform1f(loc.u_warp, LOOK.warp)
  gl.uniform1f(loc.u_amp, LOOK.amp)
  gl.uniform3f(loc.u_c0, ...LOOK.palette[0])
  gl.uniform3f(loc.u_c1, ...LOOK.palette[1])
  gl.uniform3f(loc.u_c2, ...LOOK.palette[2])
  gl.uniform3f(loc.u_c3, ...LOOK.palette[3])
  return { program, loc }
}

/** Upload the single full-screen triangle and point attribute 0 at it. */
function initGeometry(gl: WebGLRenderingContext): WebGLBuffer | null {
  const buf = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  return buf
}

/**
 * Full-bleed canvas that renders `frag` with the site LOOK uniforms.
 * `onErr` receives a short compile error ('' when the current source compiled).
 */
export function ShaderCanvas({
  frag,
  maxDpr,
  onErr,
}: {
  frag: string
  maxDpr: number
  onErr?: (err: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const progRef = useRef<Prog | null>(null)
  const fragRef = useRef(frag)
  const onErrRef = useRef(onErr)
  onErrRef.current = onErr

  // (re)compile whenever the source changes; keep the old program on failure
  useEffect(() => {
    fragRef.current = frag
    const gl = glRef.current
    if (!gl || gl.isContextLost()) return
    const next = buildProgram(gl, frag)
    if (typeof next === 'string') {
      onErrRef.current?.(shortErr(next))
      return
    }
    if (progRef.current) gl.deleteProgram(progRef.current.program)
    progRef.current = next
    onErrRef.current?.('')
  }, [frag])

  // context, render loop, resize, visibility, pointer — set up once
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' })
    if (!gl) {
      onErrRef.current?.('WebGL unavailable')
      return
    }
    glRef.current = gl
    let buf: WebGLBuffer | null = null
    let raf = 0
    let visible = true
    let lost = false
    let t = 0
    let last = performance.now()
    const mouse = { x: 0.5, y: 0.5 }

    const setup = () => {
      buf = initGeometry(gl)
      const p = buildProgram(gl, fragRef.current)
      if (typeof p === 'string') onErrRef.current?.(shortErr(p))
      else progRef.current = p
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }

    const frame = (now: number) => {
      raf = 0
      if (lost || !visible || document.hidden) return
      t += Math.min(now - last, 100) / 1000 // clamp so a stalled tab doesn't jump
      last = now
      const p = progRef.current
      if (p) {
        gl.useProgram(p.program)
        gl.uniform1f(p.loc.u_time, t)
        gl.uniform2f(p.loc.u_res, canvas.width, canvas.height)
        gl.uniform2f(p.loc.u_mouse, mouse.x, mouse.y)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }
      raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (raf || lost || !visible || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    // window-level so the hero copy sitting above the canvas doesn't block it
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) return
      mouse.x = (e.clientX - b.left) / b.width
      mouse.y = 1 - (e.clientY - b.top) / b.height
    }
    const onLost = (e: Event) => {
      e.preventDefault() // allow restore
      lost = true
      progRef.current = null
    }
    const onRestored = () => {
      lost = false
      setup()
      resize()
      kick()
    }

    setup()
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting
      kick()
    })
    io.observe(canvas)
    document.addEventListener('visibilitychange', kick)
    window.addEventListener('pointermove', onMove, { passive: true })
    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)
    kick()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', kick)
      window.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      if (progRef.current) gl.deleteProgram(progRef.current.program)
      progRef.current = null
      if (buf) gl.deleteBuffer(buf)
      glRef.current = null
      // No WEBGL_lose_context here: StrictMode re-runs this effect on the same
      // canvas, and a deliberately lost context can't be re-acquired. The
      // context is released when the canvas element is garbage-collected.
    }
  }, [maxDpr])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
}
