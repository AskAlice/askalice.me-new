// Same-origin proxy for the /demos/search omnibox: forwards ?q= to the real
// search.emu.sh JSON suggest endpoint. search.emu.sh sends no CORS headers, so
// the browser can't call it directly.
//
// `useApiKeys=true` is always sent (Alice's call, Oct 2026) so the demo shows
// the keyed features — CryptoCompare prices and the OpenRouter routing — not
// just the keyless ones. Because those keys cost money, the proxy guards them:
// fixed upstream host (redirects refused), only `q` is accepted (any other
// parameter is a 400, so variants can't split the edge cache), q is 1–200 code
// points, a per-IP rate limit (5/s and 100/min, Alice's numbers; IPv6 counted
// per /64), a 6 s timeout, JSON-only relay, and a 60 s edge cache so repeated
// queries never reach the upstream. No caller headers or cookies are passed
// through, and this function's logs never include the query (Vercel's own
// request log still records the URL).
//
// The limiter is per function instance; a Vercel Firewall rate-limit rule on
// /api/suggest is the global backstop.
const UPSTREAM = 'https://search.emu.sh/suggest'
const MAX_QUERY = 200
const TIMEOUT_MS = 6000
/** Per-IP limits, per function instance: [max requests, window ms]. */
export const LIMITS: readonly (readonly [number, number])[] = [
  [5, 1_000],
  [100, 60_000],
]

// Best-effort, in-memory fixed windows: each warm instance keeps its own
// counters. It caps a single client hammering one instance; the edge cache
// absorbs repeated queries.
const hits = new Map<string, { n: number; reset: number }[]>()
/** Most clients tracked at once; memory stays bounded under a spray of IPs. */
export const MAX_TRACKED = 5000

/** Clients currently tracked (for tests and logs). */
export function trackedCount(): number {
  return hits.size
}

/** Drop clients whose windows have all expired; if still full, drop the oldest. */
function prune(now: number): void {
  for (const [k, w] of hits) if (w.every((x) => now >= x.reset)) hits.delete(k)
  for (const k of hits.keys()) {
    if (hits.size < MAX_TRACKED) break
    hits.delete(k)
  }
}

/**
 * Rate-limit key for a client address. IPv4 as-is (IPv4-mapped IPv6 unwrapped);
 * IPv6 by its /64, since one host can rotate through a whole /64.
 */
export function rateKey(ip: string): string {
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip)
  if (mapped) return mapped[1]!
  if (!ip.includes(':')) return ip
  const [head = '', tail] = ip.toLowerCase().split('::')
  const h = head ? head.split(':') : []
  const t = tail ? tail.split(':') : []
  const groups = tail === undefined ? h : [...h, ...Array<string>(Math.max(0, 8 - h.length - t.length)).fill('0'), ...t]
  return groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, '')).join(':') + '::/64'
}

/** True if `ip` is under every limit (and counts this call against each window). */
export function allow(ip: string, now = Date.now()): boolean {
  const key = rateKey(ip)
  let w = hits.get(key)
  if (!w) {
    if (hits.size >= MAX_TRACKED) prune(now)
    w = LIMITS.map(([, ms]) => ({ n: 0, reset: now + ms }))
    hits.set(key, w)
  }
  let ok = true
  LIMITS.forEach(([max, ms], i) => {
    const win = w[i]!
    if (now >= win.reset) Object.assign(win, { n: 0, reset: now + ms })
    win.n += 1
    if (win.n > max) ok = false
  })
  return ok
}

function clientIp(req: Request): string {
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0]!.trim() || req.headers.get('x-real-ip') || 'unknown'
}

function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra },
  })
}

/** The fixed upstream URL for a (validated) query. The dev proxy in vite.config.ts uses it too. */
export function upstreamUrl(q: string): string {
  return `${UPSTREAM}?type=json&client=chrome-omni&useApiKeys=true&q=${encodeURIComponent(q)}`
}

/** GET /api/suggest?q=… → search.emu.sh /suggest?type=json&useApiKeys=true&q=… */
export async function GET(req: Request): Promise<Response> {
  const params = new URL(req.url).searchParams
  if ([...params.keys()].some((k) => k !== 'q')) return json(400, { error: 'only the q parameter is accepted' })
  const q = (params.get('q') ?? '').trim()
  if (!q || Array.from(q).length > MAX_QUERY) return json(400, { error: `q must be 1–${MAX_QUERY} characters` })
  if (!allow(clientIp(req))) {
    console.warn('[suggest] WARNING rate limited')
    return json(429, { error: 'Too many lookups — slow down a little.' }, { 'retry-after': '1' })
  }

  const started = Date.now()
  try {
    const up = await fetch(upstreamUrl(q), {
      headers: { accept: 'application/json' },
      redirect: 'error', // never follow upstream off the fixed host
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!up.ok) {
      console.warn(`[suggest] WARNING upstream status=${up.status} ms=${Date.now() - started}`)
      return json(502, { error: `search.emu.sh answered ${up.status}` })
    }
    const body = await up.text()
    JSON.parse(body) // reject non-JSON (error pages) before relaying
    console.info(`[suggest] INFO ok bytes=${body.length} ms=${Date.now() - started}`)
    return new Response(body, {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, s-maxage=60, max-age=0' },
    })
  } catch (e) {
    const timedOut = e instanceof Error && e.name === 'TimeoutError'
    console.error(`[suggest] ERROR ${timedOut ? 'timeout' : 'bad upstream response'} ms=${Date.now() - started}`)
    return json(timedOut ? 504 : 502, { error: timedOut ? 'search.emu.sh timed out' : 'search.emu.sh sent an unreadable reply' })
  }
}
