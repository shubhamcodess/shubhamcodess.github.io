import { useEffect, useRef } from 'react'
import portrait from '../../assets/portrait.webp'
import { site } from '../../config/site'
import { useReducedMotion } from '../../lib/useReducedMotion'

/** Space between cells and their corner radius, as shares of the cell size. */
const cellGap = 0.07
const cellRadius = 0.3
/** How much of the dissolve each cell takes to fade, 0 to 1. Lower is a harder edge. */
const fadeBand = 0.32
/** How far the dissolve leans top-down (1) rather than at random (0). */
const topDown = 0.7

/**
 * The badge photo. It arrives the way a generated image loads: a field of soft, muted grey cells
 * that says nothing about the picture, which then clears from the top down to show it.
 * The photo is monochrome from the first frame, so nothing changes tone once it is there.
 * With reduced motion it is simply there.
 */
export function PortraitReveal() {
  const { reveal, portraitAlt } = site.contact.badge
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const image = new Image()
    // The photo is decoded off the main thread before its first frame, so drawing it never stalls a scrolling page.
    let photo: ImageBitmap | HTMLImageElement | null = null
    const seeds: number[] = []
    // Every cell is one of a few dozen greys, so each grey is drawn once into a strip of sprites
    // and the field is stamped from it: one image copy per cell instead of building a rounded path.
    const shades = { min: 28, count: 43 }
    let atlas: { canvas: HTMLCanvasElement; size: number; tile: number } | null = null
    const atlasFor = (size: number) => {
      if (atlas?.size === size) return atlas
      const tile = Math.ceil(size)
      const sheet = document.createElement('canvas')
      sheet.width = tile * shades.count
      sheet.height = tile
      const pen = sheet.getContext('2d')
      if (!pen) return null
      for (let level = 0; level < shades.count; level++) {
        const shade = shades.min + level
        const x = level * tile
        pen.fillStyle = '#0d0e10'
        pen.fillRect(x, 0, tile, tile)
        pen.fillStyle = `rgb(${shade} ${shade} ${shade + 3})`
        pen.beginPath()
        const inset = size * cellGap
        const side = size * (1 - cellGap * 2)
        if (pen.roundRect) pen.roundRect(x + inset, inset, side, side, size * cellRadius)
        else pen.rect(x + inset, inset, side, side)
        pen.fill()
      }
      atlas = { canvas: sheet, size, tile }
      return atlas
    }
    let frame = 0
    let start = 0
    let seen = false
    let playing = false

    const seedOf = (index: number) => (seeds[index] ??= Math.random())

    // `elapsed` is ms since the reveal began. Infinity draws the finished photo.
    const draw = (elapsed: number) => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.round(canvas.clientWidth * ratio)
      const height = Math.round(canvas.clientHeight * ratio)
      if (!width || !height) return
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      if (!photo) return
      // The photo covers the window and keeps the face, which is near the top.
      const photoWidth = photo.width
      const photoHeight = photo.height
      const scale = Math.max(width / photoWidth, height / photoHeight)
      const sourceWidth = width / scale
      const sourceHeight = height / scale
      context.clearRect(0, 0, width, height)
      context.drawImage(
        photo,
        (photoWidth - sourceWidth) / 2,
        (photoHeight - sourceHeight) * 0.12,
        sourceWidth,
        sourceHeight,
        0,
        0,
        width,
        height,
      )
      if (elapsed === Infinity) return

      const size = reveal.cell * ratio
      const sprites = atlasFor(size)
      if (!sprites) return
      const columns = Math.ceil(width / size)
      const rows = Math.ceil(height / size)
      // The dissolve eases in and out, so it gathers pace and settles instead of sweeping at one speed.
      const linear = Math.min(1, Math.max(0, (elapsed - reveal.holdMs) / reveal.dissolveMs))
      const progress = linear * linear * (3 - 2 * linear) * (1 + fadeBand)
      const beat = (elapsed / reveal.pulseMs) * Math.PI * 2
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const seed = seedOf(row * 1000 + column)
          const threshold = (row / rows) * topDown + seed * (1 - topDown)
          const alpha = 1 - Math.min(1, Math.max(0, (progress - threshold) / fadeBand))
          if (alpha <= 0) continue
          // Each cell breathes between dark greys while it waits.
          // The field breathes in slow waves that roll down and across it, one per pulse.
          const wave = Math.sin(beat - row * 0.45 - column * 0.14) * 0.5 + 0.5
          const shade = Math.round(28 + seed * 16 + wave * 26)
          context.globalAlpha = alpha
          const level = Math.min(shades.count - 1, Math.max(0, shade - shades.min))
          // Whole-pixel edges, so neighbouring cells meet exactly and no photo shows through the seams.
          const x = Math.floor(column * size)
          const y = Math.floor(row * size)
          const w = Math.floor((column + 1) * size) - x
          const h = Math.floor((row + 1) * size) - y
          context.drawImage(sprites.canvas, level * sprites.tile, 0, size, size, x, y, w, h)
        }
      }
      context.globalAlpha = 1
    }

    const finish = () => {
      playing = false
      draw(Infinity)
      canvas.dataset.state = 'done'
    }
    const tick = (now: number) => {
      start ||= now
      const elapsed = now - start
      if (elapsed >= reveal.holdMs + reveal.dissolveMs) return finish()
      draw(elapsed)
      frame = requestAnimationFrame(tick)
    }
    const play = () => {
      if (playing || canvas.dataset.state === 'done' || !seen || !photo) return
      if (reducedMotion) return finish()
      playing = true
      canvas.dataset.state = 'forming'
      frame = requestAnimationFrame(tick)
    }

    const visibility = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        seen = true
        visibility.disconnect()
        play()
      },
      { threshold: 0.6 },
    )
    visibility.observe(canvas)
    image.onload = () => {
      const ready = (decoded: ImageBitmap | HTMLImageElement) => {
        photo = decoded
        play()
      }
      if ('createImageBitmap' in window) createImageBitmap(image).then(ready, () => ready(image))
      else ready(image)
    }
    // The photo is at the foot of the page: fetch it only as the visitor nears it, so it never competes with the first paint.
    const nearby = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        nearby.disconnect()
        image.src = portrait
      },
      { rootMargin: '800px 0px' },
    )
    nearby.observe(canvas)
    const resize = new ResizeObserver(() => {
      if (canvas.dataset.state === 'done') draw(Infinity)
    })
    resize.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      nearby.disconnect()
      visibility.disconnect()
      resize.disconnect()
      if (photo && 'close' in photo) photo.close()
    }
  }, [reveal, reducedMotion])

  return <canvas className="badge__photo" ref={canvasRef} role="img" aria-label={portraitAlt} data-state="waiting" />
}
