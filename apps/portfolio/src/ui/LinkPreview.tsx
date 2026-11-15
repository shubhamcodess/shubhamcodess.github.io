import { useEffect, useRef, useState } from 'react'
import { loadStaticData } from '../lib/useStaticData'
import './link-preview.css'

interface Preview {
  readonly title: string
  readonly description: string
  readonly image?: string
}

/** Loaded on first use, and only where there is a pointer to hover with, so it stays out of the main bundle. */
let previews: Readonly<Record<string, Preview>> = {}

/** How far the card sits from the pointer, in pixels. */
const offset = 18

interface Shown extends Preview {
  readonly key: string
  readonly note: string
  /** An image meant to be read, such as a certificate, gets the wide card. */
  readonly large: boolean
}

/** What the element under the pointer wants shown, if anything. */
function shownFor(target: EventTarget | null): Shown | null {
  if (!(target instanceof Element)) return null
  // Anything can show an image of its own: data-hover-image (a path under /public) and data-hover-title.
  const own = target.closest<HTMLElement>('[data-hover-image]')
  if (own?.dataset.hoverImage) {
    return {
      key: own.dataset.hoverImage,
      title: own.dataset.hoverTitle ?? '',
      description: '',
      image: own.dataset.hoverImage,
      note: '',
      large: true,
    }
  }
  const link = target.closest<HTMLAnchorElement>('a[href^="https://"]')
  const preview = link ? previews[link.href] : undefined
  return link && preview ? { ...preview, key: link.href, note: new URL(link.href).host, large: false } : null
}

/**
 * One card for the whole page. It follows the pointer over any outside link that has a saved preview
 * (see scripts/fetch-previews.mjs), and over anything that carries data-hover-image, such as a certificate.
 * Pointer-only: touch and keyboard users go straight to the link.
 */
export function LinkPreview() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState<Shown | null>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    void loadStaticData<Record<string, Preview>>('data/link-previews.json').then(
      (data) => {
        previews = data
      },
      () => undefined,
    )

    const place = (event: PointerEvent) => {
      const card = cardRef.current
      if (!card) return
      // Keep the card on screen: flip to the other side of the pointer near the right and bottom edges.
      const x =
        event.clientX + offset + card.offsetWidth > window.innerWidth ? event.clientX - offset - card.offsetWidth : event.clientX + offset
      const y =
        event.clientY + offset + card.offsetHeight > window.innerHeight
          ? event.clientY - offset - card.offsetHeight
          : event.clientY + offset
      card.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`
    }
    const onOver = (event: PointerEvent) => {
      const next = shownFor(event.target)
      setShown((current) => (current?.key === next?.key ? current : next))
    }
    const onMove = (event: PointerEvent) => {
      if (shownFor(event.target)) place(event)
    }
    const hide = () => setShown(null)

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
    <div className="link-preview" ref={cardRef} data-size={shown?.large ? 'large' : 'small'} aria-hidden="true">
      {shown ? (
        <div className="link-preview__card" key={shown.key}>
          {shown.image ? <img src={`${import.meta.env.BASE_URL}${shown.image}`} alt="" /> : null}
          {shown.title ? <p className="link-preview__title">{shown.title}</p> : null}
          {shown.note ? <p className="link-preview__host">{shown.note}</p> : null}
        </div>
      ) : null}
    </div>
  )
}
