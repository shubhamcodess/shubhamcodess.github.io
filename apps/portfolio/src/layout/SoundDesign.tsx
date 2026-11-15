import { useEffect } from 'react'
import { site } from '../config/site'
import { pause, play, wake } from '../lib/sound/sound'
import type { Voice } from '../lib/sound/engine'

/** What counts as something to sound on hover and press. */
const interactive = 'a[href], button, summary, [data-sound]'
const pressVoices = new Set<string>(['tap', 'close'])

/**
 * The site's sound, wired once for every page, and only on actions. Every link and button taps when pressed;
 * an element can opt out with data-sound="none" or use the softer data-sound="close".
 * Hover ticks only with a real pointer. Scroll gives a soft page-turn after a good stretch of movement.
 */
export function SoundDesign() {
  useEffect(() => {
    const { scroll } = site.sound
    let lastHovered: Element | null = null
    let lastHoverAt = 0
    let travelled = 0
    let lastY = window.scrollY
    let lastSwish = 0
    let woken = false

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')

    const onFirstGesture = () => {
      if (woken) return
      woken = true
      void wake()
    }

    const onOver = (event: PointerEvent) => {
      if (!fine.matches || !(event.target instanceof Element)) return
      const target = event.target.closest(interactive)
      if (!target || target === lastHovered) return
      lastHovered = target
      const now = performance.now()
      if (now - lastHoverAt < 70) return
      lastHoverAt = now
      play('hover')
    }
    const onOut = (event: PointerEvent) => {
      if (event.target instanceof Element && event.target.closest(interactive) === lastHovered) lastHovered = null
    }

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const target = event.target.closest<HTMLElement>(interactive)
      if (!target || target.dataset.sound === 'none') return
      const voice = target.dataset.sound
      play(voice && pressVoices.has(voice) ? (voice as Voice) : 'tap')
    }

    const onScroll = () => {
      const y = window.scrollY
      const moved = y - lastY
      lastY = y
      travelled += Math.abs(moved)
      const now = performance.now()
      if (travelled < scroll.every || now - lastSwish < scroll.gapMs) return
      const strength = Math.min(1, travelled / (scroll.every * 3))
      travelled = 0
      lastSwish = now
      play('swish', strength, Math.sign(moved) || 1)
    }

    const onVisibility = () => pause(document.hidden)

    document.addEventListener('pointerdown', onFirstGesture, { capture: true })
    document.addEventListener('keydown', onFirstGesture, { capture: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('click', onClick, { capture: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('pointerdown', onFirstGesture, { capture: true })
      document.removeEventListener('keydown', onFirstGesture, { capture: true })
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return null
}
