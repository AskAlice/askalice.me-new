// Brand marks for the affiliations strip and the music demo, ported as-is from
// the AI Studio draft (Alice: "logos are fine"). These are hand-drawn SVG
// approximations, not the official artwork. Each mark is decorative next to a
// visible text label, so the SVGs are aria-hidden.
import { useId } from 'react'

/**
 * University of Arizona Block 'A' Official Logo Mark
 */
export function UniversityOfArizonaLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background soft shield */}
      <rect width="100" height="100" rx="20" fill="#0C2340" />
      {/* Block A Outer Contour - Cardinal Red */}
      <path
        d="M50 14L22 78H36L42 63H58L64 78H78L50 14Z"
        fill="#CC0033"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Inner Apex Cutout */}
      <polygon points="50,29 44.5,52 55.5,52" fill="#0C2340" />
      {/* Arizona Navy Blue Crossbar Accent */}
      <rect x="38" y="52" width="24" height="6.5" fill="#00274C" rx="1" stroke="#FFFFFF" strokeWidth="1" />
      {/* Bottom Serif Feet */}
      <path d="M19 78H39V74H19V78Z" fill="#CC0033" />
      <path d="M61 78H81V74H61V78Z" fill="#CC0033" />
    </svg>
  );
}

/**
 * Sony PlayStation Iconic PS Vector Logo Mark
 */
export function PlayStationLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Upright 'P' and lying 'S' PlayStation Geometry */}
      <g transform="translate(10, 12) scale(0.8)">
        {/* P Stem & Loop in vibrant PlayStation Red/Coral */}
        <path
          d="M38.5 8V65H51.5V43C51.5 35 55 31.5 62 31.5C69 31.5 72.5 35 72.5 43V58H85.5V41C85.5 25 76 18 63 18C52.5 18 43 23 38.5 28V8H38.5Z"
          fill="#00439C"
        />
        {/* Inner loop of P */}
        <path
          d="M51.5 31.5V19C55 18.5 58.5 18.2 62 18.2C71 18.2 75 22 75 30.5C75 34 73 37.5 69 39.5C66 41 62.5 41.5 59 41.5H51.5V31.5Z"
          fill="#DF0024"
        />
        {/* S Horizontal Perspective Shadow Base */}
        <path
          d="M87 63C75 58.5 57 56.5 43 59L34 60.5C21 63 11 67 11 72C11 78 23.5 83 45 83C66.5 83 83 78.5 83 72.5C83 70 78.5 67.5 70 65.5L87 63Z"
          fill="#F3C300"
        />
        {/* S Lower Perspective Ribbon */}
        <path
          d="M45 88C21 88 6 82.5 6 75.5C6 69.5 18 64.5 34 62L41 61C56 58.5 75 60.5 86 65C92 67.5 95 70.5 95 74C95 81 80 88 45 88Z"
          fill="#00AA9E"
          fillOpacity="0.85"
        />
      </g>
    </svg>
  );
}

/**
 * Image-Line FL Studio Iconic Mango/Chili Resynthesis Logo Mark
 */
export function FLStudioLogo({ className = "h-8 w-8" }: { className?: string }) {
  const id = useId().replace(/:/g, "")
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`fl-fruit-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFA028" />
          <stop offset="45%" stopColor="#FF5500" />
          <stop offset="100%" stopColor="#D81B00" />
        </linearGradient>
        <linearGradient id={`fl-stem-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#48DE80" />
          <stop offset="100%" stopColor="#1E824C" />
        </linearGradient>
      </defs>

      {/* Main FL Fruit Body (Persimmon / Chili bulb) */}
      <path
        d="M50 26C35 26 21 39 21 57C21 75 35 90 50 90C65 90 79 75 79 57C79 39 65 26 50 26Z"
        fill={`url(#fl-fruit-${id})`}
      />
      {/* 3D Highlight sheen on fruit */}
      <path
        d="M40 33C30 38 27 48 27 60C30 50 36 42 45 37C44 35 42 34 40 33Z"
        fill="#FFFFFF"
        fillOpacity="0.4"
      />
      {/* Secondary glow */}
      <circle cx="63" cy="67" r="16" fill="#FFA34D" fillOpacity="0.35" style={{ filter: "blur(4px)" }} />

      {/* Green Leaves & Stalk */}
      <path
        d="M50 28C48 20 42 13 33 11C41 18 43 25 45 28C47 25 53 17 65 14C59 19 55 25 52 28H50Z"
        fill={`url(#fl-stem-${id})`}
      />
      <circle cx="49" cy="27" r="2.5" fill="#2E7D32" />
    </svg>
  );
}

/**
 * Section.io Edge Ingress Logo Mark
 */
export function SectionLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="100" height="100" rx="20" fill="#0A0915" stroke="rgba(255,255,255,0.1)" />
      <circle cx="50" cy="50" r="32" stroke="#00D2FF" strokeWidth="6" strokeDasharray="38 12" />
      <circle cx="50" cy="50" r="16" fill="#7928CA" />
      <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
    </svg>
  );
}
