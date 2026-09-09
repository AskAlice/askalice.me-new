// Fallback for paths the React app doesn't own: proxy to the legacy droplet,
// sending the visitor's own domain as Host so Apache picks the right vhost.
import { request as httpRequest } from 'node:http'
import { Readable } from 'node:stream'

const ORIGIN = '45.55.156.110'
const HOP = new Set(['connection', 'keep-alive', 'transfer-encoding', 'content-length', 'host'])

function vhost(host: string | null): string {
  return /(^|\.)alice\.engineer$/.test(host ?? '') ? 'alice.engineer' : 'askalice.me'
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

  return new Promise((resolve, reject) => {
    const up = httpRequest(
      { host: ORIGIN, port: 80, method: req.method, path: path + url.search, headers },
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
