// Same-origin proxy for the /demos/search omnibox: forwards ?q= to the real
// search.emu.sh JSON suggest endpoint. search.emu.sh sends no CORS headers, so
// the browser can't call it directly.
//
// Hardening: fixed upstream host, only `q` is forwarded (never `useApiKeys`, so
// Alice's paid CryptoCompare/OpenRouter keys are never used), q is 1–200 chars,
// a 6 s timeout, the body must parse as JSON, and no request headers or
// cookies are passed through. Responses are edge-cached for a minute.
const UPSTREAM = 'https://search.emu.sh/suggest'
const MAX_QUERY = 200
const TIMEOUT_MS = 6000

function json(status: number, body: unknown, cache = 'no-store'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cache },
  })
}

/** GET /api/suggest?q=… → search.emu.sh /suggest?type=json&q=… */
export async function GET(req: Request): Promise<Response> {
  const q = (new URL(req.url).searchParams.get('q') ?? '').trim()
  if (!q || q.length > MAX_QUERY) return json(400, { error: `q must be 1–${MAX_QUERY} characters` })

  const url = `${UPSTREAM}?type=json&client=chrome-omni&q=${encodeURIComponent(q)}`
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
