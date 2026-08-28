import { createElement, type ReactNode } from 'react'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import typescript from 'highlight.js/lib/languages/typescript'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('css', css)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('js', javascript)
hljs.registerLanguage('ts', typescript)
hljs.registerLanguage('tsx', typescript)
hljs.registerLanguage('sh', bash)

export type CodeLang = 'bash' | 'sh' | 'css' | 'javascript' | 'js' | 'python' | 'typescript' | 'ts' | 'tsx'

const ENT: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'", '&#39;': "'" }

function hlNodes(html: string): ReactNode[] {
  type N = { cls: string; kids: ReactNode[] }
  const root: N = { cls: '', kids: [] }
  const stack = [root]
  let k = 0
  const push = (n: ReactNode) => stack[stack.length - 1]!.kids.push(n)
  html.replace(/<span class="([^"]+)">|<\/span>|&(?:amp|lt|gt|quot|#x27|#39);|[^<&]+/g, (m, cls?: string) => {
    if (cls) { stack.push({ cls, kids: [] }); return '' }
    if (m === '</span>') {
      const n = stack.pop()!
      push(createElement('span', { key: k++, className: n.cls }, n.kids))
      return ''
    }
    push(ENT[m] ?? m)
    return ''
  })
  return root.kids
}

function assertHighlight() {
  const html = hljs.highlight('const x = "hi"', { language: 'javascript' }).value
  const nodes = hlNodes(html)
  if (!html.includes('hljs-keyword') || !html.includes('hljs-string') || !nodes.length) {
    throw new Error('highlight: js tokens')
  }
}
if (import.meta.env.DEV) assertHighlight()

export const P = ({ children }: { children: ReactNode }) => (
  <p className="mt-0 mb-24px">{children}</p>
)
export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="text-22px font-600 text-bright tracking-[-0.02em] mt-44px mb-16px">{children}</h2>
)
export const Code = ({ children }: { children: string }) => (
  <code className="font-mono text-15px text-pink bg-flamingo/12 px-6px py-2px rounded-5px">{children}</code>
)
export const Pre = ({ children, lang }: { children: string; lang?: CodeLang }) => (
  <pre className="font-mono text-13px leading-[1.65] text-[#e9e4f2] bg-card border border-white/8 rounded-12px p-18px overflow-x-auto mb-28px mt-0 whitespace-pre">
    {hlNodes(lang ? hljs.highlight(children, { language: lang }).value : hljs.highlightAuto(children).value)}
  </pre>
)
export const Quote = ({ children }: { children: ReactNode }) => (
  <blockquote className="mt-0 mb-28px py-4px pl-22px border-l-2 border-l-flamingo text-muted italic text-18px mx-0">
    {children}
  </blockquote>
)
export const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-pink border-b border-flamingo/35">
    {children}
  </a>
)
