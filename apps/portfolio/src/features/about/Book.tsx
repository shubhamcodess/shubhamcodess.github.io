import {
  createContext,
  startTransition,
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
  readonly labels: {
    readonly previous: string
    readonly next: string
    readonly book: string
    readonly of: string
    readonly hint: string
    readonly front: string
    readonly back: string
  }
  /** Called with the first page in view after every turn. */
  readonly onTurn?: (page: number) => void
  /** Sits between the buttons (the single or two-page switch on phones). */
  readonly children?: ReactNode
  /** Printed down the spine, seen while the book is closed and turned a little towards the reader. */
  readonly spine?: ReactNode
}

/** A leaf's angle in degrees: 0 lying on the right, -180 turned over onto the left. */
const restAngle = (leaf: number, turned: number) => (leaf < turned ? -180 : 0)
const turnMs = 1000
const ease = 'cubic-bezier(.32,.08,.18,1)'
const rotate = (angle: number) => `rotateY(${angle}deg)`
/** How dark each face is at an angle: the face swinging away from the light darkens. */
const shadeFront = (angle: number) => Math.min(1, (-angle / 180) * 2.2)
const shadeBack = (angle: number) => Math.min(1, (1 + angle / 180) * 2.2)

/** A leaf's angle as drawn right now, mid-turn or not, read back from its computed transform. */
function drawnAngle(element: HTMLElement, fallback: number): number {
  const matrix = getComputedStyle(element).transform
  const values = /matrix3d\(([^)]+)\)/.exec(matrix)?.[1]?.split(',').map(Number)
  if (!values || values.length < 3) return fallback
  const angle = (Math.atan2(-(values[2] ?? 0), values[0] ?? 1) * 180) / Math.PI
  return angle > 0.5 ? angle - 360 : angle
}

/**
 * A hard-bound book drawn in CSS 3D. Every leaf is one element turning about the spine, with a page on each of
 * its faces. Leaves are placed by hand (not by React) so a drag can move one at the pointer's pace; a turn is a
 * Web Animation of the transform and of each face's shading, so it runs on the compositor and stays smooth on
 * phones. Only the leaves near the open page carry their content, so the pages far away cost nothing.
 *
 * Two pages: each leaf is a sheet, a page on each side. Grab a page and pull it over, or tap near its outer edge.
 * One page (phones): every page is its own leaf, so each turn is one continuous flip of the page in view, which
 * lifts off to the left and leaves the next page underneath. A swipe or a tap turns it.
 */
