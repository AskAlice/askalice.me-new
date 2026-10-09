# AI Studio draft → askalice.me: merge notes

## Purpose

`remix-remix-alice-knag-portfolio-&-sre-console.zip` is a Google AI Studio
rewrite of this site: React 19, Tailwind v4, `motion`, `lucide-react`, and an
Express `server.ts`. These notes record which parts are worth keeping and how
they map onto this codebase. Two example branches show the result. Neither one
is merged to `main`.

| Branch | Based on | What it shows |
| --- | --- | --- |
| `ai-studio/a-hero-nav-perf` | `origin/main` (`c5c4630`) | Raw-WebGL hero (three.js removed), mobile menu, scroll-spy, stats strip, phone fixes |
| `ai-studio/b-experience-services` | branch A | Expandable roles with the Section.io capture, Services section, schema.org graph built from content |

B is stacked on A, so checking out B shows everything together. You can still
take A by itself.

## Usage

```sh
git fetch origin
git switch ai-studio/b-experience-services   # or ai-studio/a-hero-nav-perf
npm ci
npm test          # vitest
npm run dev       # http://localhost:5173
```

The zip itself stays untracked. Nothing in either branch reads from it.

## Verdict on the draft

### Kept (adapted to UnoCSS tokens and `AppLink` routing)

| Draft piece | Why it's good | Where it landed |
| --- | --- | --- |
| `ShaderHeroBackground` (raw WebGL) | Draws the same GLSL without three.js. three/R3F/drei were a **233 KB gzip** chunk that only ever drew one triangle | A: `src/components/gl/ShaderCanvas.tsx` |
| Hamburger menu | The current nav overflows at 390 px. "Photography" and "Writing" get cut off | A: `src/components/Nav.tsx` |
| Active-section highlight | Shows where you are on the long home page | A: `src/lib/useActiveSection.ts` (IntersectionObserver, not a scroll loop) |
| Shader editor as a bottom sheet on phones | The panel was 46vw, about 180 px, on a phone | A: `ShaderEditor.tsx` |
| `StatsBar` count-up | A fast at-a-glance strip | A: `StatsBar.tsx`. Only numbers already in `ROLES` |
| `ExperienceTimeline` expanders, Sony/Section wording | More specific than the current one-liners | B: `<details>` in `Experience.tsx` |
| `public/section-geo-balancing.gif` | A real Section.io console capture (Dec 2020). The current site has no visual for that role | B: 140 KB WebM + 135 KB MP4 (the GIF was 1.7 MB) |
| "Services Offered" | Helps the contract business and gives schema.org something to describe | B: `Services.tsx` + `OfferCatalog` in `lib/schema.ts` |

### Dropped

| Draft piece | Problem |
| --- | --- |
| `Contact.tsx` form | `handleSubmit` only runs `setTimeout` and **sends nothing**. Visitors would think they'd reached you. It also published a phone number and claimed "PGP Signatures Enabled" |
| `server.ts` `/api/cmd` console | Made-up `kubectl` pods, uptime and packet counts. It's also Express, so it doesn't run on Vercel |
| Logo SVGs (`Logos.tsx`) | Hand-drawn imitations of the PlayStation, University of Arizona, FL Studio and Section marks. They look off and raise trademark issues |
| `react-three-midi-poster.jpg` | An AI-generated image with garbled UI text ("PADATOR", "NALLHRRR") presented as a screenshot of the project |
| Hero copy ("Systems that don't fail…") and role ticker | Generic copy. The ticker listed "University of Arizona (Pre-Law)" as a current role |
| Inflated metrics | "<20ms TTFB" (the résumé says sub-200ms), ">99.99% contractual SLA", "800MB → 45MB", "PCI DSS / SOC 2 / HIPAA", "11 Production KiCad Boards" (none are fabbed yet), U of A as "2023 — Present" (it was Jan–Jun 2024) |
| `SkillsCloud` percentage bars | Self-rated skill percentages read as filler |
| Button-based navigation | `<button onClick={scrollIntoView}>` gives crawlers nothing to follow. Every nav entry here stays a real `<a href>` |
| `index.html` fetch-descriptor hack, `@google/genai`, `express`, `dotenv` | Leftovers from the AI Studio iframe. The Gemini SDK was never used |
| `AnimatedSVGBackground` | Animates all the time behind every section, at a constant cost, for little visual payoff |

