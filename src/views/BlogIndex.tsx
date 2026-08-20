import { useSite } from '../store'
import { POSTS } from '../lib/content'

export function BlogIndex() {
  const go = useSite((s) => s.go)
  return (
    <div className="max-w-820px mx-auto px-[clamp(18px,5vw,56px)] pt-120px pb-100px min-h-100vh">
      <span onClick={() => go('home')} className="font-mono text-13px text-muted cursor-pointer">
        ← back home
      </span>
      <h1 className="text-[clamp(36px,6vw,64px)] font-700 tracking-[-0.03em] mt-30px mb-12px">Writing</h1>
      <p className="text-muted text-17px mt-0 mb-50px">
        Notes from the workbench — front-end craft, WebGL, and the occasional self-driving car.
      </p>
      <div className="flex flex-col">
        {POSTS.map((p, i) => (
          <div
            key={p.id}
            onClick={() => go('post', { post: p.id })}
            className={`py-26px border-t border-white/8 cursor-pointer ${i === POSTS.length - 1 ? 'border-b' : ''}`}
          >
            <div className="font-mono text-12px text-pink mb-9px">{p.indexMeta}</div>
            <h3 className="text-24px font-600 mt-0 mb-8px">{p.title}</h3>
            <p className="text-muted text-15.5px leading-[1.55] m-0">{p.indexExcerpt}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
