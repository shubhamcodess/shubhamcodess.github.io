import { useEffect, useRef } from 'react'
import portrait from '../../assets/portrait.webp'
import { site } from '../../config/site'
import { useReducedMotion } from '../../lib/useReducedMotion'

/** Space between cells and their corner radius, as shares of the cell size. */
const cellGap = 0.07
const cellRadius = 0.3
/** How much of the dissolve each cell takes to fade, 0 to 1. Lower is a harder edge. */
const fadeBand = 0.2
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
    const seeds = new Map<number, number>()
    let frame = 0
    let start = 0
    let seen = false
    let playing = false

    const seedOf = (index: number) => {
      let seed = seeds.get(index)
      if (seed === undefined) {
        seed = Math.random()
        seeds.set(index, seed)
      }
      return seed
    }

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

      // The photo covers the window and keeps the face, which is near the top.
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const sourceWidth = width / scale
      const sourceHeight = height / scale
      context.clearRect(0, 0, width, height)
      context.drawImage(
        image,
        (image.naturalWidth - sourceWidth) / 2,
        (image.naturalHeight - sourceHeight) * 0.12,
        sourceWidth,
        sourceHeight,
        0,
        0,
        width,
        height,
      )
      if (elapsed === Infinity) return

      const size = reveal.cell * ratio
      const columns = Math.ceil(width / size)
      const rows = Math.ceil(height / size)
      const progress = Math.max(0, (elapsed - reveal.holdMs) / reveal.dissolveMs) * (1 + fadeBand)
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const seed = seedOf(row * 1000 + column)
          const threshold = (row / rows) * topDown + seed * (1 - topDown)
          const alpha = 1 - Math.min(1, Math.max(0, (progress - threshold) / fadeBand))
          if (alpha <= 0) continue
          // Each cell breathes between dark greys while it waits.
          const shade = Math.round(34 + seed * 26 + Math.sin(elapsed * 0.004 + seed * 40) * 9)
          const x = column * size
          const y = row * size
          context.globalAlpha = alpha
          context.fillStyle = '#0d0e10'
          context.fillRect(x, y, size, size)
          context.fillStyle = `rgb(${shade} ${shade} ${shade + 3})`
          context.beginPath()
          if (context.roundRect)
            context.roundRect(x + size * cellGap, y + size * cellGap, size * (1 - cellGap * 2), size * (1 - cellGap * 2), size * cellRadius)
          else context.rect(x + size * cellGap, y + size * cellGap, size * (1 - cellGap * 2), size * (1 - cellGap * 2))
          context.fill()
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
      if (playing || canvas.dataset.state === 'done' || !seen || !image.complete || !image.naturalWidth) return
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
    image.onload = play
    image.src = portrait
    const resize = new ResizeObserver(() => {
      if (canvas.dataset.state === 'done') draw(Infinity)
    })
    resize.observe(canvas)

    return () => {
      cancelAnimationFrame(frame)
      visibility.disconnect()
      resize.disconnect()
    }
  }, [reveal, reducedMotion])

  return <canvas className="badge__photo" ref={canvasRef} role="img" aria-label={portraitAlt} data-state="waiting" />
}
