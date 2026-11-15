import { useEffect, useRef, useState } from 'react'
import type { MotionEntry } from '../../motion'
import type { MotionControls } from '../../motion/types'
import { useTheme } from '../../lib/useTheme'

interface MotionStageProps {
  readonly motion: MotionEntry
  /** Shown at the stage's top left. */
  readonly name: string
}

/** How far ahead of the screen the replay starts loading, so it is ready by the time it scrolls in. */
const loadAhead = '600px 0px'

/**
 * A build's motion graphic on its stage: a bar with the build's name and the replay's Pause and Replay, over a
 * screen of one fixed height that the replay fills exactly. The replay's code and styles are fetched only once
 * the stage nears the screen, and run in a shadow root, so its styles and the page's never meet.
 */
export function MotionStage({ motion, name }: MotionStageProps) {
  const host = useRef<HTMLDivElement>(null)
  const controls = useRef<MotionControls | null>(null)
  const [theme] = useTheme()
  const [ready, setReady] = useState(false)
  const [still, setStill] = useState(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const element = host.current
    if (!element) return
    let live = true

    const start = () => {
      motion.load().then(
        (loaded) => {
          if (!live) return
          const shadow = element.shadowRoot ?? element.attachShadow({ mode: 'open' })
          const style = document.createElement('style')
          style.textContent = loaded.css
          const root = document.createElement('div')
          root.className = 'motion-root'
          shadow.replaceChildren(style, root)
          controls.current = loaded.mount(root)
          setStill(controls.current.still)
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
      controls.current?.stop()
      controls.current = null
    }
  }, [motion])

  const togglePause = () => {
    const next = !paused
    controls.current?.setPaused(next)
    setPaused(next)
  }
  const replay = () => {
    controls.current?.replay()
    setPaused(false)
  }

  return (
    <>
      <div className="project-stage__bar">
        <p aria-hidden="true">{name}</p>
        {ready && !still ? (
          <div className="project-stage__controls">
            <button type="button" onClick={togglePause} aria-pressed={paused}>
              {paused ? 'Play' : 'Pause'}
            </button>
            <button type="button" onClick={replay}>
              Replay
            </button>
          </div>
        ) : null}
      </div>
      <div className="project-stage__screen project-stage__screen--motion">
        <p className="visually-hidden">{motion.label}</p>
        <div ref={host} className="project-stage__motion" data-theme={theme} data-ready={ready || undefined} />
      </div>
    </>
  )
}
