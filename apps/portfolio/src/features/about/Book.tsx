import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { play, wake } from '../../lib/sound/sound'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { Icon } from '../../ui/Icon'

/** One side of a leaf. Pages come in reading order: the front cover first, the back cover last. */
export interface BookPage {
  readonly key: string
  /** What the page is, for the live announcement and the counter ("Preface", "Chapter 2: Three cities"). */
  readonly label: string
  readonly node: ReactNode
  /** The chapter a page belongs to, kept in the address (#three-cities) so a link opens the book there. */
  readonly anchor?: string
  readonly tone?: 'board' | 'endpaper' | 'paper'
}

export type BookMode = 'spread' | 'single'

/** Where the book is open: how many leaves have turned, and on phones, which page of the spread is in view. */
interface Place {
  readonly turned: number
  readonly side: 'left' | 'right'
}

interface BookNav {
  /** Opens the book at a page, turning the leaves between one after another. */
  readonly goTo: (page: number) => void
}

const NavContext = createContext<BookNav>({ goTo: () => undefined })
/** For a page that turns the book itself (the contents page). */
export const useBookNav = () => useContext(NavContext)

interface BookProps {
  readonly pages: readonly BookPage[]
  readonly mode: BookMode
  /** The page the book opens at (0, the closed cover, unless the address names a chapter). */
  readonly start: number
  readonly labels: { readonly previous: string; readonly next: string; readonly book: string; readonly of: string; readonly hint: string }
  /** Called with the first page in view after every turn. */
  readonly onTurn?: (page: number) => void
  /** Sits between the buttons (the single or two-page switch on phones). */
  readonly children?: ReactNode
  /** Printed down the spine, seen while the book is closed and turned a little towards the reader. */
  readonly spine?: ReactNode
}

/** A leaf's angle in degrees: 0 lying on the right, -180 turned over onto the left. */
const restAngle = (leaf: number, turned: number) => (leaf < turned ? -180 : 0)
const turnMs = 1050
const ease = 'cubic-bezier(.32,.08,.18,1)'

/** The place that shows a page: its spread, and which side of it on phones. */
function placeOf(page: number, leaves: number): Place {
  if (page <= 0) return { turned: 0, side: 'right' }
  if (page >= leaves * 2 - 1) return { turned: leaves, side: 'left' }
  return { turned: Math.ceil(page / 2), side: page % 2 ? 'left' : 'right' }
}

/** The pages in view at a place, in reading order. */
function pagesAt({ turned, side }: Place, leaves: number, mode: BookMode): number[] {
  const left = turned * 2 - 1
  const right = turned * 2
  if (turned === 0) return [0]
  if (turned === leaves) return [left]
  if (mode === 'single') return [side === 'left' ? left : right]
  return [left, right]
}

/**
 * A hard-bound book drawn in CSS 3D. Every leaf is one element turning about the spine, its two pages on its
 * two faces. Leaves are placed by hand (not by React) so a drag can move one at the pointer's pace, and the
 * shading follows the angle through a registered custom property. Only the leaves near the open spread carry
 * their content, so the pages far away cost nothing.
 *
 * Two-page spreads turn a leaf under the pointer: grab a page near its outer edge and pull it over, or tap that
 * edge. On phones, one page at a time: a swipe or a tap on either side moves on, and the book slides so the
 * page in view is centred.
 */
