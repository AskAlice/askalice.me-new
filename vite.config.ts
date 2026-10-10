import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'

/** This project's folder: the only place the dev server may read files from. */
const PROJECT_DIR = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [UnoCSS(), react()],
  appType: 'spa',
  server: {
    // Dev servers get shared on the tailnet (see docs/ai-studio-merge.md). By
    // default Vite serves /@fs/ from the nearest parent "workspace" folder, so
    // a stray package.json with `workspaces` above the checkout would expose
    // that whole folder. Pin it to this project.
    fs: { allow: [PROJECT_DIR] },
  },
})
