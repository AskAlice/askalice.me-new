# AI Studio draft → askalice.me: merge notes

## Purpose

`remix-remix-alice-knag-portfolio-&-sre-console.zip` is a Google AI Studio
rewrite of this site: React 19, Tailwind v4, `motion`, `lucide-react`, and an
Express `server.ts`. These notes record which parts are worth keeping and how
they map onto this codebase. Three stacked example branches show the result.
None of them is merged to `main`.

| Branch | Based on | What it shows |
| --- | --- | --- |
| `ai-studio/a-hero-nav-perf` | `origin/main` (`826ee73`, includes the X26 Ultra teardown post) | Raw-WebGL hero (three.js removed), mobile menu, scroll-spy, stats strip, phone fixes |
| `ai-studio/b-experience-services` | branch A | Expandable roles with the Section.io capture, Services section, schema.org graph built from content |
| `ai-studio/c-demos` | branch B | Affiliation logos, the "I Promise" music player, the PCB board slideshow, a live search.emu.sh omnibox, merged repo cards, and the border fix |

Each branch builds on the one before it, so checking out C shows everything
together. You can still take A, or A + B, by themselves.

## Usage

```sh
git fetch origin
git switch ai-studio/c-demos   # or ai-studio/b-experience-services, ai-studio/a-hero-nav-perf
npm ci
npm test          # vitest
npm run dev       # http://localhost:5173
```

The zip itself stays untracked. Nothing in any branch reads from it.

In dev, Vite proxies `/api/suggest` to search.emu.sh, so the omnibox demo is
live. In production, `api/suggest.ts` does the same job as a Vercel function.

### All three side by side on the tailnet

`claude-demos.sh` (kept outside the repo, in `~/Downloads`) checks each branch
out into its own worktree under `~/code/askalice-demos/`, runs its dev server on
127.0.0.1, and shares it on the tailnet with `tailscale serve` (tailnet only, never
Funnel):

| Branch | Local | Tailnet |
| --- | --- | --- |
| A | http://localhost:5181 | https://alice-mac.rhinoceros-dab.ts.net:8181/ |
| B | http://localhost:5182 | https://alice-mac.rhinoceros-dab.ts.net:8182/ |
| C | http://localhost:5183 | https://alice-mac.rhinoceros-dab.ts.net:8183/ |

```sh
bash ~/Downloads/claude-demos.sh          # (re)start; re-run to pick up new commits
bash ~/Downloads/claude-demos.sh --stop   # stop the servers, remove the serve handlers
```

- **Tailscale lookup.** The script reads the Mac's MagicDNS name from `tailscale status --json`, so the links it prints are authoritative.
- **Host check.** It passes that name to Vite via `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`. Vite then accepts that one host and still rejects any other Host header with 403.
- **Restarts.** It restarts only servers whose working directory is under `~/code/askalice-demos/`.
- **Dependencies.** It runs `npm ci` only when a branch's lockfile changed.
- **Serve config.** `tailscale serve --bg` stays configured across reboots until `--stop`. Anything that later listens on 5181–5183 is reachable from the tailnet on 8181–8183.
- **Tailnet exposure.** Anyone your tailnet ACLs let reach this Mac can read the branch's source and `node_modules`, and can spend the API keys through the dev proxy.

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
| `Logos.tsx` + `AffiliationLogos` | You approved the marks ("logos are fine") | C: strip under the stats. Subtitles follow the résumé |
| `HarmorMusicVisualization` ("I Promise") | Your own track, and a real spectrogram | C: `/demos/music`, rebuilt (see Example C) |
| `PcbSwarmSlideshow` | Better than a GIF carousel | C: `/demos/pcbs`, with specs re-sourced from the repo README |
| `SearchEmuShowcase` | An omnibox you can type into | C: `/demos/search`, wired to the real engine |
| `FeaturedProjects` repo cards | More of your repos | C: `GITHUB_CARDS`, with descriptions checked against each README |

