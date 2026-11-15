import { useEffect, useRef } from 'react'
import { site } from '../config/site'
import { useReducedMotion } from '../lib/useReducedMotion'
import './comet-cursor.css'

/** What counts as clickable, for the cursor's hover state. */
const clickable = 'a[href], button, summary, [role="button"], label'

/**
 * The pointer as a comet: a dart-shaped head the size of the system arrow, its tip exactly on the
 * hotspot, a tail that stretches with speed, and a faint bow wave ahead of the tip where it bends the
 * space it moves through. White, blended by difference, so it takes the opposite of whatever is under it.
 * Pointer devices only. With reduced motion it is still a comet, just one that doesn't stretch.
 */
export function CometCursor() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    if (!root || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const { tailMax, bowAt } = site.cometCursor
    const html = document.documentElement
    html.dataset.cursor = 'comet'

    let x = -100
    let y = -100
    let lastX = x
    let lastY = y
    let lastAt = performance.now()
    let speed = 0
    let frame = 0

    // Speed eases down when the pointer stops, so the tail draws back in rather than vanishing.
    const settle = () => {
      frame = 0
      speed *= 0.86
      root.style.setProperty('--comet-speed', speed.toFixed(3))
      if (speed > 0.01) frame = requestAnimationFrame(settle)
    }

    const onMove = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      root.style.transform = `translate3d(${x}px, ${y}px, 0)`
      root.dataset.shown = 'true'
      const now = performance.now()
      const elapsed = Math.max(8, now - lastAt)
      const pxPerMs = Math.hypot(x - lastX, y - lastY) / elapsed
      lastX = x
      lastY = y
      lastAt = now
      if (!reducedMotion) {
        speed = Math.min(1, Math.max(speed, pxPerMs / 2.2))
        root.style.setProperty('--comet-speed', speed.toFixed(3))
        frame ||= requestAnimationFrame(settle)
      }
      const target = event.target instanceof Element ? event.target.closest(clickable) : null
      root.dataset.over = target ? 'clickable' : 'none'
    }
    const onDown = () => {
      root.dataset.pressed = 'true'
    }
    const onUp = () => {
      delete root.dataset.pressed
    }
    const onLeave = () => {
      root.dataset.shown = 'false'
    }

    root.style.setProperty('--comet-tail-max', String(tailMax))
    root.style.setProperty('--comet-bow-at', String(bowAt))
    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('pointerup', onUp)
    html.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      delete html.dataset.cursor
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      html.removeEventListener('pointerleave', onLeave)
    }
  }, [reducedMotion])

  return (
    <div className="comet" ref={rootRef} data-shown="false" aria-hidden="true">
      <svg className="comet__svg" width="48" height="48" viewBox="-12 -12 48 48" overflow="visible">
        <defs>
          <linearGradient id="comet-tail" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* The tail streams back from the notch along the arrow's axis, longer the faster it moves. */}
        <g className="comet__tail">
          <path d="M6.2 8.4 L8.4 6.2 L20 20 Z" fill="url(#comet-tail)" />
        </g>
        {/* The bow wave: a thin arc just ahead of the tip, where the comet bends the space. */}
        <path className="comet__bow" d="M-4.6 2.4 Q-3.6 -3.6 2.4 -4.6" fill="none" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" />
        {/* The head: a dart with its tip on the hotspot. */}
        <path className="comet__head" d="M0 0 L13.5 5.4 L7.2 7.2 L5.4 13.5 Z" fill="#fff" />
      </svg>
    </div>
  )
}
