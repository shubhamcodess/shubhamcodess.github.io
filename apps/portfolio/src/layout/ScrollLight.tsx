import { useEffect, useRef } from 'react'
import './scroll-light.css'

/**
 * The site's scrollbar: a thread of light in the frame's right edge that runs down as the page scrolls.
 * It replaces the browser's own bar, and hides itself on pages too short to scroll.
 */
export function ScrollLight() {
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    const root = document.documentElement
    root.dataset.scrollLight = 'on'
    let frame = 0

    const update = () => {
      frame = 0
      const range = root.scrollHeight - window.innerHeight
      bar.hidden = range <= 1
      bar.style.setProperty('--scroll-progress', range > 1 ? Math.min(1, Math.max(0, window.scrollY / range)).toFixed(4) : '0')
    }
    const schedule = () => {
      frame ||= requestAnimationFrame(update)
    }

    const resize = new ResizeObserver(schedule)
    resize.observe(document.body)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      delete root.dataset.scrollLight
    }
  }, [])

  return (
    <div className="scroll-light" ref={barRef} aria-hidden="true">
      <div className="scroll-light__run" />
    </div>
  )
}
