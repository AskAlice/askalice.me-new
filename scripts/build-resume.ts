import { createWriteStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import PDFDocument from 'pdfkit'
import { DEMOS, LINKS, ROLES } from '../src/lib/content.tsx'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'public/uploads/alice-knag-resume-2026-2.pdf')
const asset = (path: string) => resolve(root, 'public', path)
const clean = (text: string) => text.replaceAll('—', '-').replaceAll('·', '|').replaceAll('–', '-')
const colors = { ink: '#242137', muted: '#656075', line: '#ddd9e8', plum: '#57497d', pink: '#d34f73', pale: '#f6f3fa' }
const doc = new PDFDocument({ size: 'LETTER', margins: { top: 36, right: 40, bottom: 38, left: 40 }, bufferPages: true, info: {
  Title: 'Alice Knag - Resume and Selected Work', Author: 'Alice Knag', Subject: 'Professional experience, skills, education, achievements, and selected work', CreationDate: new Date('2026-08-27T00:00:00Z'), ModDate: new Date('2026-08-27T00:00:00Z'),
} })

doc.pipe(createWriteStream(output))

const width = 532
const text = (value: string, x: number, y: number, options: PDFKit.Mixins.TextOptions = {}) =>
  doc.text(clean(value), x, y, options)
const section = (label: string, y: number) => {
  doc.fillColor(colors.plum).font('Helvetica-Bold').fontSize(9).text(label.toUpperCase(), 40, y, { characterSpacing: 1.2 })
  doc.moveTo(40, y + 14).lineTo(572, y + 14).lineWidth(0.7).strokeColor(colors.line).stroke()
  return y + 23
}
const header = (subtitle: string) => {
  doc.fillColor(colors.ink).font('Helvetica-Bold').fontSize(28).text('Alice Knag', 40, 34)
  doc.fillColor(colors.plum).font('Helvetica-Bold').fontSize(8.5).text(subtitle.toUpperCase(), 40, 70, { characterSpacing: 0.5 })
  doc.fillColor(colors.muted).font('Helvetica').fontSize(8.2)
  doc.text('Denver / Boulder, Colorado', 40, 86)
  doc.text('845.594.5164  |  alice@askalice.me  |  askalice.me  |  github.com/AskAlice', 40, 98, { link: 'https://askalice.me' })
  doc.moveTo(40, 115).lineTo(572, 115).lineWidth(2).strokeColor(colors.plum).stroke()
}
const role = (index: number, y: number, detail?: string[]) => {
  const item = ROLES[index]!
  doc.fillColor(colors.ink).font('Helvetica-Bold').fontSize(10)
  text(item.title, 40, y, { width: 340 })
  doc.fillColor(colors.plum).font('Helvetica-Bold').fontSize(9)
  text(item.company, 40, y + 13, { width: 340 })
  doc.fillColor(colors.muted).font('Helvetica').fontSize(8)
  text(`${item.dates}  |  ${item.location}`, 405, y + 1, { width: 167, align: 'right' })
  let cursor = y + 28
  const lines = detail ?? [item.description]
  for (const line of lines) {
    doc.fillColor(colors.ink).font('Helvetica').fontSize(8.15)
    const bullet = lines.length > 1 ? `- ${line}` : line
    const height = doc.heightOfString(clean(bullet), { width: width - (lines.length > 1 ? 10 : 0), lineGap: 1 })
    text(bullet, 40 + (lines.length > 1 ? 10 : 0), cursor, { width: width - (lines.length > 1 ? 10 : 0), lineGap: 1 })
    cursor += height + 3
  }
  return cursor + 6
}
const card = (x: number, y: number, w: number, h: number, title: string, body: string) => {
  doc.roundedRect(x, y, w, h, 7).fill(colors.pale)
  doc.fillColor(colors.plum).font('Helvetica-Bold').fontSize(8.5)
  text(title, x + 11, y + 10, { width: w - 22 })
  doc.fillColor(colors.ink).font('Helvetica').fontSize(7.7)
  text(body, x + 11, y + 25, { width: w - 22, lineGap: 1 })
}
const imageCover = (path: string, x: number, y: number, w: number, h: number) => {
  doc.save().roundedRect(x, y, w, h, 7).clip().image(asset(path), x, y, { cover: [w, h], align: 'center', valign: 'center' }).restore()
}
const imageContain = (path: string, x: number, y: number, w: number, h: number) => {
  doc.roundedRect(x, y, w, h, 7).fill('#f1eef6')
  doc.image(asset(path), x + 8, y + 8, { fit: [w - 16, h - 16], align: 'center', valign: 'center' })
}

