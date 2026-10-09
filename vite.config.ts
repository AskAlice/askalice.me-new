import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { homeGraph, jsonLdScript } from './src/lib/schema'

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
    // dev stand-in for api/suggest.ts (Vite doesn't run Vercel functions):
    // /api/suggest?type=json&q=… → https://search.emu.sh/suggest?type=json&q=…
    proxy: {
      '/api/suggest': {
        target: 'https://search.emu.sh',
        changeOrigin: true,
        // mirror api/suggest.ts: take only q from the caller, always useApiKeys=true
        rewrite: (path) => {
          const q = new URL(path, 'http://dev.local').searchParams.get('q') ?? ''
          return `/suggest?type=json&client=chrome-omni&useApiKeys=true&q=${encodeURIComponent(q.slice(0, 200))}`
        },
      },
    },
  },
})
