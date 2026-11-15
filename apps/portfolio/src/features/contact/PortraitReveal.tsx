import { useEffect, useRef } from 'react'
import portrait from '../../assets/portrait.webp'
import { site } from '../../config/site'
import { useReducedMotion } from '../../lib/useReducedMotion'

/**
 * The badge photo. It arrives the way a generated image does: first as big, over-coloured blocks,
 * then finer and finer until it is the photo, which then settles into the badge's tint.
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
    const coarse = document.createElement('canvas')
    const coarseContext = coarse.getContext('2d')
    const image = new Image()
    let timer = 0
    let started = false

    // Draws the photo at one block size. The photo covers the window and keeps the face, which is near the top.
    const draw = (block: number, progress: number) => {
      const width = (canvas.width = canvas.clientWidth * 2)
      const height = (canvas.height = canvas.clientHeight * 2)
      if (!width || !height || !coarseContext) return
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight)
      const sourceWidth = width / scale
      const sourceHeight = height / scale
      const sourceX = (image.naturalWidth - sourceWidth) / 2
      const sourceY = (image.naturalHeight - sourceHeight) * 0.12
      coarse.width = Math.max(1, Math.ceil(width / (block * 2)))
      coarse.height = Math.max(1, Math.ceil(height / (block * 2)))
      // Early blocks are pushed toward strong colour, easing back to the true photo.
      coarseContext.filter = block > 1 ? `saturate(${1 + (1 - progress) * 3}) hue-rotate(${(1 - progress) * 80}deg)` : 'none'
      coarseContext.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, coarse.width, coarse.height)
      context.imageSmoothingEnabled = block === 1
      context.clearRect(0, 0, width, height)
      context.drawImage(coarse, 0, 0, coarse.width, coarse.height, 0, 0, width, height)
    }

    const finish = () => {
      draw(1, 1)
      canvas.dataset.state = 'done'
    }

    const play = () => {
      if (started || !image.complete || !image.naturalWidth) return
      started = true
      if (reducedMotion) return finish()
      canvas.dataset.state = 'forming'
      let step = 0
      const next = () => {
        const block = reveal.blocks[step]
        if (block === undefined || block <= 1) return finish()
        draw(block, step / reveal.blocks.length)
        step += 1
        timer = window.setTimeout(next, reveal.stepMs)
      }
      next()
    }

    let seen = false
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
      if (seen) play()
    }
    image.src = portrait
    const resize = new ResizeObserver(() => {
      if (canvas.dataset.state === 'done') draw(1, 1)
    })
    resize.observe(canvas)

    return () => {
      window.clearTimeout(timer)
      visibility.disconnect()
      resize.disconnect()
    }
  }, [reveal, reducedMotion])

  return <canvas className="badge__photo" ref={canvasRef} role="img" aria-label={portraitAlt} data-state="waiting" />
}
