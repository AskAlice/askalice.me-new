import { LINKS } from '../lib/content'
import { GithubIcon, LinkedinIcon, GlobeIcon } from './icons'

export function Footer() {
  return (
    <footer className="border-t border-white/8 bg-pit px-[clamp(18px,5vw,56px)] pt-[clamp(50px,8vw,90px)] pb-50px">
      <div className="max-w-1080px mx-auto flex justify-between items-end gap-30px flex-wrap">
        <div>
          <h2 className="text-[clamp(30px,6vw,68px)] font-700 tracking-[-0.03em] mt-0 mb-18px leading-none">
            Let's build
            <br />
            something pretty.
          </h2>
          <a href={`mailto:${LINKS.email}`} className="text-[clamp(18px,2.5vw,26px)] text-pink border-b border-flamingo/40">
            {LINKS.email}
          </a>
        </div>
        <div className="flex flex-col gap-11px text-14px">
          <a href={LINKS.github} target="_blank" rel="noreferrer" className="flex items-center gap-9px text-muted transition-colors duration-150 hover:text-pink">
            <GithubIcon size={16} />
            github.com/AskAlice
          </a>
          <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-9px text-muted transition-colors duration-150 hover:text-sky">
            <LinkedinIcon />
            in/aliceknag
          </a>
          <a href={LINKS.riseintime} target="_blank" rel="noreferrer" className="flex items-center gap-9px text-muted transition-colors duration-150 hover:text-pink">
            <GlobeIcon />
            riseintime.com
          </a>
        </div>
      </div>
      <div className="max-w-1080px mx-auto mt-46px pt-24px border-t border-white/6 flex justify-between gap-16px flex-wrap font-mono text-12px text-ghost">
        <span>{'(>ﾟヮﾟ)>'} made with too much JavaScript</span>
        <span>raised by the internet · © 2026</span>
      </div>
    </footer>
  )
}
