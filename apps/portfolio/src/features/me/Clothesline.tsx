import { useEffect, useRef, useState } from 'react'
import type { PlacePhoto } from '../../content/me'
import { PhotoViewer } from './PhotoViewer'

interface ClotheslineProps {
  readonly photos: readonly PlacePhoto[]
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
 * viewer. With no photos there is no line.
 */
export function Clothesline({ photos, label }: ClotheslineProps) {
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

  if (!photos.length) return null
  const lines: PlacePhoto[][] = []
  for (let i = 0; i < photos.length; i += perLine) lines.push(photos.slice(i, i + perLine))

  return (
    <div ref={root} className="clothesline" role="group" aria-label={label}>
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
                  key={photo.src}
                  className="clothesline__print"
                  style={{ '--print-turn': `${turns[index % turns.length] ?? 0}deg`, '--print-drop': drop.toFixed(3) } as React.CSSProperties}
                >
                  <span className="clothesline__peg" />
                  <button type="button" className="clothesline__open" onClick={() => setOpened(index)} aria-label={`Open photo: ${photo.alt}`}>
                    <img src={url(photo.print)} alt="" loading="lazy" decoding="async" />
                    <span className="clothesline__glass" aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      {opened !== null ? (
        <PhotoViewer photos={photos} index={opened} onIndex={setOpened} onClose={() => setOpened(null)} />
      ) : null}
    </div>
  )
}
