import { useSite } from '../store'
import { POSTS, GRAVATAR } from '../lib/content'

const Code = ({ children }: { children: string }) => (
  <code className="font-mono text-15px text-pink bg-flamingo/12 px-6px py-2px rounded-5px">{children}</code>
)

export function BlogPost() {
  const go = useSite((s) => s.go)
  const activePost = useSite((s) => s.activePost)
  const post = POSTS.find((p) => p.id === activePost) ?? POSTS[0]
  return (
    <div className="max-w-720px mx-auto px-[clamp(18px,5vw,56px)] pt-120px pb-100px min-h-100vh">
      <span onClick={() => go('blog')} className="font-mono text-13px text-muted cursor-pointer">
        ← all writing
      </span>
      <div className="font-mono text-13px text-pink mt-32px mb-16px">{post.meta}</div>
      <h1 className="text-[clamp(30px,5vw,48px)] font-700 tracking-[-0.025em] leading-[1.1] mt-0 mb-14px">{post.title}</h1>
      <div className="flex items-center gap-12px pt-20px pb-28px border-b border-white/8 mb-40px">
        <img
          src={`${GRAVATAR}?s=80&d=identicon`}
          alt="Alice Knag"
          className="w-34px h-34px rounded-full border border-white/15"
        />
        <span className="text-14px text-body">Alice Knag</span>
      </div>
      {/* Sample body from the handoff — swap in real writing before launch. */}
      <div className="text-18px leading-[1.75] text-body2">
        <p className="mt-0 mb-24px">
          Flexbox is wonderful right up until you ask it to animate. The moment a child becomes{' '}
          <Code>display:none</Code>, the browser skips straight to the end state — no transition, nothing to watch.
        </p>
        <p className="mt-0 mb-24px">
          The fix is the FLIP technique: measure the <strong className="text-bright">First</strong> position, apply the{' '}
          <strong className="text-bright">Last</strong> state instantly, <strong className="text-bright">Invert</strong>{' '}
          the delta with a transform, then <strong className="text-bright">Play</strong> it back. Siblings reflow for
          free because we never fight the layout engine.
        </p>
        <blockquote className="mt-0 mb-28px py-4px pl-22px border-l-2 border-l-flamingo text-muted italic text-18px mx-0">
          Don't animate layout. Animate something that looks like layout, and let flexbox catch up.
        </blockquote>
        <p className="m-0 text-ghost text-15px italic">
          This is a sample post laid out in the template — swap in your real writing any time.
        </p>
      </div>
    </div>
  )
}
