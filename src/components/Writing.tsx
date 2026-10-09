import { POSTS } from '../lib/content'
import { AppLink } from './AppLink'

export function Writing() {
  return (
    <section id="writing" className="section-pad py-[clamp(40px,7vw,90px)] scroll-mt-80px">
      <div className="flex items-end justify-between gap-20px mb-40px flex-wrap">
        <div>
          <div className="eyebrow mb-24px">
            <span className="eyebrow-rule" />05 / writing
          </div>
          <h2 className="text-[clamp(28px,4vw,46px)] leading-[1.1] font-600 tracking-[-0.02em] m-0">
            Notes from the workbench.
          </h2>
        </div>
        <AppLink href="/blog" className="font-mono text-13px text-pink whitespace-nowrap">
          all writing →
        </AppLink>
      </div>
      <div className="flex flex-col">
        {POSTS.map((p, i) => (
          <AppLink
            key={p.id}
            href={`/blog/${p.slug}`}
            className={`grid grid-cols-[1fr_auto] gap-24px items-center py-24px border-t border-white/8 ${i === POSTS.length - 1 ? 'border-b' : ''}`}
          >
            <div>
              <div className="font-mono text-12px text-faint mb-9px">{p.homeMeta}</div>
              <h3 className="text-21px font-600 mt-0 mb-7px">{p.title}</h3>
              <p className="text-muted text-15px leading-[1.5] m-0 max-w-560px">{p.excerpt}</p>
            </div>
            <span className="text-pink text-22px" aria-hidden="true">→</span>
          </AppLink>
        ))}
      </div>
    </section>
  )
}
