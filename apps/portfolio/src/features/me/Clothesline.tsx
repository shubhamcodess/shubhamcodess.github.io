import { useEffect, useRef, useState } from 'react'
import type { PlacePhoto } from '../../content/me'
import { PhotoViewer } from './PhotoViewer'

interface ClotheslineProps {
  readonly photos: readonly PlacePhoto[]
  /** Empty frames to hang while there are no photos yet, so the layout can be judged. 0 hangs none. */
  readonly emptySlots: number
  /** Names the lines for screen readers, such as "Photos from Bengaluru". */
  readonly label: string
}

/** The slight turn of each print as it hangs, in degrees, in order. */
const turns = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5]

/** How many prints share one line at a width: fewer on narrow screens, so each stays large. */
const perLineAt = (width: number) => (width < 440 ? 2 : width < 760 ? 3 : 4)

const url = (path: string) => `${import.meta.env.BASE_URL}${path}`

/**
 * Photos pegged to gently sagging lines, like prints drying. As many lines are strung as the photos need at
 * the width there is. Each print turns a little and hangs lower toward the middle of its line, in a faint
 * polaroid frame under one glassy finish, so every photo reads as part of one set. A print opens large in a
 * viewer. With no photos it hangs one line of empty frames, if asked to.
 */
export function Clothesline({ photos, emptySlots, label }: ClotheslineProps) {
  const root = useRef<HTMLDivElement>(null)
  const [perLine, setPerLine] = useState(4)
  const [opened, setOpened] = useState<number | null>(null)

  useEffect(() => {
    const element = root.current
    if (!element) return
    const sizes = new ResizeObserver(([entry]) => {
      if (entry) setPerLine(perLineAt(entry.contentRect.width))
    })
    sizes.observe(element)
    return () => sizes.disconnect()
  }, [])

  const prints: readonly (PlacePhoto | null)[] = photos.length ? photos : Array.from({ length: emptySlots }, () => null)
  if (!prints.length) return null
  const lines: (PlacePhoto | null)[][] = []
  for (let i = 0; i < prints.length; i += perLine) lines.push(prints.slice(i, i + perLine))

  return (
    <div ref={root} className="clothesline" {...(photos.length ? { role: 'group', 'aria-label': label } : { 'aria-hidden': true })}>
      {lines.map((line, lineIndex) => (
        <div key={lineIndex} className="clothesline__row" style={{ '--per-line': perLine } as React.CSSProperties}>
          <svg className="clothesline__line" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 6 Q500 34 1000 6" />
          </svg>
          <ul className="clothesline__prints">
            {line.map((photo, indexInLine) => {
              const index = lineIndex * perLine + indexInLine
              // Hang lower toward the middle of the full line, following its sag.
              const along = perLine === 1 ? 0.5 : (indexInLine + 0.5) / perLine
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
        </div>
      ))}
      {photos.length && opened !== null ? (
        <PhotoViewer photos={photos} index={opened} onIndex={setOpened} onClose={() => setOpened(null)} />
      ) : null}
    </div>
  )
}
