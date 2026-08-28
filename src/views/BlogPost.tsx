import { useSite } from '../store'
import { POSTS, GRAVATAR } from '../lib/content'
import { FlexArticle } from '../lib/posts/flex'
import { CommaArticle } from '../lib/posts/comma'
import { TrailsArticle } from '../lib/posts/trails'
import { AppLink } from '../components/AppLink'

const ARTICLES = { 1: FlexArticle, 2: CommaArticle, 3: TrailsArticle }

export function BlogPost() {
  const activePost = useSite((s) => s.activePost)
  const post = POSTS.find((p) => p.id === activePost) ?? POSTS[0]
  const Article = ARTICLES[post.id]
  return (
    <div className="max-w-720px mx-auto px-[clamp(18px,5vw,56px)] pt-120px pb-100px min-h-100vh">
      <AppLink href="/blog" className="font-mono text-13px text-muted">
        ← all writing
      </AppLink>
      <time dateTime={post.published} className="font-mono text-13px text-pink mt-32px mb-16px block">
        {post.meta}
      </time>
      <h1 className="text-[clamp(30px,5vw,48px)] font-700 tracking-[-0.025em] leading-[1.1] mt-0 mb-14px">{post.title}</h1>
      <div className="flex items-center gap-12px pt-20px pb-28px border-b border-white/8 mb-40px">
        <img
          src={`${GRAVATAR}?s=80&d=identicon`}
          alt=""
          width={34}
          height={34}
          className="w-34px h-34px rounded-full border border-white/15"
        />
        <span className="text-14px text-body">Alice Knag</span>
      </div>
      <Article />
    </div>
  )
}
