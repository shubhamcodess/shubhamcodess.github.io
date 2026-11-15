import { useEffect, type RefObject } from 'react'
import type { SwingConfig } from '../../config/types'
import { useReducedMotion } from '../../lib/useReducedMotion'

/** Below this much movement the swing is at rest and the loop stops. */
const restThreshold = 0.02

/**
 * Hangs an element like a badge on a strap: a damped spring around its top edge.
 * It drops in when first seen, leans after the pointer, and kicks when the element receives a "swing:kick" event.
 * Writes --swing in degrees on the element.
 */
export function useSwing(ref: RefObject<HTMLElement | null>, config: SwingConfig): void {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const element = ref.current
    const host = element?.closest('section')
    if (!element || !host || reducedMotion) return

    let angle = config.dropAngle
    let velocity = 0
    let target = 0
    let frame = 0
    let last = 0
    let dropped = false

    const tick = (now: number) => {
      const step = last ? Math.min(0.032, (now - last) / 1000) : 0.016
      last = now
      velocity += (-config.stiffness * (angle - target) - config.damping * velocity) * step
      angle += velocity * step
      element.style.setProperty('--swing', `${angle.toFixed(3)}deg`)
      const resting = Math.abs(angle - target) < restThreshold && Math.abs(velocity) < restThreshold
      frame = resting ? 0 : requestAnimationFrame(tick)
    }
    const wake = () => {
      if (frame) return
      last = 0
      frame = requestAnimationFrame(tick)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const box = element.getBoundingClientRect()
      const offset = (event.clientX - (box.left + box.width / 2)) / window.innerWidth
      target = Math.max(-1, Math.min(1, offset * 2)) * config.pointerPull
      wake()
    }
    const onPointerLeave = () => {
      target = 0
      wake()
    }
    const onKick = () => {
      velocity += config.tapKick * (angle >= 0 ? -1 : 1)
      wake()
    }

    element.style.setProperty('--swing', `${angle}deg`)
    const visibility = new IntersectionObserver(
      (entries) => {
        if (dropped || !entries.some((entry) => entry.isIntersecting)) return
        dropped = true
        wake()
      },
      { threshold: 0.3 },
    )
    visibility.observe(element)
    host.addEventListener('pointermove', onPointerMove)
    host.addEventListener('pointerleave', onPointerLeave)
    element.addEventListener('swing:kick', onKick)

    return () => {
      cancelAnimationFrame(frame)
      visibility.disconnect()
      host.removeEventListener('pointermove', onPointerMove)
      host.removeEventListener('pointerleave', onPointerLeave)
      element.removeEventListener('swing:kick', onKick)
      element.style.removeProperty('--swing')
    }
  }, [ref, config, reducedMotion])
}