export function Book({ pages, mode, start, labels, onTurn, children, spine }: BookProps) {
  const single = mode === 'single'
  // The leaves: in two-page mode a sheet per two pages; in one-page mode a leaf per page, blank on the back.
  const sheets = useMemo(
    () =>
      single
        ? pages.map((page, index) => ({ front: page, frontIndex: index, back: undefined, backIndex: -1 }))
        : Array.from({ length: pages.length / 2 }, (_, leaf) => ({
            front: pages[leaf * 2],
            frontIndex: leaf * 2,
            back: pages[leaf * 2 + 1],
            backIndex: leaf * 2 + 1,
          })),
    [pages, single],
  )
  const leaves = sheets.length
  // How far the book can turn: past the last sheet in two-page mode (closed on its back), to the last page in one.
  const last = single ? leaves - 1 : leaves
  const placeOf = useCallback(
    (page: number) => (single ? Math.min(last, Math.max(0, page)) : page <= 0 ? 0 : page >= pages.length - 1 ? leaves : Math.ceil(page / 2)),
    [single, last, pages.length, leaves],
  )
  const reducedMotion = useReducedMotion()
  const [turned, setTurned] = useState(() => placeOf(start))
  // Where the pages are prepared around: it catches up with `turned` only once a turn has landed, so mounting the
  // next pages (their photos, their layers) never happens while a page is in the air.
  const [settled, setSettled] = useState(turned)
  useEffect(() => {
    if (settled === turned) return
    const timer = window.setTimeout(() => startTransition(() => setSettled(turned)), turnMs + 120)
    return () => window.clearTimeout(timer)
  }, [turned, settled])
  const bookRef = useRef<HTMLDivElement>(null)
  const leafRefs = useRef<(HTMLDivElement | null)[]>([])
  const angles = useRef<number[]>(Array.from({ length: leaves }, (_, leaf) => restAngle(leaf, turned)))
  const flying = useRef(new Map<number, number>())
  /** The leaf under the pointer while a page is dragged. */
  const held = useRef<number | null>(null)
  /** The leaf a drag just turned, which may already lie where the turn ends. */
  const dragged = useRef<number | null>(null)
  /** A drag's next angle, drawn once per frame. */
  const pending = useRef<{ leaf: number; angle: number; frame: number } | null>(null)
  const lift = useRef(0)
  const steps = useRef<number[]>([])
  const turnedRef = useRef(turned)
  turnedRef.current = turned

  const restZ = useCallback((leaf: number) => String(leaf < turnedRef.current ? leaf + 1 : leaves - leaf), [leaves])

  const shade = (element: HTMLElement, angle: number) => {
    const [front, back] = element.querySelectorAll<HTMLElement>(':scope > .leaf__face > .leaf__shade')
    return { front, back, frontTo: shadeFront(angle), backTo: shadeBack(angle) }
  }

  /** Puts a leaf at an angle, turning to it over `ms` from wherever it is drawn now, or at once. */
  const put = useCallback(
    (leaf: number, angle: number, ms: number) => {
      const element = leafRefs.current[leaf]
      if (!element) return
      const duration = reducedMotion ? 0 : ms
      const from = duration ? drawnAngle(element, angles.current[leaf] ?? angle) : angle
      for (const running of element.getAnimations({ subtree: true })) running.cancel()
      angles.current[leaf] = angle
      element.removeAttribute('data-away')
      const { front, back, frontTo, backTo } = shade(element, angle)
      element.style.transform = rotate(angle)
      if (front) front.style.opacity = String(frontTo)
      if (back) back.style.opacity = String(backTo)
      if (duration && from !== angle) {
        const timing = { duration, easing: ease }
        element.animate([{ transform: rotate(from) }, { transform: rotate(angle) }], timing)
        // The shading follows the same curve, sampled along the turn.
        const along = [0, 0.25, 0.5, 0.75, 1].map((offset) => from + (angle - from) * offset)
        front?.animate(along.map((a) => ({ opacity: shadeFront(a) })), timing)
        back?.animate(along.map((a) => ({ opacity: shadeBack(a) })), timing)
      }
      // In flight, a leaf rides over both stacks; once down, it takes its place in one of them. A leaf held by the
      // pointer stays on top for the whole drag and settles only once it is let go.
      window.clearTimeout(flying.current.get(leaf))
      if (held.current === leaf) {
        if (Number(element.style.zIndex) < 200) element.style.zIndex = String(200 + ++lift.current)
        return
      }
      element.style.zIndex = String(200 + ++lift.current)
      flying.current.set(
        leaf,
        window.setTimeout(() => {
          element.style.zIndex = restZ(leaf)
          element.toggleAttribute('data-away', angles.current[leaf] === -180)
          flying.current.delete(leaf)
        }, duration + 30),
      )
    },
    [reducedMotion, restZ],
  )

  // Every change of place turns the leaves whose side changed, and only those. A jump to a cover lays the pages
  // between straight down and swings only the board, so the book shuts in one move.
  const first = useRef(true)
  const jumping = useRef(false)
  useLayoutEffect(() => {
    leafRefs.current.forEach((element, leaf) => {
      if (!element) return
      const target = restAngle(leaf, turned)
      if (first.current) {
        element.style.transform = rotate(target)
        const { front, back, frontTo, backTo } = shade(element, target)
        if (front) front.style.opacity = String(frontTo)
        if (back) back.style.opacity = String(backTo)
        element.style.zIndex = restZ(leaf)
        element.toggleAttribute('data-away', target === -180)
        angles.current[leaf] = target
        return
      }
      const from = angles.current[leaf] ?? target
      if (from === target) {
        // A page dragged all the way over is already in place: it still makes its sound and settles into its stack.
        if (dragged.current === leaf) {
          put(leaf, target, 0)
          play(leaf === 0 || leaf === leaves - 1 ? 'cover' : 'leaf', 1, leaf < turned ? 1 : -1)
        }
        return
      }
      const board = leaf === 0 || leaf === leaves - 1
      if (jumping.current && !board) return put(leaf, target, 0)
      if (import.meta.env.DEV) window.dispatchEvent(new CustomEvent('about:turn', { detail: `${mode} leaf ${leaf}` }))
      put(leaf, target, Math.max(320, (turnMs * Math.abs(target - from)) / 180))
      play(leaf === 0 || leaf === leaves - 1 ? 'cover' : 'leaf', Math.abs(target - from) / 180, target < from ? 1 : -1)
    })
    first.current = false
    jumping.current = false
    dragged.current = null
  }, [turned, leaves, put, restZ, mode])

  const inView = single
    ? [turned]
    : turned === 0
      ? [0]
      : turned === leaves
        ? [pages.length - 1]
        : [turned * 2 - 1, turned * 2]

  useEffect(() => {
    onTurn?.(inView[0] ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turned, single, onTurn])

  const go = useCallback((next: number) => {
    steps.current.forEach(window.clearTimeout)
    steps.current = []
    setTurned(next)
  }, [])

  const forward = useCallback(() => {
    if (turnedRef.current < last) go(turnedRef.current + 1)
  }, [go, last])

  const back = useCallback(() => {
    if (turnedRef.current > 0) go(turnedRef.current - 1)
  }, [go])

  /** Shuts the book on its front or back cover in one move. */
  const shut = useCallback(
    (side: 'front' | 'back') => {
      const target = side === 'front' ? 0 : last
      if (turnedRef.current === target) return
      jumping.current = true
      wake()
      go(target)
    },
    [go, last],
  )

  /** Turns leaf by leaf to a page, a beat apart, like thumbing through. */
  const goTo = useCallback(
    (page: number) => {
      const target = placeOf(page)
      steps.current.forEach(window.clearTimeout)
      const from = turnedRef.current
      const direction = Math.sign(target - from)
      const count = Math.abs(target - from)
      steps.current = Array.from({ length: count }, (_, step) =>
        window.setTimeout(() => setTurned(from + direction * (step + 1)), reducedMotion ? 0 : step * 140),
      )
    },
    [placeOf, reducedMotion],
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
    const leaf = ahead ? turnedRef.current : turnedRef.current - 1
    if (!single && (leaf < 0 || leaf >= leaves)) return
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
      if (single) {
        // One page: pulling left turns the page in view; pulling right brings the last one back.
        state.ahead = dx < 0
        state.leaf = state.ahead ? turnedRef.current : turnedRef.current - 1
        if (state.leaf < 0 || state.leaf >= last) return (drag.current = null)
      }
      state.moved = true
      event.currentTarget.setPointerCapture(event.pointerId)
    }
    const dt = Math.max(1, event.timeStamp - state.lastT)
    state.vx = state.vx * 0.6 + ((event.clientX - state.lastX) / dt) * 0.4
    state.lastX = event.clientX
    state.lastT = event.timeStamp
    let angle: number
    if (single) {
      const progress = Math.min(1, Math.max(0, (state.ahead ? -dx : dx) / state.reach))
      angle = state.ahead ? -180 * progress : -180 + 180 * progress
    } else {
      // The leaf's free edge follows the pointer: its shadow on the table is where the pointer is.
      const grab = state.x0 - state.spine
      const span = Math.sign(grab || 1) * Math.max(Math.abs(grab), state.reach * 0.4)
      const reach = Math.min(1, Math.max(-1, (event.clientX - state.spine) / span))
      const swung = (Math.acos(reach) * 180) / Math.PI
      angle = state.ahead ? -swung : -180 + swung
    }
    held.current = state.leaf
    // Drawn once per frame, however often the pointer reports.
    if (pending.current) pending.current = { ...pending.current, leaf: state.leaf, angle }
    else
      pending.current = {
        leaf: state.leaf,
        angle,
        frame: requestAnimationFrame(() => {
          const next = pending.current
          pending.current = null
          if (next && held.current === next.leaf) put(next.leaf, next.angle, 0)
        }),
      }
  }

  /** Lets go of a dragged leaf: drops any frame still to draw, and lets it settle into its stack again. */
  const release = () => {
    if (pending.current) {
      cancelAnimationFrame(pending.current.frame)
      const last = pending.current
      pending.current = null
      if (held.current === last.leaf) angles.current[last.leaf] = last.angle
    }
    held.current = null
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state || state.id !== event.pointerId) return
    drag.current = null
    release()
    if (!state.moved) {
      if (single) {
        // One page: a tap on its left third goes back, anywhere else turns it.
        const box = bookRef.current?.getBoundingClientRect()
        if (!box) return
        return void (event.clientX < state.spine + (box.width / 2) * 0.33 ? back() : forward())
      }
      // A tap turns only near a page's outer edge, so photos and text can be touched without turning.
      const fromSpine = Math.abs(event.clientX - state.spine)
      if (fromSpine > state.reach * 0.55 || turnedRef.current % leaves === 0) return void (state.ahead ? forward() : back())
      return
    }
    const angle = angles.current[state.leaf] ?? 0
    const swung = state.ahead ? -angle : 180 + angle
    const flick = state.ahead ? -state.vx : state.vx
    const turn = flick > 0.35 || (swung > 90 && flick > -0.35)
    dragged.current = state.leaf
    if (turn) return void (state.ahead ? forward() : back())
    dragged.current = null
    put(state.leaf, restAngle(state.leaf, turnedRef.current), 420)
  }

  const onPointerCancel = () => {
    const state = drag.current
    drag.current = null
    release()
    if (state?.moved) put(state.leaf, restAngle(state.leaf, turnedRef.current), 420)
  }

  // The book slides to keep what's open centred: the closed covers sit in the middle; one page at a time shows the right half.
  const shift = single ? -50 : turned === 0 ? -25 : turned === leaves ? 25 : 0
  const nav = useMemo(() => ({ goTo }), [goTo])
  const atStart = turned === 0
  const atEnd = turned === last
  const counter = inView.filter((page) => page > 0 && page < pages.length - 1)
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
          {sheets.map((sheet, leaf) => {
            // Only the leaves near the open page draw their pages and keep a layer of their own.
            const around = (at: number) => (single ? leaf >= at - 2 && leaf <= at + 2 : leaf >= at - 3 && leaf <= at + 2)
            const near = around(settled) || (leaf >= turned - 1 && leaf <= turned + 1)
            const board = leaf === 0 || leaf === leaves - 1
            // One page at a time: only the page in view and the ones a turn can move exist at all, so a phone
            // never holds more than three page layers (more runs it out of graphics memory and it blanks the screen).
            if (single && (leaf < Math.min(turned, settled) - 1 || leaf > Math.max(turned, settled) + 1)) return null
            return (
              <div
                key={sheet.front?.key ?? leaf}
                ref={(element) => {
                  leafRefs.current[leaf] = element
                  // A leaf that has just come back into the book is laid at rest for where the book is open.
                  if (element && !element.style.transform) {
                    const rest = restAngle(leaf, turnedRef.current)
                    element.style.transform = rotate(rest)
                    element.style.zIndex = restZ(leaf)
                    element.toggleAttribute('data-away', rest === -180)
                    const [front, back] = element.querySelectorAll<HTMLElement>(':scope > .leaf__face > .leaf__shade')
                    if (front) front.style.opacity = String(shadeFront(rest))
                    if (back) back.style.opacity = String(shadeBack(rest))
                    angles.current[leaf] = rest
                  }
                }}
                className={`leaf${board ? ' leaf--board' : ''}`}
              >
                <div
                  className={`leaf__face leaf__face--front book-page--${sheet.front?.tone ?? 'paper'}`}
                  inert={!inView.includes(sheet.frontIndex)}
                >
                  {near ? sheet.front?.node : null}
                  <span className="leaf__shade" aria-hidden="true" />
                </div>
                <div
                  className={`leaf__face leaf__face--back book-page--${sheet.back?.tone ?? (board && single ? 'board' : 'paper')}`}
                  inert={!inView.includes(sheet.backIndex)}
                >
                  {near ? sheet.back?.node : null}
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
      <div className="book-jump">
        <button type="button" className="book-jump__button" onClick={() => shut('front')} disabled={atStart}>
          <Icon name="arrowLeft" size={12} /> {labels.front}
        </button>
        <button type="button" className="book-jump__button" onClick={() => shut('back')} disabled={atEnd}>
          {labels.back} <Icon name="arrowRight" size={12} />
        </button>
      </div>
      {children}
    </NavContext.Provider>
  )
}