### Worth porting later, after fixes

| Draft piece | What it needs first |
| --- | --- |
| `HarmorMusicVisualization` + `harmor-spectrogram.webp` ("I Promise") | The spectrogram looks real. The "live FFT" is not: it's generated from `sin()` beats plus pink noise, and the track arrangement (Intro/Drop/Climax…) and BPM/key are invented. Port it as `/demos/music` with a real `AnalyserNode` (this needs CORS on `emu.bz`, or self-hosting the MP3). Create the `Audio` on first click. The draft creates it at import with `preload="auto"`, so every visitor downloads the MP3 |
| `PcbSwarmSlideshow` board data | Richer per-board copy (MCU, sensors, status), but the specs need checking against the `home-automation-pcbs` README (e.g. "<5 µA sleep", "SPS30") |
| `SearchEmuShowcase` omnibox simulator | The bang and math resolvers are real logic. DNS, GeoIP and crypto results are hardcoded ("1 BTC = $67,420.50"). Either call search.emu.sh, or label those results as recorded examples |
| `FeaturedProjects` repo cards | `TTR-Tools` and `yksofttoken` could join `GITHUB_CARDS` once the descriptions are confirmed |

## How the draft maps onto this codebase

| Draft | Here |
| --- | --- |
| Tailwind v4 (`@tailwindcss/vite`) | UnoCSS `presetUno`. Most utilities carry over unchanged. Swap draft colors (`slate-950`, `cyber-*`) for theme tokens (`ink`, `card`, `flamingo`, `sky`, …) in `uno.config.ts` |
| `motion/react` | CSS keyframes in `styles.css`, plus IntersectionObserver and `requestAnimationFrame`. No 40 KB animation runtime |
| `lucide-react` | `src/components/icons.tsx` (same stroke style, inlined) |
| Single page with `scrollIntoView` buttons | `AppLink` + History API routes in `lib/routes.ts`. Add new sections to `SECTIONS`, `NAV_ITEMS` and the `vercel.json` SPA rewrite (a test enforces that last one) |
| Express `server.ts` | `api/*.ts` Vercel functions, like `api/proxy.ts` |
| Hardcoded content in components | `src/lib/content.tsx`. `lib/schema.ts` reads the same data |

## Example A: `ai-studio/a-hero-nav-perf`

- **`ShaderCanvas`**: one program on a full-screen triangle, using the same
  `LOOK` uniforms and the same safe recompile (a bad edit shows its error and
  the last good program keeps drawing). It improves on the draft in five ways:
  - shaders and programs are deleted after use
  - it recovers from WebGL context loss
  - a restored context rebuilds the last *good* source
  - it pauses while off-screen
  - it caps DPR at 1.25
- **Nav**: inline links at `lg` and up. Below that, a menu button opens a
  panel that scrolls in landscape. Escape closes it and returns focus to the
  button. `aria-current` is `location` for scroll-spied sections, `page` for
  the current page, and `true` for an ancestor (Writing while on a post).
- **StatsBar**: the four numbers restate `ROLES`. The final values render
  first, and only a strip that mounts below the fold animates. Crawlers and
  reduced-motion users always get the real figures. It is hidden in the
  `VITE_EMU_LLC` variant, which has no Experience section.
- **Fixes found on the way**: the hero copy had no side gutter on phones, and
  the editor was unusable on phones.

## Example B: `ai-studio/b-experience-services`

- **Roles**: a native `<details>` "highlights" disclosure. It needs no JS, and
  the text stays in the DOM for crawlers. The Section.io capture only mounts
  (and downloads) when its disclosure opens.
