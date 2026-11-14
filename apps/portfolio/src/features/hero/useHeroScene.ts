import { useEffect, type RefObject } from 'react'
import type { HeroLightConfig } from '../../config/types'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { createCoveLight } from './coveLight'

interface HeroSceneOptions {
  readonly light: boolean
  readonly parallax: boolean
  readonly config: HeroLightConfig
}

/** The frame the light holds when motion is reduced, in seconds. */
const stillFrame = 3
/** How quickly the scene catches up with the pointer each frame, 0 to 1. */
const pointerEase = 0.06

/**
 * Runs the hero's one animation loop: the light, and the depth between light and words.
 * The loop stops while the hero is off screen or the tab is hidden, and never starts under reduced motion.
 * Depth is written as CSS variables on the hero (--hero-pointer-x/y, --hero-scroll), so the styles decide what moves.
 */
export function useHeroScene(
  heroRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { light, parallax, config }: HeroSceneOptions,
): void {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const hero = heroRef.current
    const canvas = canvasRef.current
    if (!hero || !canvas) return

    const scene = light ? createCoveLight(canvas, config) : null
    hero.dataset.light = scene ? 'on' : 'off'
    const depth = parallax && !reducedMotion

    let frame = 0
    let last = 0
    let seconds = reducedMotion ? stillFrame : 0
    let onScreen = true
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }

    const draw = () => scene?.render(seconds, eased.x)

    const tick = (now: number) => {
      // Cap the step, so a paused tab resumes where it left off instead of jumping ahead.
      seconds += last ? Math.min(50, now - last) / 1000 : 0
      last = now
      if (depth) {
        eased.x += (target.x - eased.x) * pointerEase
        eased.y += (target.y - eased.y) * pointerEase
        hero.style.setProperty('--hero-pointer-x', eased.x.toFixed(4))
        hero.style.setProperty('--hero-pointer-y', eased.y.toFixed(4))
        hero.style.setProperty('--hero-scroll', `${Math.max(0, window.scrollY).toFixed(1)}px`)
      }
      draw()
      frame = requestAnimationFrame(tick)
    }

    const sync = () => {
      const run = onScreen && !document.hidden && !reducedMotion && (scene !== null || depth)
      if (run && !frame) {
        last = 0
        frame = requestAnimationFrame(tick)
      } else if (!run && frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const resize = new ResizeObserver(() => {
      scene?.resize()
      draw()
    })
    resize.observe(canvas)

    const visibility = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting)
      sync()
    })
    visibility.observe(hero)

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const box = hero.getBoundingClientRect()
      target.x = (event.clientX - box.left) / box.width - 0.5
      target.y = (event.clientY - box.top) / box.height - 0.5
    }
    const onPointerLeave = () => {
      target.x = 0
      target.y = 0
    }

    if (depth) {
      hero.addEventListener('pointermove', onPointerMove)
      hero.addEventListener('pointerleave', onPointerLeave)
    }
    document.addEventListener('visibilitychange', sync)
    scene?.resize()
    draw()
    sync()

    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      visibility.disconnect()
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', sync)
      scene?.dispose()
    }
  }, [heroRef, canvasRef, light, parallax, config, reducedMotion])
}
