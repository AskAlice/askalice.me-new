// Site content from the handoff. Experience/skills/education are real (from
// Alice's résumé). Post bodies live in src/lib/posts/.
import type { ReactNode } from 'react'
import type { DemoId, PostId } from '../store'

export const GRAVATAR =
  'https://www.gravatar.com/avatar/7e8424af9fd6e554097bf27be66b54aae7c340bc3480180357a07202b61380d4'

export const LINKS = {
  github: 'https://github.com/AskAlice',
  linkedin: 'https://www.linkedin.com/in/aliceknag',
  riseintime: 'https://riseintime.com/',
  resumePdf: 'uploads/alice-knag-resume-2026-2.pdf',
  email: 'alice@askalice.me',
}

export interface Role {
  title: string
  company: string
  companyColor: string
  badgeBg: string
  badge: ReactNode
  dates: string
  location: string
  current?: boolean
  description: string
  tags: string[]
  /** extra detail behind a disclosure; wording from the AI Studio draft, fact-checked against the résumé */
  highlights?: string[]
  /** looping screen capture shown inside the disclosure */
  media?: { webm: string; mp4: string; poster: string; alt: string; caption: string }
}

export const ROLES: Omit<Role, 'badge'>[] = [
  {
    title: 'Co-Founder · Managing Partner',
    company: 'Colorado Asset Management, LLC',
    companyColor: '#f5a66f',
    badgeBg: 'rgba(245,166,111,0.16)',
    dates: '2026 — now',
    location: 'Colorado',
    current: true,
    description:
      'Co-founded an automotive partnership acquiring and reconditioning vehicles for resale and Turo rentals. Manage sourcing, pricing, maintenance, listings, guest operations and unit economics for 3 vehicles under management, expanding to 6.',
    tags: ['Vehicle sourcing', 'Fleet operations', 'Turo', 'Unit economics'],
  },
  {
    title: 'Hardware incubator · IoT',
    company: 'Independent',
    companyColor: '#6ee7b7',
    badgeBg: 'rgba(110,231,183,0.16)',
    dates: '2026 — now',
    location: 'Denver · Boulder',
    current: true,
    description:
      'Standing up an early-stage, revenue-first hardware incubator — Tindie, emu.sh, eBay, and Amazon before any VC ask. Designing an open KiCad swarm of ESP32-C3/C6/S3/H2 room nodes for ESPHome, Matter/Thread, Zigbee, BLE, and Wi-Fi, with SparkFun and Colorado PCB Assembly as partners in motion. Twelve boards on GitHub so far; none fabbed yet.',
    tags: ['KiCad', 'ESP32', 'ESPHome', 'Matter', 'JLCPCB'],
  },
  {
    title: 'Software Engineer',
    company: 'Peklava, LLC',
    companyColor: '#ff8aa0',
    badgeBg: 'rgba(245,112,138,0.16)',
    dates: '2023 — now',
    location: 'Remote',
    current: true,
    description:
      'Engineer scalable lead-gen systems for RateZip and FHA.com — 80k+ leads a year across Google, Facebook and programmatic channels. Built automated mortgage rate-comparison tools and funnels driving 1M+ referrals, plus landing pages and API integrations that cut acquisition cost 35% while holding sub-200ms responses.',
    tags: ['React', 'Node', 'API design', 'Conversion', 'Programmatic'],
  },
  {
    title: 'Software Engineer',
    company: 'Sony Interactive — PlayStation',
    companyColor: '#8fc9f5',
    badgeBg: 'rgba(143,201,245,0.16)',
    dates: '2022 — 2023',
    location: 'San Francisco · Remote',
    description:
      'Full-stack on PlayStation web platforms. Built a front-end table that scrolls, sorts and fuzzy-searches 50,000+ rows without lag, plus a details page aggregating and visualizing the progress of many related CI/CD automations.',
    tags: ['TypeScript', 'React', 'Nest.js', 'Prisma', 'Kubernetes', 'Figma'],
    // From the AI Studio draft (not in the résumé) — confirm before merging; may be Sony-internal detail.
    highlights: [
      'One front end for the 90+ automated and human tests that run during phased rollouts of PlayStation system software updates.',
      'Release schedules, rollout phases and test progress in one place, instead of spread across several tools.',
    ],
  },
  {
    title: 'Full-Stack Software Engineer',
    company: 'Section.io',
    companyColor: '#b3a4f7',
    badgeBg: 'rgba(179,164,247,0.16)',
    dates: '2019 — 2021',
    location: 'Boulder, CO',
    description:
      'Poached straight out of college. Built reverse-proxy modules, automated deploy pipelines and full metrics stacks; ran a PagerDuty on-call rotation as a platform reliability engineer.',
    tags: ['Prometheus', 'Grafana', 'Terraform', 'Golang', 'Kubernetes'],
    // First bullet's wording is from the AI Studio draft (not in the résumé) — confirm before merging.
    highlights: [
      'Automated deploy pipelines that took edge provisioning from hours to minutes, and the human part of it to seconds.',
      'Built and ran full metrics stacks on Prometheus and Grafana.',
    ],
    media: {
      webm: '/media/section/traffic-map.webm',
      mp4: '/media/section/traffic-map.mp4',
      poster: '/media/section/traffic-map.jpg',
      alt: 'Section.io console: requests per region drawn as columns rising from a world map, with a 24-hour timeline scrubber',
      caption: 'Section console, Dec 2020: requests per regional PoP group over a world map.', // confirm OK to publish
    },
  },
  {
    title: 'Freelance · Sysadmin · Design',
    company: 'Independent · CU Boulder',
    companyColor: '#ffd47e',
    badgeBg: 'rgba(255,212,126,0.16)',
    dates: '2014 — 2019',
    location: 'CO · LA',
    description:
      'Designed and built interactive tools with React, Pixi.js, GraphQL and Golang. Administered faculty web servers at CU Boulder (RHEL, Ansible, LAMP), and built SEO marketing sites and sales funnels clearing $100k/mo — logos and home pages included.',
    tags: [],
  },
]

