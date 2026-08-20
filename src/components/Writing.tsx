import { useSite } from '../store'
import { POSTS } from '../lib/content'

export function Writing() {
  const go = useSite((s) => s.go)
  return (
    <section id="writing" className="section-pad py-[clamp(40px,7vw,90px)] scroll-mt-80px">
      <div className="flex items-end justify-between gap-20px mb-40px flex-wrap">
        <div>
          <div className="eyebrow mb-24px">
            <span className="eyebrow-rule" />04 / writing
          </div>
          <h2 className="text-[clamp(28px,4vw,46px)] leading-[1.1] font-600 tracking-[-0.02em] m-0">
            Notes from the workbench.
          </h2>
        </div>
        <span onClick={() => go('blog')} className="font-mono text-13px text-pink cursor-pointer whitespace-nowrap">
          all writing →
        </span>
      </div>
      <div className="flex flex-col">
        {POSTS.map((p, i) => (
          <div
            key={p.id}
            onClick={() => go('post', { post: p.id })}
            className={`grid grid-cols-[1fr_auto] gap-24px items-center py-24px border-t border-white/8 cursor-pointer ${i === POSTS.length - 1 ? 'border-b' : ''}`}
          >
            <div>
              <div className="font-mono text-12px text-faint mb-9px">{p.homeMeta}</div>
              <h3 className="text-21px font-600 mt-0 mb-7px">{p.title}</h3>
              <p className="text-muted text-15px leading-[1.5] m-0 max-w-560px">{p.excerpt}</p>
            </div>
            <span className="text-pink text-22px">→</span>
          </div>
        ))}
      </div>
    </section>
  )
}
