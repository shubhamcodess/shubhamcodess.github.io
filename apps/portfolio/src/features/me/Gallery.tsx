import { useEffect, useMemo, useRef, useState } from 'react'
import type { MePhoto } from '../../content/me'
import { Peg, Rope } from './Rope'

interface GalleryProps {
  readonly photos: readonly MePhoto[]
  /** Opens a photo in the viewer, by its place in `photos`. */
  readonly onOpen: (index: number) => void
  readonly label: string
}

/** The slight turn of each print as it hangs, in degrees, in order. Wide prints turn less. */
const turns = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5]
/** How many places one line has at a width: fewer on narrow screens, so each print stays large. */
const placesAt = (width: number) => (width < 440 ? 2 : width < 760 ? 3 : width < 1100 ? 4 : 5)
/** Lines strung at first, and how many more each time the visitor nears the end. */
const firstLines = 3
const moreLines = 2

export const photoUrl = (photo: MePhoto, size: 'print' | 'large' | 'video') =>
  `${import.meta.env.BASE_URL}me/photos/${photo.name}${size === 'print' ? '-print' : ''}.${size === 'video' ? 'mp4' : 'webp'}`

const isWide = (photo: MePhoto) => photo.width > photo.height * 1.15

interface Hung {
  readonly photo: MePhoto
  readonly index: number
  /** Places it takes on the line: 2 for a wide photo. */
  readonly span: number
  /** The place it starts at. */
  readonly from: number
}

/**
 * Fills each line in order. When a wide photo won't fit the space left, the next upright one that does steps
 * in, so a line doesn't end with a gap. Looks a few photos ahead at most, so the order stays close to the list.
 */
function hang(photos: readonly MePhoto[], places: number): Hung[][] {
  const queue = photos.map((photo, index) => ({ photo, index, span: isWide(photo) ? Math.min(2, places) : 1 }))
  const lines: Hung[][] = []
  while (queue.length) {
    const line: Hung[] = []
    let used = 0
    while (queue.length && used < places) {
      const at = queue.findIndex((item, ahead) => ahead < 4 && used + item.span <= places)
      if (at === -1) break
      const [item] = queue.splice(at, 1)
      if (!item) break
      line.push({ ...item, from: used })
      used += item.span
    }
    lines.push(line)
  }
  return lines
}

/**
 * Every photo, hung on twine lines like prints drying, uncropped: an upright photo takes one place on its line
 * and one peg, a wide one two of each. Each print is a polaroid with its short title on the foot. Lines are
 * strung as the visitor scrolls, each print fading in as it is pegged.
 */
export function Gallery({ photos, onOpen, label }: GalleryProps) {
  const root = useRef<HTMLDivElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [strung, setStrung] = useState(firstLines)

  useEffect(() => {
    const element = root.current
    if (!element) return
    const sizes = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.round(entry.contentRect.width))
    })
    sizes.observe(element)
    return () => sizes.disconnect()
  }, [])

  const places = placesAt(width || 1240)
  const lines = useMemo(() => hang(photos, places), [photos, places])

  // A new set of photos starts again from the first lines.
  useEffect(() => setStrung(firstLines), [photos])

  useEffect(() => {
    const marker = end.current
    if (!marker || strung >= lines.length) return
    const near = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setStrung((count) => count + moreLines)
    }, { rootMargin: '900px 0px' })
    near.observe(marker)
    return () => near.disconnect()
  }, [strung, lines.length])

  return (
    <div ref={root} className="clothesline" role="group" aria-label={label}>
      {lines.slice(0, strung).map((line, lineIndex) => (
        <div key={`${places}-${lineIndex}`} className="clothesline__row" style={{ '--places': places } as React.CSSProperties}>
          {width ? <Rope width={width} className="clothesline__rope" /> : null}
          <ul className="clothesline__prints">
            {line.map(({ photo, index, span, from }, place) => {
              const wide = span > 1
              // Hang lower toward the middle of the line, following its sag.
              const drop = Math.sin(((from + span / 2) / places) * Math.PI)
              return (
                <li
                  key={photo.name}
                  className={`print${wide ? ' print--wide' : ''}`}
                  style={
                    {
                      '--print-turn': `${(turns[index % turns.length] ?? 0) * (wide ? 0.4 : 1)}deg`,
                      '--print-drop': drop.toFixed(3),
                      '--print-order': place,
                      '--print-ratio': `${photo.width} / ${photo.height}`,
                    } as React.CSSProperties
                  }
                >
                  {wide ? (
                    <>
                      <Peg className="print__peg print__peg--left" />
                      <Peg className="print__peg print__peg--right" />
                    </>
                  ) : (
                    <Peg className="print__peg" />
                  )}
                  <button type="button" className="print__open" onClick={() => onOpen(index)} aria-label={`${photo.title}. ${photo.alt}`}>
                    <span className="print__photo">
                      <img src={photoUrl(photo, 'print')} alt="" width={photo.width} height={photo.height} loading="lazy" decoding="async" />
                      <span className="photo-glass" aria-hidden="true" />
                      {photo.video ? (
                        <span className="print__play" aria-hidden="true">
                          <svg viewBox="0 0 24 24" focusable="false">
                            <path d="M9 7.5v9l7.5-4.5Z" />
                          </svg>
                        </span>
                      ) : null}
                    </span>
                    <span className="print__title">{photo.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
      <div ref={end} className="clothesline__end" aria-hidden="true" />
    </div>
  )
}