/**
 * Headline numbers for the stats strip (layout idea from the AI Studio draft).
 * Every figure restates a claim already in ROLES above — no new metrics. The
 * draft's "<20ms TTFB" was dropped: the résumé says sub-200ms.
 */
export const STATS: { value: number; prefix?: string; suffix: string; label: string; source: string; color: string }[] = [
  { value: 80, suffix: 'k+', label: 'leads a year', source: 'Lead-gen for RateZip & FHA.com', color: '#ff8aa0' },
  { value: 1, suffix: 'M+', label: 'referrals driven', source: 'Rate-comparison tools & funnels', color: '#ffd47e' },
  { value: 35, suffix: '%', label: 'lower acquisition cost', source: 'Landing pages & API integrations', color: '#7fe0b0' },
  { value: 50, suffix: 'k+', label: 'rows without lag', source: 'Sort + fuzzy search at PlayStation', color: '#8fc9f5' },
]

export interface Service {
  id: string
  title: string
  blurb: string
  deliverables: string[]
  /** where the claim is backed up on this site */
  proof: { label: string; href: string }
  color: string
}

/**
 * Contract services. Structure from the AI Studio draft's "Services Offered";
 * copy trimmed to what ROLES and the demos already show. Dropped from the
 * draft pending Alice's confirmation: security/compliance audits,
 * apparel/sticker/laser fabrication, ">99.99% SLA", "<20ms TTFB".
 */
