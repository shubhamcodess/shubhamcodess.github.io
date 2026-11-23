import { useEffect, type RefObject } from 'react'
import type { HeroLightConfig } from '../../config/types'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { createCoveLight } from './coveLight'
import { afterPageArrives } from '../../lib/pageArrival'

export interface LightSceneOptions {
  readonly light: boolean
  readonly parallax: boolean
  readonly config: HeroLightConfig
}

/** The frame the light holds when motion is reduced, in seconds. */
const stillFrame = 3
/** How quickly the scene catches up with the pointer each frame, 0 to 1. */
const pointerEase = 0.06

/**
 * Runs a light backdrop's one animation loop: the light, and the depth between light and words.
 * The host is the backdrop's parent. The loop stops while the host is off screen or the tab is hidden, and never starts under reduced motion.
 * Depth is written as CSS variables (--light-pointer-x/y on the host, --light-scroll on the backdrop), so the styles decide what moves.
 */
export function useLightScene(
  backdropRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { light, parallax, config }: LightSceneOptions,
): void {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const backdrop = backdropRef.current
    const hero = backdrop?.parentElement
    const canvas = canvasRef.current
    if (!backdrop || !hero || !canvas) return

    // The light starts (and its shaders compile) only once the page has finished arriving, so the page
    // transition never stutters.
    let stop: (() => void) | undefined
    let cancelled = false
    void afterPageArrives().then(() => {
      if (!cancelled) stop = start(backdrop, hero, canvas)
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [backdropRef, canvasRef, light, parallax, config, reducedMotion])

  function start(backdrop: HTMLElement, hero: HTMLElement, canvas: HTMLCanvasElement): () => void {
    const scene = light ? createCoveLight(canvas, config) : null
    backdrop.dataset.light = scene ? 'on' : 'off'
    const depth = parallax && !reducedMotion

    let frame = 0
    let last = 0
    let seconds = reducedMotion ? stillFrame : 0
    let onScreen = true
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }

    const draw = () => scene?.render(seconds, eased.x)

    // Fast screens get the light at most maxFps times a second; a little slack keeps a 60Hz screen at every frame.
    const minStep = 1000 / config.maxFps - 2
    let written = { x: '', y: '', scroll: '' }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (last && now - last < minStep) return
      // Cap the step, so a paused tab resumes where it left off instead of jumping ahead.
      seconds += last ? Math.min(50, now - last) / 1000 : 0
      last = now
      if (depth) {
        eased.x += (target.x - eased.x) * pointerEase
        eased.y += (target.y - eased.y) * pointerEase
        // Only touch the styles when a value changes, so a still pointer costs no style work.
        const next = { x: eased.x.toFixed(4), y: eased.y.toFixed(4), scroll: `${Math.max(0, window.scrollY).toFixed(1)}px` }
        if (next.x !== written.x) hero.style.setProperty('--light-pointer-x', next.x)
        if (next.y !== written.y) hero.style.setProperty('--light-pointer-y', next.y)
        if (next.scroll !== written.scroll) backdrop.style.setProperty('--light-scroll', next.scroll)
        written = next
      }
      draw()
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

    // The words the light frosts behind, if the host marks them. Measured with the parallax shift taken out.
    const plate = hero.querySelector<HTMLElement>('[data-light-plate]')
    const plateBox = () => {
      if (!plate) return null
      const box = plate.getBoundingClientRect()
      const shift = config.parallax.pointerContent
      return new DOMRect(box.left + eased.x * shift, box.top + eased.y * shift, box.width, box.height)
    }
    const fit = () => {
      scene?.resize(plateBox())
      draw()
    }
    const resize = new ResizeObserver(fit)
    resize.observe(canvas)
    if (plate) resize.observe(plate)

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
    fit()
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
  }
}
