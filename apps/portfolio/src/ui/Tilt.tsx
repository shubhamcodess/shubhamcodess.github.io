import { useEffect } from 'react'
import { site } from '../config/site'
import { useReducedMotion } from '../lib/useReducedMotion'
import './tilt.css'

/**
 * One listener for the whole page. Any element with `data-tilt` leans a few degrees toward the pointer,
 * lifts a little, and carries a soft light where the pointer is, like a card turned under a lamp.
 * Pointer only: touch and keyboard get the plain lift. Off with reduced motion.
 */
export function TiltLayer() {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const { maxDeg } = site.tilt
    let active: HTMLElement | null = null
    let frame = 0
    let last: PointerEvent | null = null

    const release = (element: HTMLElement) => {
      element.style.setProperty('--tilt-x', '0deg')
      element.style.setProperty('--tilt-y', '0deg')
      delete element.dataset.tilting
    }

    const update = () => {
      frame = 0
      if (!last) return
      const target = last.target instanceof Element ? last.target.closest<HTMLElement>('[data-tilt]') : null
      if (target !== active) {
        if (active) release(active)
        active = target
      }
      if (!active) return
      const box = active.getBoundingClientRect()
      const x = Math.min(1, Math.max(0, (last.clientX - box.left) / box.width))
      const y = Math.min(1, Math.max(0, (last.clientY - box.top) / box.height))
      // The side under the pointer dips toward it.
      active.style.setProperty('--tilt-y', `${((x - 0.5) * 2 * maxDeg).toFixed(2)}deg`)
      active.style.setProperty('--tilt-x', `${((0.5 - y) * 2 * maxDeg).toFixed(2)}deg`)
      active.style.setProperty('--glare-x', `${(x * 100).toFixed(1)}%`)
      active.style.setProperty('--glare-y', `${(y * 100).toFixed(1)}%`)
      active.dataset.tilting = ''
    }

    const onMove = (event: PointerEvent) => {
      last = event
      frame ||= requestAnimationFrame(update)
    }
    const onLeave = () => {
      if (active) release(active)
      active = null
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('scroll', onLeave, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      onLeave()
      document.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('scroll', onLeave)
    }
  }, [reducedMotion])

  return null
}