export const SERVICES: Service[] = [
  {
    id: 'frontend',
    title: 'Front-end & WebGL',
    blurb: 'Interfaces that stay fast with a lot of data on screen, and visuals that make people stop scrolling.',
    deliverables: [
      'Data-dense React UIs: virtualized tables, fuzzy search, dashboards',
      'WebGL / three.js shaders and interactive demos',
      'Motion and layout animation that never janks',
    ],
    proof: { label: 'live demos', href: '/demos' },
    color: '#ff8aa0',
  },
  {
    id: 'platform',
    title: 'Platform & reliability',
    blurb: 'Deploy pipelines, metrics stacks and on-call habits from platform reliability work at Section.io.',
    deliverables: [
      'CI/CD and infrastructure as code (Terraform, Ansible)',
      'Kubernetes workloads and reverse-proxy configuration',
      'Prometheus + Grafana metrics, alerting and runbooks',
    ],
    proof: { label: 'Section.io work', href: '/work' },
    color: '#b3a4f7',
  },
  {
    id: 'growth',
    title: 'Lead-gen & conversion',
    blurb: 'Landing pages, comparison tools and API integrations measured in leads and acquisition cost.',
    deliverables: [
      'High-converting landing pages and funnels',
      'Calculators and rate-comparison tools',
      'Ad-platform and partner API integrations',
    ],
    proof: { label: 'Peklava work', href: '/work' },
    color: '#ffd47e',
  },
  {
    id: 'hardware',
    title: 'Hardware & IoT prototyping',
    blurb: 'Early-stage ESP32 room nodes in KiCad, from schematic to rendered layout. Designs so far, not production runs.',
    deliverables: [
      'KiCad schematics and PCB layout for ESP32-C3/C6/S3/H2',
      'Board designs targeting ESPHome, Matter/Thread and Zigbee',
      'Sensor selection: presence, air quality, power metering',
    ],
    proof: { label: 'PCB swarm', href: '/demos/pcbs' },
    color: '#7fe0b0',
  },
]

export interface Post {
  id: PostId
  slug: string
  published: string
  meta: string
  indexMeta: string
  homeMeta: string
  title: string
  excerpt: string
  indexExcerpt: string
}

export const POSTS: Post[] = [
  {
    id: 5,
    slug: 'counterfeit-x26-ultra-teardown',
    published: '2026-10-08',
    meta: '2026 · teardown',
    indexMeta: '2026 · teardown · android, security, firmware',
    homeMeta: '2026 · teardown',
    title: 'A $50 "Android 15 flagship" that was a 2019 tablet with a backdoor',
    excerpt: 'Spoofed specs, a faked patch date, and a firmware-level Adups C2 I recovered from the DEX.',
    indexExcerpt:
      'A counterfeit "X26 Ultra": Android 10 sold as 15, a tablet sold as a phone, and a preinstalled Adups backdoor whose C2 was hidden in char[] arrays. Teardown, mechanism, and the consumer-law angle.',
  },
  {
    id: 4,
    slug: 'pov-poi-design-spec',
    published: '2026-10-08',
    meta: '2026 · design spec',
    indexMeta: '2026 · spec · hardware, kicad, esp32',
    homeMeta: '2026 · spec',
    title: 'POV poi & bike wheels: the design spec',
    excerpt: '333 LEDs/m on both faces, an ESP32-S3 timing every column from a gyro, and an IP67 tube made from bottle necks.',
    indexExcerpt:
      'Persistence-of-vision poi and wheel bars: KiCad 10 boards, a WebAssembly firmware simulator, costs per pair and the full spec.',
  },
  {
    id: 1,
    slug: 'animating-flexbox-children',
    published: '2024-06-12',
    meta: '2024 · 10 min read',
    indexMeta: '2024 · 10 min · react, css',
    homeMeta: '2024 · 10 min',
    title: 'Animating flexbox children without losing your mind',
    excerpt: 'How react-flex-animations works — and how to actually use it.',
    indexExcerpt:
      "display:none snaps. FLIP is the usual hammer. I animated flex itself instead — here's the API and the internals.",
  },
  {
    id: 2,
    slug: 'oh-my-comma',
    published: '2023-08-18',
    meta: '2023 · 9 min read',
    indexMeta: '2023 · 9 min · devtools',
    homeMeta: '2023 · 9 min',
    title: 'A workbench for self-driving: building oh-my-comma',
    excerpt: "Shell utilities and dotfiles for comma.ai's open-source stack.",
    indexExcerpt:
      "Shell utilities and dotfiles that made hacking on comma.ai's open-source stack feel like home.",
  },
  {
    id: 3,
    slug: 'afterimage-trails',
    published: '2023-04-04',
    meta: '2023 · 4 min read',
    indexMeta: '2023 · 4 min · canvas',
    homeMeta: '2023 · 4 min',
    title: 'Cheap afterimage trails with one translucent rect',
    excerpt: 'Skip clearRect and paint fog instead.',
    indexExcerpt: "You don't need a shader pass for motion trails. Skip clearRect and paint fog instead.",
  },
]

