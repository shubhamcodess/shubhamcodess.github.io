interface ClotheslineProps {
  readonly photos: readonly { readonly src: string; readonly alt: string }[]
  /** Empty frames to hang while there are no photos yet, so the layout can be judged. 0 hangs none. */
  readonly emptySlots: number
}

/** The slight turn of each print as it hangs, in degrees, in order. */
const turns = [-3, 2, -1.5, 3, -2.5, 1.5]

/**
 * Photos pegged to a gently sagging line, like prints drying. Each print turns a little and hangs lower
 * toward the middle of the line. With no photos it hangs empty frames, if asked to, and nothing otherwise.
 */
export function Clothesline({ photos, emptySlots }: ClotheslineProps) {
  const prints = photos.length ? photos : Array.from({ length: emptySlots }, () => null)
  if (!prints.length) return null
  return (
    <div className="clothesline" aria-hidden={photos.length ? undefined : true}>
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
              {photo ? <img src={`${import.meta.env.BASE_URL}${photo.src}`} alt={photo.alt} loading="lazy" decoding="async" /> : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