header('Software engineer | hardware builder | technical operator')
let y = section('Professional Experience', 130)
y = role(0, y)
y = role(1, y)
y = role(2, y, [
  'Engineered lead-generation systems for RateZip and FHA.com processing 80k+ leads annually across Google, Facebook, and programmatic channels.',
  'Built mortgage rate-comparison tools and conversion funnels driving 1M+ consumer referrals.',
  'Created landing pages and API integrations reducing acquisition cost 35% while maintaining sub-200ms response times.',
])
y = role(3, y, [
  'Built PlayStation web platforms with TypeScript, React, Nest.js, Prisma, Kubernetes, Groovy, Jenkins, and Figma.',
  'Delivered a front-end table that sorted and fuzzy-searched 50,000+ rows without lag, plus CI/CD automation detail visualizations.',
])
role(4, y, [
  'Developed tools with React, Pixi.js, GraphQL, Golang, and Kubernetes across front-end, back-end, and DevOps.',
  'Built reverse-proxy modules, deployment pipelines, and metrics stacks using Prometheus, Grafana, Graphite, Elasticsearch, and New Relic.',
  'Served in a PagerDuty on-call rotation as a Platform Reliability Engineer using Terraform, CloudFormation, Jenkins, and GitHub Actions.',
])

doc.addPage()
header('Experience, education, skills, and achievements')
y = section('Professional Experience - continued', 130)
y = role(5, y, [
  'Designed and built interactive tools with React, Pixi.js, GraphQL, Golang, PHP, Python, Laravel, Drupal, MySQL, and MongoDB.',
  'Worked across HTML5, CSS3, Sass, JavaScript, Vue, Angular, React, Three.js, Jade, Smarty, Materialize, Bootstrap, Photoshop, and Illustrator.',
  'Produced banner ads, email templates, logos, home pages, and sales funnels clearing $100k/month under favorable market conditions; deployed with Apache, nginx, Kubernetes, AWS, and GCP.',
])
doc.fillColor(colors.ink).font('Helvetica-Bold').fontSize(10).text('Linux Systems Administrator', 40, y)
doc.fillColor(colors.plum).font('Helvetica-Bold').fontSize(9).text('University of Colorado Boulder', 40, y + 13)
doc.fillColor(colors.muted).font('Helvetica').fontSize(8).text('2017 - 2018  |  Boulder, CO', 405, y + 1, { width: 167, align: 'right' })
doc.fillColor(colors.ink).font('Helvetica').fontSize(8.15).text('Maintained faculty web servers using RHEL, Ansible, LAMP, and ServiceNow.', 40, y + 28, { width })
y += 55

y = section('Education', y)
card(40, y, 258, 60, 'Computer Science | University of Colorado Boulder', 'August 2017 - May 2019\nLeft after receiving a six-figure software engineering offer.')
card(314, y, 258, 60, 'Cyber Operations & Pre-Law | University of Arizona', 'January 2024 - June 2024')
y += 78

