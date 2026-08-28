import { useEffect, useState } from 'react'

export function CyclePreview({ srcs, className, alt }: { srcs: string[]; className?: string; alt: string }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    for (const s of srcs) {
      const im = new Image()
      im.src = s
    }
  }, [srcs])
  useEffect(() => {
    if (srcs.length < 2) return
    const src = srcs[i] ?? srcs[0]!
    const t = setTimeout(() => setI((n) => (n + 1) % srcs.length), src.endsWith('.gif') ? 9000 : 4000)
    return () => clearTimeout(t)
  }, [i, srcs])
  const src = srcs[i]
  if (!src) return null
  return <img src={src} alt={alt} className={className} width={640} height={360} decoding="async" />
}
