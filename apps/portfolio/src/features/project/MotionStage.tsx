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
    if (!element) return
    let stop: (() => void) | undefined
    let live = true

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
