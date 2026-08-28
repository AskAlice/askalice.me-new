import { POSTS } from '../lib/content'
import { AppLink } from '../components/AppLink'

export function BlogIndex() {
  return (
    <div className="max-w-820px mx-auto px-[clamp(18px,5vw,56px)] pt-120px pb-100px min-h-100vh">
      <AppLink href="/" className="font-mono text-13px text-muted">
        ← back home
      </AppLink>
      <h1 className="text-[clamp(36px,6vw,64px)] font-700 tracking-[-0.03em] mt-30px mb-12px">Writing</h1>
      <p className="text-muted text-17px mt-0 mb-50px">
        Notes from the workbench — front-end craft, WebGL, and the occasional self-driving car.
      </p>
      <div className="flex flex-col">
        {POSTS.map((p, i) => (
          <AppLink
            key={p.id}
            href={`/blog/${p.slug}`}
            className={`py-26px border-t border-white/8 ${i === POSTS.length - 1 ? 'border-b' : ''}`}
          >
            <div className="font-mono text-12px text-pink mb-9px">{p.indexMeta}</div>
            <h2 className="text-24px font-600 mt-0 mb-8px">{p.title}</h2>
            <p className="text-muted text-15.5px leading-[1.55] m-0">{p.indexExcerpt}</p>
          </AppLink>
        ))}
      </div>
    </div>
  )
}
