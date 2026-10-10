import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { homeGraph, jsonLdScript } from './src/lib/schema'
import { clampQuery } from './src/lib/omnibox'
import { upstreamUrl } from './api/suggest'

/** Headers the dev /api/suggest proxy forwards; everything else is dropped. */
const DEV_PROXY_HEADERS = new Set(['host', 'accept'])

/**
 * Bake the home-page JSON-LD into index.html so crawlers that don't execute
 * JavaScript (social card scrapers, some search bots) still get the Person /
 * WebSite / OfferCatalog graph. <Seo> replaces the same #jsonld element per route.
 * Fails the build if the placeholder goes missing.
 */
function jsonLd(): Plugin {
  return {
    name: 'askalice-jsonld',
    transformIndexHtml(html) {
      if (!html.includes('<!--jsonld-->')) throw new Error('index.html: <!--jsonld--> placeholder missing')
      return html.replace('<!--jsonld-->', jsonLdScript(homeGraph()))
    },
  }
}

/** This project's folder: the only place the dev server may read files from. */
const PROJECT_DIR = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [UnoCSS(), react(), jsonLd()],
  appType: 'spa',
  server: {
    // Dev servers get shared on the tailnet (see docs/ai-studio-merge.md). By
    // default Vite serves /@fs/ from the nearest parent "workspace" folder, so
    // a stray package.json with `workspaces` above the checkout would expose
    // that whole folder. Pin it to this project.
    fs: { allow: [PROJECT_DIR] },
    // Dev stand-in for api/suggest.ts (Vite doesn't run Vercel functions). It
    // builds the same upstream URL from q alone, and like prod sends no caller
    // headers: no cookies, and none of the Tailscale-User-* identity headers
    // `tailscale serve` adds. No rate limit here; it's tailnet-only.
    proxy: {
      '/api/suggest': {
        target: 'https://search.emu.sh',
        changeOrigin: true,
        rewrite: (path) => {
          const u = new URL(upstreamUrl(clampQuery(new URL(path, 'http://dev.local').searchParams.get('q') ?? '')))
          return u.pathname + u.search
        },
        configure: (proxy) =>
          proxy.on('proxyReq', (out) => {
            for (const h of out.getHeaderNames()) if (!DEV_PROXY_HEADERS.has(h)) out.removeHeader(h)
          }),
      },
    },
  },
})
