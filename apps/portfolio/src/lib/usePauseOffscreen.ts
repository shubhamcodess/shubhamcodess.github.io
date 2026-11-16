import { useEffect, useRef } from 'react'

/**
 * Marks an element `data-offscreen` while it is out of view, so its endless CSS animations can pause
 * (`[data-offscreen] ... { animation-play-state: paused }`) and cost nothing until it is back.
 */
export function usePauseOffscreen<T extends Element>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const watch = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) element.removeAttribute('data-offscreen')
      else element.setAttribute('data-offscreen', '')
    })
    watch.observe(element)
    return () => watch.disconnect()
  }, [])
  return ref
}
