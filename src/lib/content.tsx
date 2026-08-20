// Site content from the handoff. Experience/skills/education are real (from
// Alice's résumé); the blog posts are placeholder prose per the handoff note.
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
}

export const ROLES: Omit<Role, 'badge'>[] = [
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

export interface Post {
  id: PostId
  meta: string
  indexMeta: string
  homeMeta: string
  title: string
  excerpt: string
  indexExcerpt: string
}

export const POSTS: Post[] = [
  {
    id: 1,
    meta: '2024 · 6 min read',
    indexMeta: '2024 · 6 min · webgl, css',
    homeMeta: '2024 · 6 min',
    title: 'Animating flexbox children without losing your mind',
    excerpt: 'The FLIP trick behind my react-flex-animations library.',
    indexExcerpt:
      "Flexbox refuses to transition display:none. Here's the FLIP technique behind react-flex-animations.",
  },
  {
    id: 2,
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
    meta: '2023 · 4 min read',
    indexMeta: '2023 · 4 min · canvas',
    homeMeta: '2023 · 4 min',
    title: 'Cheap afterimage trails with one translucent rect',
    excerpt: 'Skip clearRect and paint fog instead.',
    indexExcerpt: "You don't need a shader pass for motion trails. Skip clearRect and paint fog instead.",
  },
]

export const DEMOS: Record<DemoId, { title: string; desc: string; tech: string; repo: string }> = {
  shader: {
    title: 'Shader Field',
    desc: 'A mouse-reactive WebGL fragment shader on a single full-screen triangle — no three.js, just GLSL and a little math.',
    tech: 'WebGL · GLSL',
    repo: LINKS.github,
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
}

export const GITHUB_CARDS = [
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
    href: LINKS.github,
  },
  {
    name: 'search.emu.sh',
    desc: 'Crypto prices, DNS digs, ip2location & DuckDuckGo bangs — right in the Chrome omnibox.',
    lang: 'TypeScript',
    langColor: '#8fc9f5',
    href: 'https://github.com/AskAlice/search.emu.sh',
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
