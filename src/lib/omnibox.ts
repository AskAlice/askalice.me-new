// Client side of the /demos/search omnibox. Results come from the real
// search.emu.sh engine (GET /suggest?type=json) through the same-origin proxy
// in api/suggest.ts — nothing here is canned. The AI Studio draft's version
// returned hardcoded answers ("1 BTC = $67,420.50") and evaluated math with
// Function(); both are gone.

export const ENGINE = 'https://search.emu.sh'
export const MAX_QUERY = 200

/**
 * Trim and cap a query at MAX_QUERY code points (not UTF-16 units), so an
 * emoji is never cut in half; lone surrogates become U+FFFD. The result is
 * always safe to pass to encodeURIComponent, which throws on half a pair.
 */
export function clampQuery(s: string): string {
  const wellFormed = s.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '\uFFFD')
  return Array.from(wellFormed.trim()).slice(0, MAX_QUERY).join('')
}

export type QueryKind =
  | { kind: 'dig'; domain: string; record: string }
  | { kind: 'ip'; ip: string }
  | { kind: 'bang'; bang: string; rest: string }
  | { kind: 'search' }

// Same patterns search.emu.sh uses server-side (src/routes/suggest.ts), so the
// label matches the branch the engine will take.
const DIG = /^(dig\s)?((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])\s(A|AAAA|ALIAS|CNAME|MX|NS|PTR|SOA|SRV|TXT)\b/i
const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/
const IPV6 = /^[0-9a-f:]+$/i
const BANG = /^!([\w-]+)(?:[\s+]+(.*))?$/

/** Which search.emu.sh feature a query will hit: DNS dig, IP geolocation, a !bang, or plain suggestions. */
export function classifyQuery(raw: string): QueryKind {
  const q = raw.trim()
  const dig = DIG.exec(q)
  if (dig) return { kind: 'dig', domain: dig[2]!.toLowerCase(), record: dig[3]!.toUpperCase() }
  if (IPV4.test(q) || (q.includes(':') && q.split(':').length > 2 && IPV6.test(q))) return { kind: 'ip', ip: q }
  const bang = BANG.exec(q)
  if (bang) return { kind: 'bang', bang: bang[1]!.toLowerCase(), rest: (bang[2] ?? '').trim() }
  return { kind: 'search' }
}

export interface Suggestion {
  /** what the omnibox row shows */
  text: string
  /** secondary line (DNS answer, geolocation, entity annotation) */
  annotation?: string
  /** https image (flag, entity thumbnail) */
  image?: string
  /** set when the engine offers a direct redirect */
  href?: string
  /** engine type tag, e.g. ENTITY, QUERY */
  type?: string
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

function httpsUrl(v: unknown): string | undefined {
  const s = str(v)
  if (!s) return undefined
  try {
    const u = new URL(s)
    return u.protocol === 'https:' ? u.toString() : undefined
  } catch {
    return undefined
  }
}

function flatten(x: unknown, out: unknown[] = []): unknown[] {
  if (Array.isArray(x)) for (const y of x) flatten(y, out)
  else out.push(x)
  return out
}

/**
 * Normalise search.emu.sh's `type=json` reply (an array — sometimes nested —
 * of { suggestion, suggestType, suggestDetail: { t, a, i }, suggestRelevance })
 * into display rows. Untrusted input: only strings are kept, only https image
 * and redirect URLs survive, rows are de-duplicated and capped.
 */
export function parseSuggestions(json: unknown, limit = 8): Suggestion[] {
  const rows: (Suggestion & { rel: number })[] = []
  const seen = new Set<string>()
  for (const item of flatten(json)) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const raw = str(r.suggestion)
    if (!raw) continue
    const d = (r.suggestDetail && typeof r.suggestDetail === 'object' ? r.suggestDetail : {}) as Record<string, unknown>
    let text = raw
    let href: string | undefined
    const redirect = /^!redirect\s+(\S+)/.exec(raw)
    if (redirect) {
      href = httpsUrl(redirect[1])
      text = str(d.t) ?? href ?? raw
    }
    if (seen.has(text)) continue
    seen.add(text)
    const rel = typeof r.suggestRelevance === 'number' ? r.suggestRelevance : 0
    rows.push({
      text,
      annotation: str(d.a) !== text ? str(d.a) : undefined,
      image: httpsUrl(d.i),
      href,
      type: str(r.suggestType),
      rel,
    })
  }
  rows.sort((a, b) => b.rel - a.rel)
  return rows.slice(0, limit).map(({ rel: _rel, ...s }) => s)
}

/** Where Enter goes: the real engine's /search, which applies bangs and engine routing. */
export function searchUrl(q: string): string {
  return `${ENGINE}/search?q=${encodeURIComponent(clampQuery(q))}`
}

/** Same-origin endpoint the demo calls (api/suggest.ts in prod, a Vite proxy in dev). Sends only q. */
export function suggestEndpoint(q: string): string {
  return `/api/suggest?q=${encodeURIComponent(clampQuery(q))}`
}
