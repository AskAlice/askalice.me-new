// Same-origin proxy for the /demos/search omnibox: forwards ?q= to the real
// search.emu.sh JSON suggest endpoint. search.emu.sh sends no CORS headers, so
// the browser can't call it directly.
//
// `useApiKeys=true` is always sent (Alice's call, Oct 2026) so the demo shows
// the keyed features — CryptoCompare prices and the OpenRouter routing — not
// just the keyless ones. Because those keys cost money, the proxy guards them:
// fixed upstream host, only `q` is taken from the caller (any useApiKeys/type
// the caller sends is ignored), q is 1–200 chars, a per-IP rate limit
// (5/s and 100/min, Alice's numbers), a 6 s
// timeout, JSON-only relay, and a 60 s edge cache so repeated queries never
// reach the upstream. No caller headers or cookies are passed through, and
// logs never include the query.
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

/** True if `ip` is under every limit (and counts this call against each window). */
export function allow(ip: string, now = Date.now()): boolean {
  let w = hits.get(ip)
  if (!w) {
    if (hits.size > 5000) hits.clear() // bound memory under a spray of IPs
    w = LIMITS.map(([, ms]) => ({ n: 0, reset: now + ms }))
    hits.set(ip, w)
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

/** GET /api/suggest?q=… → search.emu.sh /suggest?type=json&useApiKeys=true&q=… */
export async function GET(req: Request): Promise<Response> {
  const q = (new URL(req.url).searchParams.get('q') ?? '').trim()
  if (!q || q.length > MAX_QUERY) return json(400, { error: `q must be 1–${MAX_QUERY} characters` })
  if (!allow(clientIp(req))) {
    console.warn('[suggest] WARNING rate limited')
    return json(429, { error: 'Too many lookups — slow down a little.' }, { 'retry-after': '1' })
  }

  const url = `${UPSTREAM}?type=json&client=chrome-omni&useApiKeys=true&q=${encodeURIComponent(q)}`
  const started = Date.now()
  try {
    const up = await fetch(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(TIMEOUT_MS) })
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