- **Services**: four cards, each linking to the part of the site that backs
  it up, plus a `mailto:` CTA. Section numbering moves Writing to 05 and
  Résumé to 06.
- **schema.org** (`src/lib/schema.ts`):
  - a `Person` with `worksFor` and `knowsAbout` derived from `ROLES`, plus `alumniOf`
  - `hasOfferCatalog` → `Offer` → `Service`, one per card
  - `WebSite` and `ProfilePage` (`mainEntity` → Person)

  A small Vite plugin bakes the home graph into `index.html` at build time
  for crawlers that skip JavaScript. That replaces the hand-written copy.
  `<Seo>` swaps the same `#jsonld` node per route. Blog, demo and gallery pages
  now name their author (`name` + `url`) instead of an `@id` that didn't
  resolve on those pages.

## Verification

| Check | main | A | B |
| --- | --- | --- | --- |
| `npm test` | — | 12 / 12 | 53 / 53 |
| `tsc -b` | ✓ | ✓ | ✓ |
| JS shipped (gzip) | 128 KB + 233 KB lazy three.js | 131 KB | 133 KB |
| Horizontal overflow at 390 px | yes (nav) | none | none |

Both branches were also driven in headless Chromium:
- the shader compiles, swaps on edit, and keeps drawing through a broken edit
- the scroll-spy follows Work → Demos → Writing → Résumé
- `/photography`, `/writing` and Back route correctly
- the mobile menu opens, navigates, closes on Escape, and scrolls in landscape
- `/services` deep-links to the section
- a single `#jsonld` node is swapped per route
- the Section capture plays WebM in Chromium, with MP4 as the fallback

A separate reviewer agent read both diffs and found no blockers. Its
should-fix items were applied in follow-up commits.

## Needs your call

1. **Claims from the draft that the résumé doesn't support.** These were kept
   in B for you to confirm:
   - Sony: "90+ automated and human tests during phased rollouts of PlayStation system software updates", and having it all in one place instead of several tools. This may also be internal detail.
   - Section.io: deploy pipelines taking provisioning "from hours to minutes, and the human part to seconds".
2. **Section console capture.** Is it OK to publish, and what was your part
   in that traffic map? The caption currently claims nothing beyond "Section
   console, Dec 2020".
3. **Services.** Do you want contract work advertised under your name, or
   under Emu LLC? In the `VITE_EMU_LLC` variant the provider should probably
   be the LLC. Should the dropped offerings from the draft come back:
   security/compliance reviews (U of A Cyber Ops & Pre-Law) and
   apparel/sticker/laser fabrication?
4. **Draft-only details not ported**: the phone number on the contact card
   and the "Illustration by Paul Westover" credit under the avatar (it sits
   on a Gravatar identicon).

## Known gaps (in `main` too, out of scope here)

- **No per-route prerendering.** Google renders JS, but link unfurlers (Slack,
  LinkedIn, X, iMessage) see `index.html`'s home meta for every URL. The
  build-time JSON-LD plugin in B is the first step toward static per-route
  HTML.
- **Observability.** OpenTelemetry spans, OpenReplay, Prometheus metrics and
  GA aren't in `main` or in the draft.
- **nginx deploy only.** `try_files $uri $uri/` can return 403 for `/demos`
  because `public/demos/` is a real directory. Vercel isn't affected.
  `content.tsx` also uses relative asset paths (`photos/…`, `demos/pcbs/…`)
  that break under a trailing-slash URL. New media in B uses absolute
  `/media/…` paths.
- **Dev restarts.** The JSON-LD plugin makes `content.tsx`, `routes.ts` and
  `schema.ts` config dependencies, so editing content restarts the dev server
  instead of hot-reloading.

## Rollback

Both branches are unmerged. To drop one, delete it:
`git push origin --delete ai-studio/b-experience-services`.

If A ever lands and needs reverting, `git revert` its commits. The only
dependency changes are removing `three`, `@react-three/fiber`,
`@react-three/drei` and `@types/three`, and adding `vitest`. The revert
restores the lockfiles.
