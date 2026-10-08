// POV poi & wheel design spec. The spec HTML and the media manifest are generated from the
// pov-poi repo by `tools/publish_site.py` — edit the spec there, not here.
import specHtml from './pov-poi.html?raw'
import mediaJson from './pov-poi.media.json?raw'
import type { ReactNode } from 'react'
import { P, A } from './ui'
import { AppLink } from '../../components/AppLink'

const BASE = '/demos/pov-poi/'

interface Clip { src: string; caption: string }
interface Board { name: string; still: string; video: string; caption: string }

const media = JSON.parse(mediaJson) as { videos: Clip[]; stills: Clip[]; boards: Board[] }
const VIDEOS = media.videos
const STILLS = media.stills
const BOARDS = media.boards

function Figure({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="m-0 bg-card border border-white/8 rounded-12px overflow-hidden">
      {children}
      <figcaption className="font-mono text-12px text-muted px-12px py-10px leading-[1.5]">{caption}</figcaption>
    </figure>
  )
}

export function PovArticle() {
  return (
    <div className="text-17px leading-[1.75] text-body2">
      <P>
        A pair of persistence-of-vision poi and matching bike-wheel bars: HD107S-2020 LEDs on both faces at
        3.0 mm pitch (≈333/m), an ESP32-S3 that times every column from a gyro, music and MIDI triggers over
        ESP-NOW, and an IP67 tube built from bonded bottle necks. The renders below come from the firmware
        simulator (the real C core compiled to WebAssembly) and from KiCad 10's raytracer; the full design
        spec follows.
      </P>
      <div className="grid gap-16px mb-32px">
        {VIDEOS.map((v) => (
          <Figure key={v.src} caption={v.caption}>
            <video src={BASE + v.src} autoPlay muted loop playsInline preload="metadata" className="block w-full bg-black" />
          </Figure>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-16px mb-32px">
        {STILLS.map((s) => (
          <Figure key={s.src} caption={s.caption}>
            <img src={BASE + s.src} alt={s.caption} loading="lazy" className="block w-full bg-black" />
          </Figure>
        ))}
      </div>
      <h2 className="text-22px font-600 text-bright tracking-[-0.02em] mt-44px mb-16px">Boards (KiCad 10, raytraced)</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-16px mb-40px">
        {BOARDS.map((b) => (
          <Figure key={b.name} caption={b.caption}>
            <video
              src={BASE + b.video}
              poster={BASE + b.still}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="block w-full bg-black"
            />
          </Figure>
        ))}
      </div>
      <P>
        Try the firmware yourself in the <AppLink href="/demos/pov" className="text-pink border-b border-flamingo/35">simulator</AppLink>{' '}
        (or <A href="/demos/pov-poi/simulator.html">full screen</A>). Source:{' '}
        <A href="https://github.com/AskAlice">github.com/AskAlice</A>.
      </P>
      <div className="md-body" dangerouslySetInnerHTML={{ __html: specHtml }} />
    </div>
  )
}
