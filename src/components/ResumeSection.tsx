import { LINKS } from '../lib/content'
import { DownloadIcon, CodeSlashIcon, BoxIcon, DatabaseIcon, ShapesIcon, GradCapIcon, TrophyIcon } from './icons'

const GROUPS = [
  {
    icon: <CodeSlashIcon />,
    label: 'Languages',
    color: 'text-flamingo',
    lines: ['JS / TypeScript · Node', 'Golang · PHP · Python', 'HTML / CSS / SCSS'],
  },
  {
    icon: <BoxIcon />,
    label: 'Frameworks',
    color: 'text-sky',
    lines: ['React · Vue · Angular', 'Three.js · r3f · Pixi.js', 'D3 · Laravel · Drupal'],
  },
  {
    icon: <DatabaseIcon />,
    label: 'DevOps',
    color: 'text-lilac',
    lines: ['Kubernetes · Terraform', 'Ansible · CloudFormation', 'Linux · AWS · GCP'],
  },
  {
    icon: <ShapesIcon />,
    label: 'Design + more',
    color: 'text-butter',
    lines: ['Figma · Photoshop', 'Illustrator · After Effects', 'Web security · PCI'],
  },
]

export function ResumeSection() {
  return (
    <section id="resume" className="section-pad py-[clamp(60px,9vw,120px)] scroll-mt-80px">
      <div className="border border-white/10 rounded-22px bg-gradient-to-b from-card to-carddeep p-[clamp(28px,5vw,56px)]">
        <div className="flex items-start justify-between gap-24px flex-wrap mb-40px">
          <div>
            <div className="eyebrow mb-18px">
              <span className="eyebrow-rule" />05 / résumé
            </div>
            <h2 className="text-[clamp(28px,4vw,44px)] leading-[1.05] font-600 tracking-[-0.02em] m-0">
              The whole story,
              <br />
              one page.
            </h2>
          </div>
          <a
            href={LINKS.resumePdf}
            download="Alice Knag — Résumé.pdf"
            className="flex items-center gap-10px bg-flamingo text-ink font-600 text-15px px-22px py-13px rounded-12px whitespace-nowrap shadow-[0_10px_28px_rgba(245,112,138,0.4)] transition-transform duration-150 hover:-translate-y-2px"
          >
            <DownloadIcon size={17} />
            Download PDF
          </a>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-30px">
          {GROUPS.map((g) => (
            <div key={g.label}>
              <div className={`flex items-center gap-8px font-mono text-12px uppercase tracking-1px mb-14px ${g.color}`}>
                {g.icon}
                {g.label}
              </div>
              <div className="text-body text-14.5px leading-[1.9]">
                {g.lines.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-40px pt-28px border-t border-white/8 grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-32px">
          <div>
            <div className="flex items-center gap-8px font-mono text-12px text-faint uppercase tracking-1px mb-10px">
              <GradCapIcon />
              Education
            </div>
            <div className="text-bright text-15px">Computer Science — CU Boulder</div>
            <div className="text-muted text-14px leading-[1.55]">
              2017–2019 · plus Cyber Operations & Pre-Law, University of Arizona (2024)
            </div>
          </div>
          <div>
            <div className="flex items-center gap-8px font-mono text-12px text-faint uppercase tracking-1px mb-10px">
              <TrophyIcon />
              Achievements
            </div>
            <div className="text-bright text-15px leading-[1.55]">
              2nd place — 2018 CU Blockchain Hackathon (0.5 ETH)
              <br />
              <span className="text-muted text-14px">NY State award · 4-yr captain, FIRST Robotics #6567</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
