import { useState } from 'react'
import { FlexChips } from '../../components/demos/FlexChips'
import { LINKS } from '../content'
import { P, H2, Code, Pre, Quote, A } from './ui'

const SEGMENTS = ['Logo', 'Switcher', 'Icons'] as const

function FlexGrowBar() {
  const [hidden, setHidden] = useState<number | null>(null)
  return (
    <div className="mb-28px">
      <div className="flex h-56px w-full overflow-hidden rounded-12px border border-white/10">
        {SEGMENTS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setHidden((h) => (h === i ? null : i))}
            className="overflow-hidden border-0 text-ink font-600 text-14px cursor-pointer whitespace-nowrap"
            style={{
              flex: hidden === i ? 0.00001 : 1,
              minWidth: 0,
              padding: 0,
              opacity: hidden === i ? 0 : 1,
              transition: 'flex .5s ease, opacity .4s ease',
              background: ['#f5708a', '#8fc9f5', '#b3a4f7'][i],
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="font-mono text-12px text-faint mt-10px">
        tap a segment — it collapses with <Code>flex</Code>, siblings grow into the gap
      </div>
    </div>
  )
}

export function FlexArticle() {
  return (
    <div className="text-18px leading-[1.75] text-body2">
      <P>
        Flexbox is wonderful right up until you ask it to animate. Hide a child with{' '}
        <Code>display:none</Code>, unmount it, or set <Code>flex: 0</Code> with no transition, and the
        browser skips straight to the end state. Siblings snap into the hole. Nothing to watch.
      </P>
      <P>
        The usual essay at this point is FLIP: measure the <strong className="text-bright">First</strong>{' '}
        positions, apply the <strong className="text-bright">Last</strong> layout,{' '}
        <strong className="text-bright">Invert</strong> the delta with a transform, then{' '}
        <strong className="text-bright">Play</strong> it back. That works. It is also a lot of
        bookkeeping for a toolbar that just needs to share one row.
      </P>
      <Quote>
        Don't animate layout. Animate the thing flexbox already interpolates — the <Code>flex</Code>{' '}
        number — and let siblings grow into the gap.
      </Quote>
      <P>
        That is what{' '}
        <A href="https://github.com/AskAlice/react-flex-animations">react-flex-animations</A> does. One
        component, two data attributes, a 500ms ease. No FLIP measurements. No FLIP invert.
      </P>

      <H2>The thing CSS will not do for you</H2>
      <P>
        <Code>display</Code> is not interpolable. <Code>visibility</Code> hides paint but keeps the
        box. Removing a node from the tree is instant. So a "hide this nav item" toggle is usually
        one of three hacks:
      </P>
      <P>
        <strong className="text-bright">max-width + opacity.</strong> Good for chips and tags with an
        intrinsic width. That is the live tile on this site — tap one:
      </P>
      <div className="border border-white/10 rounded-16px p-22px mb-28px bg-ink [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px]">
        <FlexChips large />
      </div>
      <P>
        Fine for labels. Bad for a bar that should <em>share remaining space</em>. Shrinking{' '}
        <Code>max-width</Code> to 0 does not tell the siblings to grow. They stay their content size
        and the leftover just… sits there.
      </P>
      <P>
        <strong className="text-bright">FLIP.</strong> Correct for lists, grids, anything whose
        geometry is not a single flex row. Overkill when the only number that changed is "how much
        of this row do I own."
      </P>
      <P>
        <strong className="text-bright">Animate <Code>flex</Code>.</strong> Browsers will interpolate{' '}
        <Code>flex-grow</Code>. Hide means animate toward ~0. Show means animate from ~0 back to the
        item's ratio. Siblings reflow because they are still in the same flex formatting context the
        whole time.
      </P>
      <FlexGrowBar />

      <H2>How you use the library</H2>
      <P>
        <Code>styled-components</Code> is a peer dependency — one copy in the app, none bundled
        inside the library:
      </P>
      <Pre lang="bash">{`npm install --save react-flex-animations styled-components`}</Pre>
      <P>
        Wrap the row in <Code>AnimatedFlexbox</Code>. Toggle visibility with{' '}
        <Code>data-hidden</Code>. Optionally set <Code>data-ratio</Code> if an item should not take
        an equal share (default is <Code>1</Code>). Style the wrapper the same way you style any
        other styled-component:
      </P>
      <Pre lang="tsx">{`import { AnimatedFlexbox } from 'react-flex-animations'
import styled from 'styled-components'

const Nav = styled(AnimatedFlexbox)\`
  height: 72px;
\`

function Toolbar({ hideLogo }: { hideLogo: boolean }) {
  return (
    <Nav component="nav" spacerComponent="div">
      <a href="/" data-hidden={hideLogo}>Logo</a>
      <section data-hidden={false}>Switcher</section>
      <section data-ratio={1}>Icons</section>
    </Nav>
  )
}`}</Pre>
      <P>
        That is the whole public API. <Code>component</Code> is the row's element type (default{' '}
        <Code>'section'</Code>). <Code>spacerComponent</Code> is what gets rendered for the leftover
        gutters when a child's ratio is less than 1 (default also <Code>'section'</Code>). Everything
        else is just children plus those two data attributes.
      </P>
      <P>
        The example app on GitHub cycles a fake window chrome every two seconds — logo, task
        switcher, right-side icons — by incrementing a counter and mapping it onto{' '}
        <Code>data-hidden</Code>:
      </P>
      <Pre lang="tsx">{`const [hide, setHide] = useState(0)
useEffect(() => {
  const t = setTimeout(() => setHide(hide + 1), 2000)
  return () => clearTimeout(t)
}, [hide])

<Nav component="nav" spacerComponent="div">
  <a data-hidden={hide % 4 === 1}>Logo</a>
  <section data-hidden={hide % 4 === 2}>TaskSwitcher</section>
  <Icons data-hidden={hide % 4 === 0} data-ratio={1} />
</Nav>`}</Pre>
      <P>
        Same pattern works for a row of images. Each <Code>{'<section>'}</Code> gets its own{' '}
        <Code>data-hidden</Code>; the row is just another <Code>styled(AnimatedFlexbox)</Code>. No
        per-item animation code.
      </P>

      <H2>How it actually works</H2>
      <P>
        <Code>AnimatedFlexbox</Code> does not wrap each child in a div. It maps over{' '}
        <Code>Children</Code>, and for every valid element it renders a <Code>Spaced</Code> helper
        whose <Code>component</Code> is the child itself. <Code>Spaced</Code> then does{' '}
        <Code>child.type</Code> and spreads the child's props onto a styled version of that type. An{' '}
        <Code>{'<a>'}</Code> stays an <Code>{'<a>'}</Code>. A <Code>{'<nav>'}</Code> stays a{' '}
        <Code>{'<nav>'}</Code>.
      </P>
      <Pre lang="tsx">{`Children.map(children, (child) =>
  isValidElement(child) && (
    <Spaced
      component={child}
      ratio={child.props['data-ratio'] || 1}
      hidden={child.props['data-hidden'] || false}
      spacerComponent={spacerComponent}
      {...child.props}
    />
  )
)`}</Pre>
      <P>
        Each spaced item is <Code>display: flex</Code> with <Code>{'flex: ${ratio}'}</Code> and{' '}
        <Code>overflow: hidden</Code>. Hide and show are CSS classes that play a keyframe:
      </P>
      <Pre lang="tsx">{`const shrink = keyframes\`
  to { flex: 0.00001; }
\`

&.hidden {
  flex: \${ratio};
  animation: \${shrink} 500ms ease forwards;
}

&.show {
  flex: 0.00001;
  animation: \${growTo(ratio)} 500ms ease forwards;
}`}</Pre>
      <P>
        The nearly-zero floor is the whole trick. <Code>flex: 0</Code> is a hard stop — some engines
        treat the item as gone and skip the interpolation. <Code>0.00001</Code> is still a flex item,
        still in the row, still a number the browser can ease toward. Content is clipped by{' '}
        <Code>overflow: hidden</Code>, so you never see a 0.001-wide smear of text. You also need{' '}
        <Code>min-width: 0</Code> — flex items default to <Code>min-width: auto</Code>, which refuses
        to shrink below the label, and an <Code>opacity: 0</Code> middle item then reads as a hole.
      </P>
      <P>
        If <Code>data-ratio</Code> is less than 1, leftover space is{' '}
        <Code>(1 - ratio) / 2</Code>. <Code>Spaced</Code> injects a spacer on each side of the child
        and animates those the same way, so a half-width item stays centered in its share while it
        collapses. Ratio of 1 — the default — means no spacers, just the item.
      </P>
      <P>
        The show keyframe is generated per ratio with styled-components:{' '}
        <Code>{'keyframes`to { flex: ${ratio}; }`'}</Code>. Hide always goes to the same floor, so
        that one is a shared <Code>shrink</Code> animation.
      </P>

      <H2>When I reach for it</H2>
      <P>
        Toolbars, segmented controls, a chrome row where items should eat each other's space.
        Anywhere the layout question is "how much of this flex line do I own?" and not "where did
        this card move on the page?"
      </P>
      <P>
        I still use the chip trick (<Code>max-width</Code> + negative margin to cancel a doubled
        gap) when the children have a natural width and the row should shrink-wrap. I still use FLIP
        when items jump between rows or across a grid. The library is the middle case — the one CSS
        almost gives you, if you remember not to animate <Code>display</Code>.
      </P>
      <P>
        Source and the cycling example live at{' '}
        <A href="https://github.com/AskAlice/react-flex-animations">
          github.com/AskAlice/react-flex-animations
        </A>
        . The package is on npm as <Code>react-flex-animations</Code>. Other work:{' '}
        <A href={LINKS.github}>{LINKS.github.replace('https://', '')}</A>.
      </P>
    </div>
  )
}