### Dropped

| Draft piece | Problem |
| --- | --- |
| `Contact.tsx` form | `handleSubmit` only runs `setTimeout` and **sends nothing**. Visitors would think they'd reached you. It also published a phone number and claimed "PGP Signatures Enabled" |
| `server.ts` `/api/cmd` console | Made-up `kubectl` pods, uptime and packet counts. It's also Express, so it doesn't run on Vercel |
| `react-three-midi-poster.jpg` | An AI-generated image with garbled UI text ("PADATOR", "NALLHRRR") presented as a screenshot of the project |
| Hero copy ("Systems that don't fail…") and role ticker | Generic copy. The ticker listed "University of Arizona (Pre-Law)" as a current role |
| Inflated metrics | "<20ms TTFB" (the résumé says sub-200ms), ">99.99% contractual SLA", "800MB → 45MB", "PCI DSS / SOC 2 / HIPAA", "11 Production KiCad Boards" (none are fabbed yet), U of A as "2023 — Present" (it was Jan–Jun 2024) |
| `SkillsCloud` percentage bars | Self-rated skill percentages read as filler |
| Button-based navigation | `<button onClick={scrollIntoView}>` gives crawlers nothing to follow. Every nav entry here stays a real `<a href>` |
| `index.html` fetch-descriptor hack, `@google/genai`, `express`, `dotenv` | Leftovers from the AI Studio iframe. The Gemini SDK was never used |
| `AnimatedSVGBackground` | Animates all the time behind every section, at a constant cost, for little visual payoff |

### Not ported

| Draft piece | Why |
| --- | --- |
| `ReactThreeMidiDemo` | Its click-to-launch cover was the AI-generated poster. The current tile already embeds the real GitHub Pages build |
| `FeaturedProjects` case-study cards (Sony / Peklava / Section) | Inflated metrics (see Dropped). The repo cards from the same component were ported |

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
- **StatsBar**: the four numbers restate `ROLES`. The count-up is pure CSS:
  the digits are `::after` generated content driven by an animatable `--n`.
  JS only flips `data-phase`. Because the DOM text never holds an in-between
  value, crawlers and screen readers read the real figure from the sr-only
  line. A strip that's already on screen (or skipped via a deep link) shows
  the final values. It is hidden in the `VITE_EMU_LLC` variant, which has no
  Experience section.
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

## Example C: `ai-studio/c-demos`

- **Music, `/demos/music`** (`MusicDemo.tsx`, its own lazy chunk):
  - The spectrogram scrubs on click, drag and arrow keys (ARIA slider).
  - Hovering shows the pitch, level and partials at that moment.
  - The MP3 is self-hosted at `public/media/music/i-promise.mp3`. It's your copy of the emu.bz file, 320 kbps, 8.3 MB.
  - Because the MP3 is same-origin, the Web Audio `AnalyserNode` spectrum always works. The draft's spectrum was generated from `sin()` beats plus pink noise.
  - The MP3 preloads (`preload="auto"`) as soon as the page mounts, with a progress readout. Hovering the home-page card prefetches the player chunk.
  - **Precomputed pitch data.** `scripts/analyze-track.py` decodes the MP3 and writes `src/lib/music/i-promise.json` plus the spectrogram WebP. It produces 830 slices, one every 0.25 s, each with level, dominant pitch (harmonic product spectrum), note and partials H1–H8. The method is documented in the script; re-run it if the track changes.
  - The draft's own numbers were checked against the real audio. Its loudness matched (r≈0.93), but none of its pitch values did, so all of its data was replaced.
  - BPM (115), year (2021) and "FL Studio 20" are read from the MP3's ID3 tags. The draft's "F# minor" and its arrangement sections stay out.
  - The page carries `MusicRecording` schema.org markup.
