import { useMemo, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ScreenQuad } from '@react-three/drei'
import * as THREE from 'three'
import { SCREEN_VERT } from '../../shaders/vert'
import { LOOK } from '../../lib/look'

// Compile a fragment shader against the live GL context without touching the
// running program — the handoff's "safe compile": a bad edit never throws,
// the last good program keeps rendering.
export function tryCompileFrag(gl: WebGLRenderingContext | WebGL2RenderingContext, src: string): string {
  const sh = gl.createShader(gl.FRAGMENT_SHADER)
  if (!sh) return 'no shader context'
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  const ok = gl.getShaderParameter(sh, gl.COMPILE_STATUS)
  const log = ok ? '' : gl.getShaderInfoLog(sh) || 'compile error'
  gl.deleteShader(sh)
  return log
}

export function shortErr(log: string): string {
  const line = log.split('\n').map((s) => s.trim()).filter(Boolean)[0] || 'compile error'
  return line.replace(/^ERROR:\s*\d+:/, 'line ').slice(0, 52)
}

type Uniforms = Record<string, THREE.IUniform>

function makeUniforms(withWarp: boolean): Uniforms {
  const u: Uniforms = {
    u_time: { value: 0 },
    u_res: { value: new THREE.Vector2(1, 1) },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_speed: { value: LOOK.speed },
    u_c0: { value: new THREE.Vector3(...LOOK.palette[0]) },
    u_c1: { value: new THREE.Vector3(...LOOK.palette[1]) },
    u_c2: { value: new THREE.Vector3(...LOOK.palette[2]) },
  }
  if (withWarp) {
    u.u_warp = { value: LOOK.warp }
    u.u_amp = { value: LOOK.amp }
    u.u_c3 = { value: new THREE.Vector3(...LOOK.palette[3]) }
  }
  return u
}

function Quad({ frag, withWarp, onErr }: { frag: string; withWarp: boolean; onErr?: (err: string) => void }) {
  const gl = useThree((s) => s.gl)
  const mat = useRef<THREE.RawShaderMaterial>(null!)
  const uniforms = useMemo(() => makeUniforms(withWarp), [withWarp])
  const mouse = useRef(new THREE.Vector2(0.5, 0.5))

  useEffect(() => {
    // window-level so the hero text sitting above the canvas doesn't block it
    const onMove = (e: PointerEvent) => {
      const b = gl.domElement.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) return
      mouse.current.set((e.clientX - b.left) / b.width, 1 - (e.clientY - b.top) / b.height)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [gl])

  // live recompile: validate first; only swap the source when it compiles
  useEffect(() => {
    if (!mat.current) return
    const log = tryCompileFrag(gl.getContext(), frag)
    if (log) {
      onErr?.(shortErr(log))
      return
    }
    onErr?.('')
    if (mat.current.fragmentShader !== frag) {
      mat.current.fragmentShader = frag
      mat.current.needsUpdate = true
    }
  }, [frag, gl, onErr])

  useFrame((state) => {
    uniforms.u_time.value = state.clock.elapsedTime
    uniforms.u_res.value.set(gl.domElement.width, gl.domElement.height)
    uniforms.u_mouse.value.copy(mouse.current)
  })

  return (
    <ScreenQuad>
      <rawShaderMaterial
        ref={mat}
        vertexShader={SCREEN_VERT}
        fragmentShader={frag}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </ScreenQuad>
  )
}

export function ShaderPlane({
  frag,
  withWarp = false,
  maxDpr,
  onErr,
}: {
  frag: string
  withWarp?: boolean
  maxDpr: number
  onErr?: (err: string) => void
}) {
  // R3F's initial container measurement doesn't fire in the production build
  // (canvas stays at 300x150 until a window resize) — nudge it once on mount.
  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
    return () => cancelAnimationFrame(id)
  }, [])
  return (
    <Canvas
      dpr={[1, maxDpr]}
      flat
      frameloop="always"
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Quad frag={frag} withWarp={withWarp} onErr={onErr} />
    </Canvas>
  )
}
