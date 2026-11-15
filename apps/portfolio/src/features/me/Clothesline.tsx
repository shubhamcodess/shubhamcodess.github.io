import { useState } from 'react'
import type { PlacePhoto } from '../../content/me'
import { PhotoViewer } from './PhotoViewer'

interface ClotheslineProps {
  readonly photos: readonly PlacePhoto[]
  /** Empty frames to hang while there are no photos yet, so the layout can be judged. 0 hangs none. */
  readonly emptySlots: number
  /** Names the line for screen readers, such as "Photos from Bengaluru". */
  readonly label: string
}

/** The slight turn of each print as it hangs, in degrees, in order. */
const turns = [-3, 2, -1.5, 3, -2.5, 1.5]

const url = (path: string) => `${import.meta.env.BASE_URL}${path}`

/**
 * Photos pegged to a gently sagging line, like prints drying. Each print turns a little and hangs lower
 * toward the middle of the line, in a faint polaroid frame under one glassy finish, so every photo reads as
 * part of one set. A print opens large in a viewer. With no photos it hangs empty frames, if asked to.
 */
export function Clothesline({ photos, emptySlots, label }: ClotheslineProps) {
  const [opened, setOpened] = useState<number | null>(null)
  const prints = photos.length ? photos : Array.from({ length: emptySlots }, () => null)
  if (!prints.length) return null
  return (
    <div className="clothesline" {...(photos.length ? { role: 'group', 'aria-label': label } : { 'aria-hidden': true })}>
      <svg className="clothesline__line" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 6 Q500 34 1000 6" />
      </svg>
      <ul className="clothesline__prints">
        {prints.map((photo, index) => {
          // Hang lower toward the middle, following the line's sag.
          const along = prints.length === 1 ? 0.5 : index / (prints.length - 1)
          const drop = Math.sin(along * Math.PI)
          return (
            <li
              key={photo?.src ?? index}
              className={photo ? 'clothesline__print' : 'clothesline__print clothesline__print--empty'}
              style={{ '--print-turn': `${turns[index % turns.length] ?? 0}deg`, '--print-drop': drop.toFixed(3) } as React.CSSProperties}
            >
              <span className="clothesline__peg" />
              {photo ? (
                <button type="button" className="clothesline__open" onClick={() => setOpened(index)} aria-label={`Open photo: ${photo.alt}`}>
                  <img src={url(photo.print)} alt="" loading="lazy" decoding="async" />
                  <span className="clothesline__glass" aria-hidden="true" />
                </button>
              ) : null}
            </li>
          )
        })}
      </ul>
      {photos.length && opened !== null ? (
        <PhotoViewer photos={photos} index={opened} onIndex={setOpened} onClose={() => setOpened(null)} />
      ) : null}
    </div>
  )
}