- **PCB slideshow, `/demos/pcbs`** (`PcbSlideshow.tsx`, data in `lib/pcbBoards.ts`):
  - All 12 boards are included, GaragePilot C6 among them. Turntable or top-render view, prev/next, board chips, arrow keys, and autoplay that pauses on hover or focus and is off for reduced motion.
  - The specs come from the repo README (commit `102b9fb`). The draft got several wrong: SPS30 on AirQuality, CR2450 on ThreadNode, ST7789 on LEDHub, a 16 A relay on RelayMini.
  - Only neighbouring images preload. The draft fetched every GIF, about 20 MB, at page load.
- **Omnibox, `/demos/search`** (`OmniboxDemo.tsx`, `lib/omnibox.ts`, `api/suggest.ts`):
  - Typing queries the real search.emu.sh `/suggest?type=json` through a same-origin proxy. search.emu.sh sends no CORS headers, so the browser can't call it directly.
  - The proxy always sends `useApiKeys=true` (your call), so crypto prices and LLM routing work.
  - Only `q` is accepted, capped at 200 characters (counted in code points, so an emoji is never cut in half). Any other parameter gets a 400, so variants can't split the edge cache.
  - Per-IP rate limit: 5/s and 100/min, with IPv6 counted per /64. When the table fills, it drops expired clients first instead of resetting everyone. The limit is per function instance, so a Vercel Firewall rule is the global backstop (see Still open).
  - 60 s edge cache, 6 s timeout, redirects refused, JSON-only relay.
  - The dev proxy builds the same upstream URL (`upstreamUrl` from `api/suggest.ts`) and forwards only `host` and `accept`. Cookies and the `Tailscale-User-*` headers that `tailscale serve` adds never reach search.emu.sh.
  - Enter opens the real `/search`.
  - The label under the input uses the engine's own dig, IP and bang patterns.
  - The draft's canned answers and its `Function()` math evaluator are gone.
- **Repo cards**: search.emu.sh, react-three-midi, yksofttoken (described as your fork: rewritten in Go with a Fyne GUI) and TTR-Tools were added. oh-my-comma now links to its repo instead of your profile.
- **Border fix**: `presetUno` ships no CSS reset, so `border` only set `border-width` and borders never drew. One preflight rule in `styles.css` makes the design's intended borders show site-wide, plus a reset for default button chrome.

## Verification

| Check | main | A | B | C |
| --- | --- | --- | --- | --- |
| `npm test` | — | 7 / 7 | 60 / 60 | 132 / 132 |
| `tsc -b` | ✓ | ✓ | ✓ | ✓ |
| JS on first load (gzip) | 128 KB + 233 KB lazy three.js | 131 KB | 133 KB | 136 KB (+ 3–5 KB per demo page; music page 25 KB incl. pitch data) |
| Horizontal overflow at 390 px | yes (nav) | none | none | none |

The branches were also driven in headless Chromium:
- the shader compiles, swaps on edit, and keeps drawing through a broken edit
- the scroll-spy follows Work → Demos → Writing → Résumé
- `/photography`, `/writing` and Back route correctly
- the mobile menu opens, navigates, closes on Escape, and scrolls in landscape
- `/services` deep-links to the section
- a single `#jsonld` node is swapped per route
- the Section capture plays WebM in Chromium, with MP4 as the fallback
- C: the omnibox renders engine-shaped results, keyboard selection works, and errors show the error state
- C: the slideshow steps by button and arrow key, flags RelayMini's mains warning, and has no GaragePilot turntable
- C: the music player preloads the self-hosted MP3, draws a real analyser spectrum, and seeks by click, drag and arrow keys. search.emu.sh was stubbed in these runs, because the sandbox can't reach it
- After the rebase onto `826ee73`: the X26 Ultra post renders on C with `BlogPosting` JSON-LD, `/blog` shows it, and no page errors were logged
- `claude-demos.sh` was run end to end in an isolated home directory, with a stand-in `tailscale` CLI. The run covered first start, re-run (restart without reinstall) and `--stop`. Vite answered 200 for the MagicDNS host and 403 for any other host

