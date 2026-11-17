import { useEffect, useRef, useState } from 'react'
import { site } from '../../config/site'
import type { MePhoto } from '../../content/me'
import { Icon } from '../../ui/Icon'
import { photoUrl } from './Gallery'
import { Peg, Rope } from './Rope'

interface PhotoViewerProps {
  readonly photos: readonly MePhoto[]
  readonly index: number
  readonly onIndex: (index: number) => void
  readonly onClose: () => void
}

/**
 * One photo or clip, opened: a darkroom with a rope across the top, the print hanging from it larger (one peg, or two
 * for a wide photo) with its caption on the foot, and previous and next in one bar at the bottom. Arrow keys
 * step, Escape or a click on the room closes, and focus goes back to the print that opened it.
 */
export function PhotoViewer({ photos, index, onIndex, onClose }: PhotoViewerProps) {
  const { viewer } = site.me
  const dialog = useRef<HTMLDialogElement>(null)
  const [width, setWidth] = useState(() => window.innerWidth)
  const photo = photos[index]
  const count = photos.length
  const step = (by: number) => onIndex((index + by + count) % count)

  useEffect(() => {
    const element = dialog.current
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element?.showModal()
    const resize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      element?.close()
      opener?.focus()
    }
  }, [])

  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') onIndex((index + 1) % count)
      if (event.key === 'ArrowLeft') onIndex((index - 1 + count) % count)
    }
    window.addEventListener('keydown', keys)
    return () => window.removeEventListener('keydown', keys)
  }, [index, count, onIndex])

  if (!photo) return null
  const wide = photo.width > photo.height * 1.15

  return (
    <dialog
      ref={dialog}
      className="darkroom"
      aria-label={photo.title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <Rope width={width} className="darkroom__rope" />
      <figure className="darkroom__print">
        {wide ? (
          <>
            <Peg className="print__peg print__peg--left" />
            <Peg className="print__peg print__peg--right" />
          </>
        ) : (
          <Peg className="print__peg" />
        )}
        <span className="darkroom__photo">
          {photo.video ? (
            // A clip plays from its poster, muted at first so the browser lets it start; the controls bring the sound up.
            <video
              key={photo.name}
              src={photoUrl(photo, 'video')}
              poster={photoUrl(photo, 'large')}
              width={photo.width}
              height={photo.height}
              aria-label={photo.caption}
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <>
              <img key={photo.name} src={photoUrl(photo, 'large')} alt={photo.caption} width={photo.width} height={photo.height} decoding="async" />
              <span className="photo-glass" aria-hidden="true" />
            </>
          )}
        </span>
        <figcaption className="darkroom__caption">{photo.caption}</figcaption>
      </figure>
      {count > 1 ? (
        <div className="darkroom__bar">
          <button type="button" className="darkroom__step" onClick={() => step(-1)} aria-label={viewer.previous}>
            <Icon name="arrowLeft" size={18} />
          </button>
          <button type="button" className="darkroom__step" onClick={() => step(1)} aria-label={viewer.next}>
            <Icon name="arrowRight" size={18} />
          </button>
        </div>
      ) : null}
      <button type="button" className="darkroom__close" onClick={onClose} aria-label={viewer.close}>
        <Icon name="close" size={18} />
      </button>
    </dialog>
  )
}
