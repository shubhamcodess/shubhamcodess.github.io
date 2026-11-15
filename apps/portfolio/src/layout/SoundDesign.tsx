import { useEffect } from 'react'
import { site } from '../config/site'
import { pause, play, wake } from '../lib/sound/sound'

/** What counts as something to sound on hover and press. */
const interactive = 'a[href], button, summary, [data-sound]'

/**
 * The site's sound, wired once for every page, and only on actions: every link and button taps when
 * pressed, and a long scroll gives a soft page-turn. An element can opt out with data-sound="none"
 * or take the softer data-sound="close". No hover sounds: scrolling passes over too many things.
 */
export function SoundDesign() {
  useEffect(() => {
    const { scroll } = site.sound
    let travelled = 0
    let lastY = window.scrollY
    let lastSwish = 0

    // Any of these lets the browser start audio. Pointerdown comes before click, so the first click is heard too.
    const onGesture = () => wake()

    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      const target = event.target.closest<HTMLElement>(interactive)
      if (!target || target.dataset.sound === 'none') return
      play(target.dataset.sound === 'close' ? 'close' : 'tap')
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

    const gestures = ['pointerdown', 'keydown', 'touchend'] as const
    for (const name of gestures) document.addEventListener(name, onGesture, { capture: true })
    document.addEventListener('click', onClick, { capture: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      for (const name of gestures) document.removeEventListener(name, onGesture, { capture: true })
      document.removeEventListener('click', onClick, { capture: true })
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return null
}