y = section('Skills & Abilities', y)
const skillCards = [
  ['Languages', 'JavaScript / TypeScript / Node, Golang, HTML / CSS / SCSS, PHP, Python'],
  ['Frameworks', 'React, Vue, Angular, Drupal, Laravel, Magento, WordPress, Three.js, D3, Pixi.js'],
  ['DevOps', 'Linux, Kubernetes, Ansible, Puppet, CloudFormation, AWS, GCP, Terraform'],
  ['Design & Hardware', 'Figma, Photoshop, Illustrator, After Effects / Lottie, KiCad, ESP32, ESPHome'],
  ['Other', 'PCI compliance, Agile development, web application security, ethical hacking, marketing'],
]
skillCards.forEach(([title, body], index) => card(40 + (index % 2) * 274, y + Math.floor(index / 2) * 53, 258, 45, title!, body!))
y += 166

y = section('Awards, Community & Hobbies', y)
doc.fillColor(colors.ink).font('Helvetica').fontSize(8.2)
text('- 2nd place, 2018 CU Blockchain Hackathon (0.5 ETH) | devpost.com/software/bitpixels', 40, y, { width })
text('- New York State award | four-year captain, FIRST Tech Challenge Robotics Team #6567', 40, y + 14, { width })
text('- Volunteer development for Rise in Time | riseintime.com', 40, y + 28, { width, link: LINKS.riseintime })
text('- Music production, game development, inline skating, and home automation | emu.bz/i-promise.mp3', 40, y + 42, { width, link: 'https://emu.bz/i-promise.mp3' })

doc.addPage()
header('Selected hardware, software, and creative work')
y = section('Home Automation PCBs', 130)
doc.fillColor(colors.ink).font('Helvetica').fontSize(8.2)
text(`${DEMOS.pcbs.desc} The images below are KiCad 3D renders of early-stage designs.`, 40, y, { width, lineGap: 1 })
const boards = [
  ['sensenode-c6', 'SenseNode C6', 'Environmental sensing: SHT31, BH1750, BMP280, and PIR.'],
  ['presencepro-c3', 'PresencePro C3', 'mmWave presence sensing with lux gating.'],
  ['ledhub-c6', 'LEDHub C6', 'WLED / ESPHome controller with TFT and physical controls.'],
  ['threadnode-h2', 'ThreadNode H2', 'Battery Matter-over-Thread / Zigbee contact and button node.'],
]
boards.forEach(([id, title, body], index) => {
  const x = 40 + (index % 2) * 274
  const top = y + 34 + Math.floor(index / 2) * 137
  imageContain(`demos/pcbs/${id}/render3d_top.png`, x, top, 258, 94)
  doc.fillColor(colors.plum).font('Helvetica-Bold').fontSize(8).text(title!, x, top + 101)
  doc.fillColor(colors.ink).font('Helvetica').fontSize(7.2).text(body!, x, top + 113, { width: 258 })
})
y += 312

y = section('Selected Software', y)
card(40, y, 258, 53, 'search.emu.sh', 'Fastify + TypeScript omnibox and search engine with bangs, DNS, IP geolocation, crypto prices, and LLM routing.')
card(314, y, 258, 53, 'react-flex-animations', 'TypeScript library for smoothly showing, hiding, and reflowing flexbox children.')
card(40, y + 61, 258, 53, 'react-three-midi', 'MIDI and audio analysis inside a react-three-fiber scene. Live at viz.emu.sh.')
card(314, y + 61, 258, 53, 'home-automation-pcbs', 'Eleven ESP32 room-node designs for ESPHome, Matter / Thread, Zigbee, BLE, and Wi-Fi.')
y += 132

y = section('Photography & Creative Work', y)
imageCover('photos/01.jpg', 40, y, 167, 84)
imageCover('photos/09.jpg', 222, y, 167, 84)
imageCover('photos/12.jpg', 405, y, 167, 84)

const pages = doc.bufferedPageRange()
for (let index = 0; index < pages.count; index++) {
  doc.switchToPage(index)
  doc.fillColor(colors.muted).font('Helvetica').fontSize(7)
  doc.text(`askalice.me  |  Page ${index + 1} of ${pages.count}`, 40, 738, { width, align: 'right', link: 'https://askalice.me', lineBreak: false })
}

doc.end()
