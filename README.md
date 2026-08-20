# askalice.me — redesign

Alice Knag's personal portfolio, built from the Claude Design handoff
("Hi-Fi Resume Design for AskAlice"). Single-page portfolio with a live
GLSL hero, interactive demos, writing, and a downloadable résumé.

## Stack

- **React 19 + TypeScript + Vite**
- **three.js + @react-three/fiber + @react-three/drei** — the generative
  shaders render on a drei `<ScreenQuad>` (full-screen triangle) with a
  `RawShaderMaterial`, so the handoff's GLSL runs verbatim
- **zustand** — view state (`home / blog / post / demo`), shader editor
  state, live fragment source
- **UnoCSS** — design tokens from the handoff (colors, Space Grotesk /
  JetBrains Mono, spacing) as theme + utilities

## Signature feature

The hero renders a domain-warped FBM "oil-slick" fragment shader
(6 octaves, thin-film iridescence — palette **Flamingo**, intensity
**Hyper**). The `</> edit shader` button opens a floating glass editor
bound to the live source: every keystroke re-validates against the real
WebGL context; a good edit hot-swaps the program, a bad one keeps the
last good program rendering and surfaces the compile error.

## Develop

```sh
npm install
npm run dev
```

## Deploy

```sh
docker compose up -d --build   # serves on :8087
```

## Notes from the handoff

- Blog posts are placeholder prose; some demo repo links point at the
  GitHub profile — swap in real writing/URLs before launch.
- Subpages are client-side state (per the prototype). The handoff
  recommends real routes (`/writing`, `/writing/[slug]`, `/demos/[slug]`)
  for linkability/SEO if this graduates from a prototype port.
