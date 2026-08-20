import { useState, type CSSProperties } from 'react'
import { DEMO_CHIP_LABELS } from '../../lib/content'

// The react-flex-animations demo: tapping a chip collapses it and the
// siblings reflow with easing. A hidden chip gets a negative margin to
// cancel the doubled flex gap (the "collapsed-chip fix" from the handoff).
function chipStyle(hidden: boolean, lg: boolean): CSSProperties {
  const base: CSSProperties = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: lg ? 15 : 13,
    color: '#17151e',
    background: '#f5708a',
    borderRadius: 9,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all .4s cubic-bezier(.4,0,.2,1)',
    display: 'inline-block',
    fontWeight: 500,
  }
  if (hidden) {
    return {
      ...base,
      maxWidth: 0,
      opacity: 0,
      paddingLeft: 0,
      paddingRight: 0,
      marginLeft: lg ? -10 : -8,
      marginRight: 0,
      transform: 'scale(.6)',
    }
  }
  return { ...base, maxWidth: 220, opacity: 1, padding: lg ? '11px 18px' : '9px 15px', transform: 'scale(1)' }
}

export function FlexChips({ large = false }: { large?: boolean }) {
  const [hidden, setHidden] = useState<Record<number, boolean>>({})
  return (
    <div
      className={`flex flex-wrap justify-center items-center ${large ? 'gap-10px max-w-600px' : 'gap-8px'}`}
    >
      {DEMO_CHIP_LABELS.map((label, i) => (
        <span
          key={label}
          style={chipStyle(!!hidden[i], large)}
          onClick={() => setHidden((h) => ({ ...h, [i]: !h[i] }))}
        >
          {label}
        </span>
      ))}
    </div>
  )
}
