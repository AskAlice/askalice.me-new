import { PHOTOS } from '../lib/content'
import { AppLink } from '../components/AppLink'

export function Photography() {
  return (
    <div className="max-w-1080px mx-auto px-[clamp(18px,5vw,56px)] pt-120px pb-100px min-h-100vh">
      <AppLink href="/" className="font-mono text-13px text-muted">
        ← back home
      </AppLink>
      <h1 className="text-[clamp(36px,6vw,64px)] font-700 tracking-[-0.03em] mt-30px mb-12px">Photography</h1>
      <p className="text-muted text-17px mt-0 mb-50px">
        Off the keyboard — fire spinners, festivals, and the Front Range.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-14px">
        {PHOTOS.map((p) => (
          <img
            key={p.src}
            src={p.src}
            alt={p.alt}
            loading="lazy"
            decoding="async"
            width={400}
            height={400}
            className="w-full aspect-square object-cover rounded-13px border border-white/9 transition-all duration-150 hover:border-flamingo/40 hover:-translate-y-2px"
          />
        ))}
      </div>
    </div>
  )
}
