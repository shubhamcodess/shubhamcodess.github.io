import { useEffect, useRef } from 'react'
import { site } from '../config/site'
import { useReducedMotion } from '../lib/useReducedMotion'
import './chalk-trail.css'

interface Point {
  readonly x: number
  readonly y: number
  readonly at: number
}

interface Speck {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  born: number
}

/** A seeded wobble, so each stroke's grain stays put as it fades instead of shimmering. */
const wobble = (seed: number) => {
  const s = Math.sin(seed * 12.9898) * 43758.5453
  return s - Math.floor(s) - 0.5
}

/**
 * A short chalk line behind the pointer, with a little dust shed from it. Drawn white and blended by
 * difference, so it reads as pale chalk on the dark hero and as faint graphite on the paper.
 * Pointer only, off with reduced motion, and the loop sleeps whenever nothing is left to draw.
 */
export function ChalkTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const { lifeMs, width, opacity, dust } = site.chalkTrail
    const points: Point[] = []
    const specks: Speck[] = []
    const dustLife = lifeMs * 4
    let frame = 0
    let ratio = 1

    const resize = () => {
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(window.innerWidth * ratio)
      canvas.height = Math.round(window.innerHeight * ratio)
    }

    const draw = (now: number) => {
      frame = 0
      while (points.length && now - (points[0]?.at ?? now) > lifeMs) points.shift()
      for (let i = specks.length - 1; i >= 0; i--) {
        if (now - (specks[i]?.born ?? now) > dustLife) specks.splice(i, 1)
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      context.lineCap = 'round'
      context.strokeStyle = '#fff'
      context.fillStyle = '#fff'

      // The stroke: each segment is a few thin, slightly offset passes, like chalk catching the paper.
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1]
        const b = points[i]
        if (!a || !b) continue
        const fresh = 1 - (now - b.at) / lifeMs
        if (fresh <= 0) continue
        for (let pass = 0; pass < 3; pass++) {
          const seed = b.at * 0.37 + pass * 7.1
          const jitter = pass === 0 ? 0 : 0.9
          context.globalAlpha = opacity * fresh * (pass === 0 ? 1 : 0.45)
          context.lineWidth = Math.max(0.35, width * fresh * (pass === 0 ? 1 : 0.5))
          context.beginPath()
          context.moveTo(a.x + wobble(seed) * jitter, a.y + wobble(seed + 1) * jitter)
          context.lineTo(b.x + wobble(seed + 2) * jitter, b.y + wobble(seed + 3) * jitter)
          context.stroke()
        }
      }

      // The dust: specks drift a little, slow down, and fade.
      for (const speck of specks) {
        const age = (now - speck.born) / dustLife
        speck.x += speck.vx
        speck.y += speck.vy
        speck.vx *= 0.96
        speck.vy = speck.vy * 0.96 + 0.004
        context.globalAlpha = opacity * 0.7 * (1 - age)
        context.fillRect(speck.x, speck.y, speck.size, speck.size)
      }
      context.globalAlpha = 1

      if (points.length || specks.length) frame = requestAnimationFrame(draw)
    }

    const wake = () => {
      frame ||= requestAnimationFrame(draw)
    }

    const onMove = (event: PointerEvent) => {
      const now = performance.now()
      const last = points.at(-1)
      points.push({ x: event.clientX, y: event.clientY, at: now })
      if (last && Math.random() < dust) {
        const speed = Math.hypot(event.clientX - last.x, event.clientY - last.y)
        specks.push({
          x: event.clientX + wobble(now) * 4,
          y: event.clientY + wobble(now + 3) * 4,
          vx: wobble(now + 5) * 0.5 + (last.x - event.clientX) * 0.02,
          vy: wobble(now + 7) * 0.5 + (last.y - event.clientY) * 0.02,
          size: 0.6 + Math.min(1, speed / 40) * 0.8 + Math.random() * 0.4,
          born: now,
        })
      }
      wake()
    }

    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      document.removeEventListener('pointermove', onMove)
    }
  }, [reducedMotion])

  return <canvas className="chalk-trail" ref={canvasRef} aria-hidden="true" />
}