export const DEMOS: Record<
  DemoId,
  {
    title: string
    desc: string
    tech: string
    repo?: string
    live?: string
    embed?: string
    note?: string
    preview?: string
    features?: { title: string; desc: string; img?: string }[]
  }
> = {
  search: {
    title: 'search.emu.sh',
    desc: "Fastify app that is both a Chrome suggestion provider and a search engine — DuckDuckGo bangs plus Google's rich omnibox (math, etc.). An OpenRouter LLM (moonshotai/kimi-k2.7-code) picks Google vs DuckDuckGo.",
    tech: 'Fastify · TypeScript · OpenRouter',
    repo: 'https://github.com/AskAlice/search.emu.sh',
    live: 'https://search.emu.sh',
    features: [
      {
        title: 'NLP routing',
        desc: 'Google by default; DuckDuckGo for health and meds, where Google often leans opinion over useful fact sheets.',
      },
      { title: 'Custom bangs', desc: 'DuckDuckGo bangs, plus extras defined in the suggestion engine.' },
      {
        title: 'IP to location',
        desc: 'Type an IP in the omnibox and get a geolocation result.',
        img: 'https://emu.bz/cCu.png',
      },
      {
        title: 'DNS dig',
        desc: 'Type a domain plus a record type to pull DNS records.',
        img: 'https://emu.bz/OX1.gif',
      },
      {
        title: 'Crypto to USD',
        desc: 'Spot prices via CryptoCompare, with CoinMarketCap as the destination.',
        img: 'https://emu.bz/tAm.png',
      },
    ],
  },
  geo: {
    title: 'Spin / Afterimage',
    desc: 'Two nested wireframe cubes spinning on offset axes. The trails are free — I never clear the canvas, just paint a translucent rectangle over it each frame.',
    tech: 'Canvas 2D',
    repo: LINKS.github,
  },
  flex: {
    title: 'react-flex-animations',
    desc: 'Show and hide flexbox children with nice animations. Tap a chip and siblings reflow into the gap instead of snapping. My npm library, running live.',
    tech: 'TypeScript · styled-components',
    repo: 'https://github.com/AskAlice/react-flex-animations',
  },
  midi: {
    title: 'react-three-midi',
    desc: 'MIDI and audio analysis inside a react-three-fiber scene. The live cut is viz.emu.sh — same idea, hosted here via the GitHub Pages build. Click the scene to start sound; browsers block autoplay.',
    tech: 'R3F · Three.js · MIDI',
    repo: 'https://github.com/AskAlice/react-three-midi',
    live: 'https://viz.emu.sh/',
    embed: 'https://askalice.github.io/react-three-midi/',
    preview: 'https://emu.bz/midi.gif',
    note: 'Click the demo to play sound.',
  },
  pov: {
    title: 'POV poi simulator',
    desc: 'The persistence-of-vision poi and bike-wheel firmware, running in the browser: the real C core compiled to WebAssembly, fed by a simulated IMU and microphone, drawn with an afterimage shader. Bench, Performer and Bike views, with live sensor readouts.',
    tech: 'C11 → WASM · R3F · Three.js',
    repo: LINKS.github,
    live: '/demos/pov-poi/simulator.html',
    embed: '/demos/pov-poi/simulator.html',
    preview: '/demos/pov-poi/sim-disc.png',
    note: 'Drag to orbit · pick a view in the panel',
  },
  music: {
    title: 'I Promise — spectrogram',
    desc: 'My track “I Promise” as a scrubbable spectrogram: click to seek, a live Web Audio spectrum while it plays, and the dominant pitch and first eight partials at the playhead.',
    tech: 'Web Audio · Canvas · FL Studio',
    live: 'https://emu.bz/i-promise.mp3',
    preview: '/media/music/i-promise-spectrogram.webp',
  },
  pcbs: {
    title: 'home-automation-pcbs',
    desc: 'Open KiCad swarm of ESP32 room nodes — ESPHome, Matter/Thread, Zigbee, BLE, Wi-Fi. Early-stage designs: each board’s specs and raytraced KiCad renders, straight from the repo.',
    tech: 'KiCad 8 · ESP32 · ESPHome',
    repo: 'https://github.com/AskAlice/home-automation-pcbs',
    features: [
      { title: 'SenseNode C6', desc: 'USB-C environmental node — SHT31, BH1750, BMP280, PIR.', img: 'demos/pcbs/sensenode-c6/render3d_top.png' },
      { title: 'PresencePro C3', desc: 'HLK-LD2410 mmWave presence plus lux gating.', img: 'demos/pcbs/presencepro-c3/render3d_top.png' },
      { title: 'LEDQuad C3', desc: '4-channel 12–24 V PWM MOSFET strip driver.', img: 'demos/pcbs/ledquad-c3/render3d_top.png' },
      { title: 'RelayMini C3', desc: 'Mains relay + BL0942 metering. Lethal voltages — not a toy.', img: 'demos/pcbs/relaymini-c3/render3d_top.png' },
      { title: 'LEDHub C6', desc: 'Flagship WLED/ESPHome station with 2.8" TFT and knobs.', img: 'demos/pcbs/ledhub-c6/render3d_top.png' },
      { title: 'ThreadNode H2', desc: 'Battery Matter-over-Thread / Zigbee contact + button.', img: 'demos/pcbs/threadnode-h2/render3d_top.png' },
      { title: 'AirQuality S3', desc: 'CO₂ + VOC + temp/hum with an OLED header.', img: 'demos/pcbs/airquality-s3/render3d_top.png' },
      { title: 'BlindDriver C6', desc: 'TMC2209 roller-blind controller for ESPHome / Matter.', img: 'demos/pcbs/blinddriver-c6/render3d_top.png' },
      { title: 'IRBlaster C3', desc: 'IR TX/RX climate bridge for leftover A/C remotes.', img: 'demos/pcbs/irblaster-c3/render3d_top.png' },
      { title: 'GardenProbe C6', desc: 'Battery soil-moisture probe, Matter-ready.', img: 'demos/pcbs/gardenprobe-c6/render3d_top.png' },
      { title: 'ThreadRCP H2', desc: 'USB OpenThread RCP / Zigbee NCP border-router dongle.', img: 'demos/pcbs/threadrcp-h2/render3d_top.png' },
    ],
  },
}

