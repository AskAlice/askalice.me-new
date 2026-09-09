// Fallback for paths the React app doesn't own: proxy to the legacy droplet,
// sending the visitor's own domain as Host so Apache picks the right vhost.
import { request as httpsRequest } from 'node:https'
import { Readable } from 'node:stream'
import { connect as tlsConnect, type TLSSocket } from 'node:tls'

const ORIGIN = '45.55.156.110'
// SHA-256 of the droplet's current cert. It expired 2025-09-04 and can't renew via HTTP-01
// (Vercel intercepts /.well-known/acme-challenge), so chain validation is replaced by this
// pin. When the droplet gets a DNS-01 cert: drop the pin, set rejectUnauthorized: true.
const PIN = '56:8D:21:DA:65:DB:F5:93:13:2F:12:42:94:94:40:AF:42:B3:6E:6A:D2:B3:6A:D4:13:98:CD:4D:B0:FA:E8:70'
const HOP = new Set(['connection', 'keep-alive', 'transfer-encoding', 'content-length', 'host'])

function vhost(host: string | null): string {
  return /(^|\.)alice\.engineer$/.test(host ?? '') ? 'alice.engineer' : 'askalice.me'
}

// Handshake and verify the pin before the HTTP client writes a single byte upstream.
function pinnedSocket(servername: string): Promise<TLSSocket> {
  return new Promise((resolve, reject) => {
    const s = tlsConnect({ host: ORIGIN, port: 443, servername, rejectUnauthorized: false }, () => {
      if (s.getPeerCertificate().fingerprint256 === PIN) resolve(s)
      else {
        s.destroy()
        reject(new Error('upstream cert pin mismatch'))
      }
    })
    s.on('error', reject)
  })
}

async function proxy(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = '/' + (url.searchParams.get('p') ?? '')
  url.searchParams.delete('p')
  const host = vhost(req.headers.get('host'))

  const headers: Record<string, string> = {}
  req.headers.forEach((v, k) => {
    if (!HOP.has(k)) headers[k] = v
  })
  headers.host = host
  headers['x-forwarded-host'] = host
  headers['x-forwarded-proto'] = 'https'

  const body = req.method === 'GET' || req.method === 'HEAD' ? null : Buffer.from(await req.arrayBuffer())
  if (body) headers['content-length'] = String(body.length)

  const socket = await pinnedSocket(host)
  return new Promise((resolve, reject) => {
    const up = httpsRequest(
      { createConnection: () => socket, method: req.method, path: path + url.search, headers },
      (res) => {
        const out = new Headers()
        for (let i = 0; i < res.rawHeaders.length; i += 2) {
          const k = res.rawHeaders[i].toLowerCase()
          if (!HOP.has(k)) out.append(k, res.rawHeaders[i + 1])
        }
        const stream = req.method === 'HEAD' ? null : (Readable.toWeb(res) as ReadableStream)
        resolve(new Response(stream, { status: res.statusCode ?? 502, headers: out }))
      },
    )
    up.on('error', reject)
    up.end(body)
  })
}

export const GET = proxy
export const HEAD = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const OPTIONS = proxy
