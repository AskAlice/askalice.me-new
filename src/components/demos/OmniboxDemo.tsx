import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { classifyQuery, parseSuggestions, searchUrl, suggestEndpoint, type QueryKind, type Suggestion } from '../../lib/omnibox'
import { SearchIcon } from '../icons'

const EXAMPLES = ['google.com mx', 'askalice.me a', '1.1.1.1', '!gh home-automation-pcbs', '12*15+40']
const DEBOUNCE_MS = 250

type State =
  | { s: 'idle' }
  | { s: 'loading' }
  | { s: 'ok'; rows: Suggestion[] }
  | { s: 'error'; msg: string }

/** Human label for the engine branch a query will take. */
function kindLabel(k: QueryKind): string {
  switch (k.kind) {
    case 'dig':
      return `DNS dig · ${k.record} records for ${k.domain} (DoH via 1.1.1.1)`
    case 'ip':
      return 'IP → location (MaxMind GeoLite2)'
    case 'bang':
      return `!${k.bang} bang${k.rest ? ` · “${k.rest}”` : ''}`
    case 'search':
      return 'Google suggestions + DuckDuckGo bangs'
  }
}

/** Open a URL in a new tab without giving it a handle on this page. */
function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Live omnibox wired to the real search.emu.sh engine (AI Studio draft's
 * SearchEmuShowcase, rebuilt). Typing debounces a GET to /api/suggest; the
 * rows are whatever the engine returns. Enter, or picking a row, opens
 * search.emu.sh/search in a new tab, which applies the real bang and engine
 * routing. ARIA combobox pattern with arrow-key selection.
 */
export function OmniboxDemo() {
  const [q, setQ] = useState('')
  const [state, setState] = useState<State>({ s: 'idle' })
  const [active, setActive] = useState(-1)
  const [nonce, setNonce] = useState(0) // bump to retry
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const query = q.trim()
    setActive(-1)
    if (!query) {
      setState({ s: 'idle' })
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      setState({ s: 'loading' })
      try {
        const res = await fetch(suggestEndpoint(query), { signal: ctrl.signal, headers: { accept: 'application/json' } })
        const body: unknown = await res.json().catch(() => null)
        if (!res.ok) {
          const msg = body && typeof body === 'object' && 'error' in body ? String((body as { error: unknown }).error) : `HTTP ${res.status}`
          setState({ s: 'error', msg })
          return
        }
        setState({ s: 'ok', rows: parseSuggestions(body) })
      } catch (e) {
        if (ctrl.signal.aborted) return
        setState({ s: 'error', msg: e instanceof Error ? e.message : 'network error' })
      }
    }, DEBOUNCE_MS)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q, nonce])

  const rows = state.s === 'ok' ? state.rows : []
  const pick = (r: Suggestion) => openExternal(r.href ?? searchUrl(r.text))

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && rows.length) {
      e.preventDefault()
      setActive((a) => (a + 1) % rows.length)
    } else if (e.key === 'ArrowUp' && rows.length) {
      e.preventDefault()
      setActive((a) => (a <= 0 ? rows.length - 1 : a - 1))
    } else if (e.key === 'Enter' && q.trim()) {
      e.preventDefault()
      const r = rows[active]
      if (r) pick(r)
      else openExternal(searchUrl(q))
    } else if (e.key === 'Escape') {
      setActive(-1)
    }
  }

  const kind = classifyQuery(q)

  return (
    <div className="border border-white/12 rounded-18px overflow-hidden bg-[#121018]">
      <div className="flex items-center gap-8px px-14px py-10px border-b border-white/8 bg-white/3">
        <span className="flex gap-6px" aria-hidden="true">
          <span className="w-10px h-10px rounded-full bg-[#ff5f57]" />
          <span className="w-10px h-10px rounded-full bg-[#febc2e]" />
          <span className="w-10px h-10px rounded-full bg-[#28c840]" />
        </span>
        <span className="font-mono text-11.5px text-muted ml-6px">omnibox · live against search.emu.sh</span>
      </div>

      <div className="p-18px">
        <div className="relative">
          <SearchIcon className="absolute left-14px top-1/2 -translate-y-1/2 text-faint" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value.slice(0, 200))}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded={rows.length > 0}
            aria-controls={listId}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            aria-autocomplete="list"
            aria-label="Try the search.emu.sh omnibox"
            placeholder="type like it's your address bar: google.com mx, 1.1.1.1, !gh …"
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-[#0b0910] border border-white/14 rounded-full pl-40px pr-16px py-12px font-mono text-14px text-bright outline-none focus:border-flamingo/60"
          />
        </div>

        <div className="flex flex-wrap gap-6px mt-12px">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQ(ex)
                inputRef.current?.focus()
              }}
              className="font-mono text-11.5px px-10px py-5px rounded-full border border-white/12 text-muted hover:text-bright hover:border-flamingo/40"
            >
              {ex}
            </button>
          ))}
        </div>

        {q.trim() && <div className="font-mono text-11.5px text-sky mt-14px">→ {kindLabel(kind)}</div>}

        <div className="mt-10px min-h-120px" aria-live="polite">
          {state.s === 'idle' && (
            <p className="text-muted text-14px m-0 mt-14px">
              Suggestions come from the real engine. Enter opens its search, which follows the same bang and routing rules.
            </p>
          )}
          {state.s === 'loading' && <p className="font-mono text-12px text-faint m-0 mt-14px">asking search.emu.sh…</p>}
          {state.s === 'error' && (
            <p className="text-14px text-butter m-0 mt-14px">
              Couldn’t reach search.emu.sh ({state.msg}).{' '}
              <button type="button" className="text-pink underline" onClick={() => setNonce((n) => n + 1)}>
                Retry
              </button>
            </p>
          )}
          {state.s === 'ok' && rows.length === 0 && <p className="text-muted text-14px m-0 mt-14px">No suggestions for that one.</p>}
          {rows.length > 0 && (
            <ul id={listId} role="listbox" aria-label="Suggestions" className="list-none p-0 m-0 border border-white/10 rounded-14px overflow-hidden">
              {rows.map((r, j) => (
                <li
                  key={r.text}
                  id={`${listId}-${j}`}
                  role="option"
                  aria-selected={j === active}
                  onMouseEnter={() => setActive(j)}
                  onClick={() => pick(r)}
                  className={`flex items-center gap-12px px-14px py-10px cursor-pointer border-b border-white/6 last:border-b-0 ${j === active ? 'bg-flamingo/12' : ''}`}
                >
                  {r.image ? (
                    <img src={r.image} alt="" width={20} height={20} loading="lazy" referrerPolicy="no-referrer" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} className="w-20px h-20px object-contain shrink-0 rounded-4px" />
                  ) : (
                    <SearchIcon size={15} className="text-faint shrink-0" />
                  )}
                  <span className="min-w-0">
                    <span className="block font-mono text-13.5px text-bright truncate">{r.text}</span>
                    {r.annotation && <span className="block text-12.5px text-muted truncate">{r.annotation}</span>}
                  </span>
                  <span className="ml-auto font-mono text-10.5px text-faint shrink-0">{r.href ? 'open ↗' : r.type?.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