/** Track metadata for schema.org (kept in sync with lib/music/i-promise.json by a test). */
export const TRACK = {
  name: 'I Promise',
  durationSec: 207.38,
  audioUrl: 'https://emu.bz/i-promise.mp3',
  image: '/media/music/i-promise-spectrogram.webp',
}

export const SEARCH_MEDIA = (DEMOS.search.features ?? []).flatMap((f) => (f.img ? [f.img] : []))
export const PCB_MEDIA = [
  'sensenode-c6',
  'presencepro-c3',
  'ledquad-c3',
  'relaymini-c3',
  'ledhub-c6',
  'threadnode-h2',
  'airquality-s3',
  'blinddriver-c6',
  'irblaster-c3',
  'gardenprobe-c6',
  'threadrcp-h2',
].map((id) => `demos/pcbs/${id}/turntable.gif`)

// Repo cards: the current set merged with the AI Studio draft's FeaturedProjects
// list. Descriptions checked against each repo's README (Oct 2026).
export const GITHUB_CARDS = [
  {
    name: 'home-automation-pcbs',
    desc: 'Open KiCad swarm of ESP32 room nodes — ESPHome, Matter/Thread, Zigbee.',
    lang: 'KiCad',
    langColor: '#6ee7b7',
    href: 'https://github.com/AskAlice/home-automation-pcbs',
  },
  {
    name: 'search.emu.sh',
    desc: 'Fastify suggestion provider + search engine: DDG bangs, DNS digs, IP geolocation, LLM engine routing.',
    lang: 'TypeScript',
    langColor: '#8fc9f5',
    href: 'https://github.com/AskAlice/search.emu.sh',
  },
  {
    name: 'react-three-midi',
    desc: 'MIDI playback driving a react-three-fiber scene with Perlin-noise terrain and glitch post-processing.',
    lang: 'JavaScript',
    langColor: '#ffd47e',
    href: 'https://github.com/AskAlice/react-three-midi',
  },
  {
    name: 'react-flex-animations',
    desc: 'Show / hide flexbox children with nice animations.',
    lang: 'TypeScript',
    langColor: '#8fc9f5',
    href: 'https://github.com/AskAlice/react-flex-animations',
  },
  {
    name: 'oh-my-comma',
    desc: 'A "workbench for developers" — tooling & dotfiles for comma.ai\'s open-source self-driving stack.',
    lang: 'Shell',
    langColor: '#ffd47e',
    href: 'https://github.com/AskAlice/oh-my-comma',
  },
  {
    name: 'yksofttoken',
    desc: 'Software YubiKey (HOTP) token. My fork rewrites it in Go with a Fyne GUI, cross-platform builds and a Windows installer.',
    lang: 'Go',
    langColor: '#7fe0b0',
    href: 'https://github.com/AskAlice/yksofttoken',
  },
  {
    name: 'TTR-Tools',
    desc: 'AutoHotkey helper for Toontown Rewritten: anti-AFK, garden bot, teleport macros, a hands-free trampoline bot. Retired.',
    lang: 'AutoHotkey',
    langColor: '#b3a4f7',
    href: 'https://github.com/AskAlice/TTR-Tools',
  },
  {
    name: 'vacantfuture.com',
    desc: 'Personal project site — featured here; original host TLS is expired.',
    lang: 'Web',
    langColor: '#ffd47e',
    href: 'https://vacantfuture.com/',
  },
  {
    name: 'bitpixels',
    desc: 'CU Blockchain Hackathon — 2nd place, 0.5 ETH. A collaborative on-chain pixel canvas.',
    lang: 'Solidity',
    langColor: '#f5708a',
    href: 'https://devpost.com/software/bitpixels',
  },
]

export const DEMO_CHIP_LABELS = ['React', 'Vue', 'Three.js', 'WebGL', 'lottie', 'Golang', 'D3']

// Photography grid from the original askalice.me (/photography), self-hosted.
export const PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  src: `photos/${String(i + 1).padStart(2, '0')}.jpg`,
  alt: [
    'Burning Man sculpture in dust',
    'Fire spinning light painting',
    'Portrait',
    'Boulder Flatirons hillside',
    'Night sky over trees',
    'Fire performer light trails',
    'Downtown skyline',
    'Pride festival with puppy',
    'Street photography',
    'Landscape',
    'Light painting helix',
    'City at night',
  ][i],
}))
