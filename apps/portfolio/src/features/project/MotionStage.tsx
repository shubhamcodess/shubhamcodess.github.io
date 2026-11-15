import { useEffect, useRef, useState } from 'react'
import type { MotionEntry } from '../../motion'
import { useTheme } from '../../lib/useTheme'

interface MotionStageProps {
  readonly motion: MotionEntry
}

/** How far ahead of the screen the replay starts loading, so it is ready by the time it scrolls in. */
const loadAhead = '600px 0px'

/**
 * A build's motion graphic on its stage. The replay's code and styles are fetched only once the stage nears the
 * screen, and run in a shadow root, so its styles and the page's never meet. It follows the site's theme.
 */
export function MotionStage({ motion }: MotionStageProps) {
  const host = useRef<HTMLDivElement>(null)
  const [theme] = useTheme()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = host.current
    const screen = element?.parentElement
    if (!element || !screen) return
    let stop: (() => void) | undefined
    let live = true

    /*
     * Fit the replay to the fixed screen. It is laid out wider by 1 / scale and scaled back down, so it always
     * fills the screen's width. The scale only ever shrinks, as the replay reaches its tallest, so it settles
     * within one loop and the screen itself never changes size.
     */
    let scale = 1
    let tallest = 0
    let across = 0
    const fit = () => {
      const style = getComputedStyle(screen)
      const room = screen.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom)
      const width = screen.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
      if (room <= 0 || width <= 0) return
      if (width !== across) {
        across = width
        scale = 1
        tallest = 0
      }
      const height = element.offsetHeight
      if (!height) return
      const least = parseFloat(style.getPropertyValue('--project-motion-min-scale')) || 0.6
      const needed = Math.max(least, Math.min(1, room / height))
      if (needed < scale) {
        scale = needed
        tallest = 0
      }
      tallest = Math.max(tallest, height)
      element.style.width = `${width / scale}px`
      element.style.setProperty('--motion-scale', String(scale))
      element.style.setProperty('--motion-top', `${Math.max(0, (room - tallest * scale) / 2)}px`)
      screen.toggleAttribute('data-clipped', tallest * scale > room + 1)
    }
    const sizes = new ResizeObserver(fit)
    sizes.observe(element)
    sizes.observe(screen)

    const start = () => {
      motion.load().then(
        (loaded) => {
          if (!live) return
          const shadow = element.shadowRoot ?? element.attachShadow({ mode: 'open' })
          const style = document.createElement('style')
          style.textContent = loaded.css
          const root = document.createElement('div')
          shadow.replaceChildren(style, root)
          stop = loaded.mount(root)
          setReady(true)
        },
        () => {
          // The replay could not load; the stage keeps its quiet empty state.
        },
      )
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        io.disconnect()
        start()
      },
      { rootMargin: loadAhead },
    )
    io.observe(element)

    return () => {
      live = false
      io.disconnect()
      sizes.disconnect()
      stop?.()
    }
  }, [motion])

  return (
    <>
      <p className="visually-hidden">{motion.label}</p>
      <div ref={host} className="project-stage__motion" data-theme={theme} data-ready={ready || undefined} />
    </>
  )
}