A separate reviewer agent read both diffs and found no blockers. Its
should-fix items were applied in follow-up commits.

A second security review (Oct 9) covered the search proxy and the demo script. Its fixes have been applied:
- **Vite file serving.** `server.fs.allow` now pins Vite's file serving to the project, on all three branches. Before this, a parent folder that looks like a workspace exposed its files over `/@fs/` to the tailnet. This was checked: such a file returned 200 before the change and 403 after.
- **Search proxy:**
  - only `q` is accepted
  - limits count code points
  - IPv6 is counted per /64
  - the table is pruned instead of cleared
  - upstream redirects are refused
- **Dev proxy.** It now strips caller headers and clamps emoji safely. A run against a local echo upstream confirmed it sends only `host` and `accept`, with a 200-code-point `q`.
- **Demo script.** Its restart and worktree steps no longer abort the run partway.

## Decided (Oct 9)

- **Approved:**
  - the FL Studio / Harmor credit
  - the Kimi line on the boards
  - "Twelve boards"
  - the Section console recording (OK to publish)
- **Services** name Emu LLC as the contracting company, and schema.org lists Emu LLC as the `provider`.
- **`useApiKeys=true`**, rate-limited at 5/s and 100/min per IP.
- **The MP3** is copied into the site.

## Still open

- **search.emu.sh honours `useApiKeys=true` from anyone** (`src/routes/suggest.ts:117`, `search.ts:18`), and its own OpenSearch descriptor advertises the flag. So the limits in this proxy don't protect the paid keys: anyone can call search.emu.sh directly. Fix that in search.emu.sh, for example by using the keys only when a secret header is present (the proxy would send it from a Vercel env var), plus a daily cap.
- **search.emu.sh logs `CRYPTOCOMPARE_KEY` in plain text** on every suggest request (`src/routes/suggest.ts:153`). That's a separate repo, so nothing was changed there. Remove the log line and consider rotating the key.
- **Vercel Firewall rule** on `/api/suggest` as the global rate limit. The in-function limit is per instance. This is a dashboard setting.
- Vercel's own request log, and any log drain, records `/api/suggest?q=…`. When the OTel fetch instrumentation lands, drop `q` from the recorded URL.

- Your part in the Section traffic map. The caption stays neutral ("Section console, Dec 2020") until you say what you built.
- The two Sony and Section bullets that came from the draft (below).

## Needs your call (original list)

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
4. **C content.** These things came from the draft (likely your words) and were kept:
   - the FL Studio/Harmor credit on the track
   - "Boards brainstormed and generated with AI tooling (Kimi)"

   Two things changed on the site, so they no longer match the résumé PDF:
   - "Eleven boards" became "Twelve" (GaragePilot was added to the repo)
   - yksofttoken is described as your fork of arr2036's tool
5. ~~emu.bz CORS~~: resolved by self-hosting the MP3.
6. **Draft-only details not ported**: the phone number on the contact card
   and the "Illustration by Paul Westover" credit under the avatar (it sits
   on a Gravatar identicon).

## Known gaps (in `main` too, out of scope here)

- **Sitemap.** `main`'s `public/sitemap.xml` doesn't list `/blog/counterfeit-x26-ultra-teardown`. B adds the entry, plus a test that fails whenever a post or demo is missing from the sitemap.

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

All three branches are unmerged. To drop one, delete it:
`git push origin --delete ai-studio/c-demos`.

The Oct 9 rebase onto `826ee73` was force-pushed (`--force-with-lease`, `ai-studio/*` only; `main` untouched). The pre-rebase tips were A `830c13c`, B `e018fc2` and C `34307d7`. Restore one with `git push --force origin <sha>:ai-studio/<branch>` while GitHub still has the commit.

If A ever lands and needs reverting, `git revert` its commits. The only
dependency changes are removing `three`, `@react-three/fiber`,
`@react-three/drei` and `@types/three`, and adding `vitest`. The revert
restores the lockfiles.
