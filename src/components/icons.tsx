// Inline Lucide-style stroke icons carried over from the design.
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size: number, p: P) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
})

export const CalendarIcon = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
)
export const PinIcon = ({ size = 14, ...p }: P) => (
  <svg {...base(size, p)}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
)
export const MailIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 6 10-6" /></svg>
)
export const CheckCircleIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
)
export const ArrowRightIcon = ({ size = 17, ...p }: P) => (
  <svg {...base(size, { strokeWidth: 2.2, ...p })}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
)
export const DownloadIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
)
export const GithubIcon = ({ size = 15, ...p }: P) => (
  <svg {...base(size, p)}><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
)
export const LinkedinIcon = ({ size = 16, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
)
export const GlobeIcon = ({ size = 16, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20" /></svg>
)
export const PlayBadgeIcon = ({ size = 26, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.5-2.5-1.5-2.5 1.5V8h5v7.5z" /></svg>
)
export const CodeIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></svg>
)
export const PencilIcon = ({ size = 24, ...p }: P) => (
  <svg {...base(size, p)}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
)
export const CodeSlashIcon = ({ size = 15, ...p }: P) => (
  <svg {...base(size, p)}><path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" /></svg>
)
export const BoxIcon = ({ size = 15, ...p }: P) => (
  <svg {...base(size, p)}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /></svg>
)
export const DatabaseIcon = ({ size = 15, ...p }: P) => (
  <svg {...base(size, p)}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" /></svg>
)
export const ShapesIcon = ({ size = 15, ...p }: P) => (
  <svg {...base(size, p)}><circle cx="13.5" cy="6.5" r="2.5" /><circle cx="6.5" cy="12" r="2.5" /><circle cx="17" cy="15" r="3" /><path d="m11 8-3 2m6.5-.5L15 13" /></svg>
)
export const GradCapIcon = ({ size = 15, ...p }: P) => (
  <svg {...base(size, p)}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
)
export const TrophyIcon = ({ size = 15, ...p }: P) => (
  <svg {...base(size, p)}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6m12 5h1.5a2.5 2.5 0 0 0 0-5H18M6 2h12v7a6 6 0 0 1-12 0z" /><path d="M12 15v4M8 22h8" /></svg>
)
