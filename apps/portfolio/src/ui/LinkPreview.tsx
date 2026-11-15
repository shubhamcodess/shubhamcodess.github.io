import { useEffect, useRef, useState } from 'react'
import data from '../content/link-previews.json'
import './link-preview.css'

interface Preview {
  readonly title: string
  readonly description: string
  readonly image?: string
}

const previews: Readonly<Record<string, Preview>> = data

/** How far the card sits from the pointer, in pixels. */
const offset = 18

/**
 * One card for the whole page. It follows the pointer over any outside link that has a saved preview
 * (see scripts/fetch-previews.mjs). Pointer-only: touch and keyboard users go straight to the link.
 */
export function LinkPreview() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [href, setHref] = useState<string | null>(null)
  const preview = href ? previews[href] : undefined

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const linkAt = (target: EventTarget | null) => {
      const link = target instanceof Element ? target.closest<HTMLAnchorElement>('a[href^="https://"]') : null
      return link && previews[link.href] ? link : null
    }
    const place = (event: PointerEvent) => {
      const card = cardRef.current
      if (!card) return
      // Keep the card on screen: flip to the other side of the pointer near the right and bottom edges.
      const x = event.clientX + offset + card.offsetWidth > window.innerWidth ? event.clientX - offset - card.offsetWidth : event.clientX + offset
      const y = event.clientY + offset + card.offsetHeight > window.innerHeight ? event.clientY - offset - card.offsetHeight : event.clientY + offset
      card.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`
    }
    const onOver = (event: PointerEvent) => setHref(linkAt(event.target)?.href ?? null)
    const onMove = (event: PointerEvent) => {
      if (linkAt(event.target)) place(event)
    }
    const hide = () => setHref(null)

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointermove', onMove)
    document.addEventListener('scroll', hide, { passive: true })
    return () => {
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('scroll', hide)
    }
  }, [])

  return (
    <div className="link-preview" ref={cardRef} data-shown={preview ? 'true' : 'false'} aria-hidden="true">
      {preview && href ? (
        <div className="link-preview__card" key={href}>
          {preview.image ? <img src={`${import.meta.env.BASE_URL}${preview.image}`} alt="" /> : null}
          <p className="link-preview__title">{preview.title}</p>
          <p className="link-preview__host">{new URL(href).host}</p>
        </div>
      ) : null}
    </div>
  )
}
