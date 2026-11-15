import { useEffect, useRef } from 'react'
import type { PlacePhoto } from '../../content/me'
import { Icon } from '../../ui/Icon'

interface PhotoViewerProps {
  readonly photos: readonly PlacePhoto[]
  readonly index: number
  readonly onIndex: (index: number) => void
  readonly onClose: () => void
}

const url = (path: string) => `${import.meta.env.BASE_URL}${path}`

/**
 * One photo, large, over a dimmed page: the same faint polaroid frame as on the line, its caption beneath,
 * and the way to the photo before or after. Escape, the close button or a click outside closes it, and focus
 * goes back to the print that opened it.
 */
export function PhotoViewer({ photos, index, onIndex, onClose }: PhotoViewerProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const photo = photos[index]
  const count = photos.length

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
    return () => {
      element.close()
      opener?.focus()
    }
  }, [])

  useEffect(() => {
    // Caught before the page's own keys: Escape here closes only the photo, not the view behind it.
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        event.preventDefault()
        onClose()
      }
      if (event.key === 'ArrowRight') onIndex((index + 1) % count)
      if (event.key === 'ArrowLeft') onIndex((index - 1 + count) % count)
    }
    window.addEventListener('keydown', keys, true)
    return () => window.removeEventListener('keydown', keys, true)
  }, [index, count, onIndex, onClose])

  if (!photo) return null
  return (
    <dialog
      ref={dialog}
      className="photo-viewer"
      aria-label={photo.alt}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <figure className="photo-viewer__print">
        <span className="photo-viewer__photo">
          <img key={photo.src} src={url(photo.src)} alt={photo.alt} decoding="async" />
          <span className="clothesline__glass" aria-hidden="true" />
        </span>
        <figcaption>
          <span>{photo.alt}</span>
          <span className="photo-viewer__count">
            {index + 1} / {count}
          </span>
        </figcaption>
      </figure>
      <button type="button" className="photo-viewer__close" onClick={onClose} aria-label="Close photo">
        <Icon name="close" size={18} />
      </button>
      {count > 1 ? (
        <>
          <button
            type="button"
            className="photo-viewer__step photo-viewer__step--back"
            onClick={() => onIndex((index - 1 + count) % count)}
            aria-label="Previous photo"
          >
            <Icon name="arrowLeft" size={18} />
          </button>
          <button
            type="button"
            className="photo-viewer__step photo-viewer__step--on"
            onClick={() => onIndex((index + 1) % count)}
            aria-label="Next photo"
          >
            <Icon name="arrowRight" size={18} />
          </button>
        </>
      ) : null}
    </dialog>
  )
}