export function Book({ pages, mode, start, labels, onTurn, children, spine }: BookProps) {
  const leaves = pages.length / 2
  const reducedMotion = useReducedMotion()
  const [place, setPlace] = useState<Place>(() => placeOf(start, leaves))
  const bookRef = useRef<HTMLDivElement>(null)
  const leafRefs = useRef<(HTMLDivElement | null)[]>([])
  const angles = useRef<number[]>(Array.from({ length: leaves }, (_, leaf) => restAngle(leaf, place.turned)))
  const flying = useRef(new Map<number, number>())
  const lift = useRef(0)
  const steps = useRef<number[]>([])
  const placeRef = useRef(place)
  placeRef.current = place

  /** Puts a leaf at an angle, turning to it over `ms`, or at once. */
  const put = useCallback(
    (leaf: number, angle: number, ms: number) => {
      const element = leafRefs.current[leaf]
      if (!element) return
      const duration = reducedMotion ? 0 : ms
      element.style.transition = duration ? `transform ${duration}ms ${ease}, --leaf-t ${duration}ms ${ease}` : 'none'
      element.style.transform = `rotateY(${angle}deg)`
      element.style.setProperty('--leaf-t', String(Math.min(1, Math.max(0, -angle / 180))))
      angles.current[leaf] = angle
      // In flight, a leaf rides over both stacks; once down, it takes its place in one of them.
      window.clearTimeout(flying.current.get(leaf))
      element.style.zIndex = String(200 + ++lift.current)
      flying.current.set(
        leaf,
        window.setTimeout(() => {
          const turned = placeRef.current.turned
          element.style.zIndex = String(leaf < turned ? leaf + 1 : leaves - leaf)
          flying.current.delete(leaf)
        }, duration + 30),
      )
    },
    [leaves, reducedMotion],
  )

  // Every change of place turns the leaves whose side changed, and only those.
  const first = useRef(true)
  useLayoutEffect(() => {
    leafRefs.current.forEach((element, leaf) => {
      if (!element) return
      const target = restAngle(leaf, place.turned)
      if (first.current) {
        element.style.transform = `rotateY(${target}deg)`
        element.style.setProperty('--leaf-t', String(-target / 180))
        element.style.zIndex = String(leaf < place.turned ? leaf + 1 : leaves - leaf)
        angles.current[leaf] = target
        return
      }
      const from = angles.current[leaf] ?? target
      if (from === target) return
      put(leaf, target, Math.max(320, (turnMs * Math.abs(target - from)) / 180))
      play(leaf === 0 || leaf === leaves - 1 ? 'cover' : 'leaf', Math.abs(target - from) / 180, target < from ? 1 : -1)
    })
    first.current = false
  }, [place.turned, leaves, put])

  useEffect(() => {
    onTurn?.(pagesAt(place, leaves, mode)[0] ?? 0)
  }, [place, leaves, mode, onTurn])

  const go = useCallback(
    (next: Place) => {
      steps.current.forEach(window.clearTimeout)
      steps.current = []
      setPlace(next)
    },
    [],
  )

  const forward = useCallback(() => {
    const { turned, side } = placeRef.current
    if (mode === 'single' && side === 'left' && turned > 0 && turned < leaves) return go({ turned, side: 'right' })
    if (turned < leaves) go({ turned: turned + 1, side: 'left' })
  }, [go, leaves, mode])

  const back = useCallback(() => {
    const { turned, side } = placeRef.current
    if (mode === 'single' && side === 'right' && turned > 0) return go({ turned, side: 'left' })
    if (turned > 0) go({ turned: turned - 1, side: turned - 1 === 0 ? 'right' : 'right' })
  }, [go, mode])

  /** Turns leaf by leaf to a page, a beat apart, like thumbing through. */
  const goTo = useCallback(
    (page: number) => {
      const target = placeOf(page, leaves)
      steps.current.forEach(window.clearTimeout)
      const from = placeRef.current.turned
      const direction = Math.sign(target.turned - from)
      const count = Math.abs(target.turned - from)
      steps.current = Array.from({ length: count }, (_, step) =>
        window.setTimeout(
          () => setPlace({ turned: from + direction * (step + 1), side: step === count - 1 ? target.side : 'left' }),
          reducedMotion ? 0 : step * 140,
        ),
      )
      if (!count) setPlace(target)
    },
    [leaves, reducedMotion],
  )

  // The arrow keys turn the pages, unless someone is typing.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if ((event.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return
      if (event.key === 'ArrowRight') forward()
      else if (event.key === 'ArrowLeft') back()
      else if (event.key === 'Home') goTo(0)
      else if (event.key === 'End') goTo(pages.length - 1)
      else return
      wake()
      event.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [forward, back, goTo, pages.length])

  // Dragging a page over, or a tap near its outer edge.
  const drag = useRef<{
    id: number
    x0: number
    y0: number
    spine: number
    reach: number
    leaf: number
    ahead: boolean
    moved: boolean
    vx: number
    lastX: number
    lastT: number
  } | null>(null)

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || drag.current) return
    if ((event.target as HTMLElement).closest('a, button, [data-no-turn]')) return
    const book = bookRef.current
    if (!book) return
    wake()
    const box = book.getBoundingClientRect()
    const spine = box.left + box.width / 2
    const ahead = event.clientX >= spine
    const { turned } = placeRef.current
    const leaf = ahead ? turned : turned - 1
    if (mode === 'spread' && (leaf < 0 || leaf >= leaves)) return
    drag.current = {
      id: event.pointerId,
      x0: event.clientX,
      y0: event.clientY,
      spine,
      reach: box.width / 2,
      leaf,
      ahead,
      moved: false,
      vx: 0,
      lastX: event.clientX,
      lastT: event.timeStamp,
    }
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    const dx = event.clientX - state.x0
    if (!state.moved) {
      // A mostly vertical move is the page scrolling, not a turn.
      if (Math.abs(event.clientY - state.y0) > 10 && Math.abs(dx) < Math.abs(event.clientY - state.y0)) return (drag.current = null)
      if (Math.abs(dx) < 6) return
      state.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    const dt = Math.max(1, event.timeStamp - state.lastT)
    state.vx = state.vx * 0.6 + ((event.clientX - state.lastX) / dt) * 0.4
    state.lastX = event.clientX
    state.lastT = event.timeStamp
    if (mode !== 'spread') return
    // The leaf's free edge follows the pointer: its shadow on the table is where the pointer is.
    const grab = state.x0 - state.spine
    const span = Math.sign(grab || 1) * Math.max(Math.abs(grab), state.reach * 0.4)
    const reach = Math.min(1, Math.max(-1, (event.clientX - state.spine) / span))
    const swung = (Math.acos(reach) * 180) / Math.PI
    put(state.leaf, state.ahead ? -swung : -180 + swung, 0)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    drag.current = null
    if (!state.moved) {
      // A tap turns only near a page's outer edge, so photos and text can be touched without turning.
      const book = bookRef.current?.getBoundingClientRect()
      if (!book) return
      const page = mode === 'spread' ? book.width / 2 : book.width / 2
      const fromSpine = Math.abs(event.clientX - state.spine)
      if (mode === 'spread' ? fromSpine > page * 0.55 || placeRef.current.turned % leaves === 0 : true) {
        if (mode === 'single') return void (event.clientX > window.innerWidth / 2 ? forward() : back())
        return void (state.ahead ? forward() : back())
      }
      return
    }
    if (mode !== 'spread') return void (event.clientX - state.x0 < 0 ? forward() : back())
    const angle = angles.current[state.leaf] ?? 0
    const swung = state.ahead ? -angle : 180 + angle
    const flick = state.ahead ? -state.vx : state.vx
    const turn = flick > 0.35 || (swung > 90 && flick > -0.35)
    if (turn) return void (state.ahead ? forward() : back())
    put(state.leaf, restAngle(state.leaf, placeRef.current.turned), 420)
  }

  const onPointerCancel = () => {
    const state = drag.current
    drag.current = null
    if (state?.moved) put(state.leaf, restAngle(state.leaf, placeRef.current.turned), 420)
  }

  const inView = pagesAt(place, leaves, mode)
  const { turned, side } = place
  // The book slides to keep what's open centred: the closed covers sit in the middle, and on phones the page in view.
  const shift =
    mode === 'spread' ? (turned === 0 ? -25 : turned === leaves ? 25 : 0) : turned === 0 || (side === 'right' && turned < leaves) ? -50 : 0
  const nav = useMemo(() => ({ goTo }), [goTo])
  const atStart = turned === 0
  const atEnd = turned === leaves
  const counter = inView.map((page) => page).filter((page) => page > 0 && page < pages.length - 1)
  const label = pages[inView[inView.length - 1] ?? 0]?.label ?? ''

  return (
    <NavContext.Provider value={nav}>
      <div className="book-stage" data-mode={mode} data-closed={atStart ? 'front' : atEnd ? 'back' : undefined}>
        {/* The spine: the book's rounded back, turned to face the side, joined to the front board at the hinge. */}
        <span className="book-spine" aria-hidden="true" style={{ '--shift-len': `calc(var(--page-w) * ${shift / 50})` } as React.CSSProperties}>
          <span className="book-spine__label">{spine}</span>
        </span>
        <div
          ref={bookRef}
          className="book"
          role="region"
          aria-roledescription={labels.book}
          aria-label={pages[0]?.label}
          data-open={!atStart && !atEnd ? '' : undefined}
          data-closed={atStart ? 'front' : atEnd ? 'back' : undefined}
          style={{ '--shift': `${shift}%`, '--left-stack': turned / leaves, '--right-stack': (leaves - turned) / leaves } as React.CSSProperties}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        >
          <span className="book__block book__block--left" aria-hidden="true" />
          <span className="book__block book__block--right" aria-hidden="true" />
          {Array.from({ length: leaves }, (_, leaf) => {
            const front = pages[leaf * 2]
            const back = pages[leaf * 2 + 1]
            // Only the leaves near the open spread draw their pages.
            const near = leaf >= turned - 3 && leaf <= turned + 2
            const board = leaf === 0 || leaf === leaves - 1
            return (
              <div
                key={front?.key ?? leaf}
                ref={(element) => {
                  leafRefs.current[leaf] = element
                }}
                className={`leaf${board ? ' leaf--board' : ''}`}
              >
                <div className={`leaf__face leaf__face--front book-page--${front?.tone ?? 'paper'}`} inert={!inView.includes(leaf * 2)}>
                  {near ? front?.node : null}
                  <span className="leaf__shade" aria-hidden="true" />
                </div>
                <div className={`leaf__face leaf__face--back book-page--${back?.tone ?? 'paper'}`} inert={!inView.includes(leaf * 2 + 1)}>
                  {near ? back?.node : null}
                  <span className="leaf__shade" aria-hidden="true" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="book-controls">
        <button type="button" className="book-controls__turn" onClick={back} disabled={atStart} aria-label={labels.previous}>
          <Icon name="arrowLeft" size={16} />
        </button>
        <p className="book-controls__where" aria-live="polite">
          <span className="book-controls__label">{label}</span>
          {counter.length ? (
            <span className="book-controls__count">
              {counter.join('–')} {labels.of} {pages.length - 2}
            </span>
          ) : (
            <span className="book-controls__count">{labels.hint}</span>
          )}
        </p>
        <button type="button" className="book-controls__turn" onClick={forward} disabled={atEnd} aria-label={labels.next}>
          <Icon name="arrowRight" size={16} />
        </button>
      </div>
      {children}
    </NavContext.Provider>
  )
}
