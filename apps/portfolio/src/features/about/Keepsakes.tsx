import type { CSSProperties, ReactNode } from 'react'
import type { Keepsake, OwnSticker, Sticker } from '../../content/about'
import { photos } from '../../content/me'
import { stickerMarks } from '../../content/sticker-marks'

const base = import.meta.env.BASE_URL
const at = (x: number, y: number, extra: Record<string, string | number> = {}) =>
  ({ '--x': `${x}%`, '--y': `${y}%`, ...extra }) as CSSProperties

/**
 * Something kept in the book: a print with a white foot, a website's screenshot, or a written index card, held
 * by tape, a pin, a clip or photo corners, set a little crooked. A slot is the same print, empty, for a photo to come.
 */
export function Photo({ item }: { readonly item: Keepsake }) {
  const known = item.photo ? photos.find((photo) => photo.name === item.photo) : undefined
  const src = known ? `${base}me/photos/${known.name}-print.webp` : item.src ? `${base}${item.src}` : undefined
  const label = item.label ?? known?.title
  const style = at(item.x, item.y, { '--w': `${item.w}%`, '--turn': `${item.turn}deg` })
  let body: ReactNode
  if (item.note) {
    body = (
      <span className="keepsake__note">
        <span className="keepsake__note-title">{item.note.title}</span>
        {item.note.lines.map((line) => (
          <span key={line} className="keepsake__note-line">
            {line}
          </span>
        ))}
      </span>
    )
  } else if (src) {
    body = <img src={src} alt={known?.alt ?? item.alt ?? ''} width={known?.width} height={known?.height} decoding="async" draggable={false} />
  } else {
    body = (
      <span className={`keepsake__slot keepsake__slot--${item.slot?.shape ?? 'wide'}`}>
        <span>{item.slot?.note}</span>
        <span className="keepsake__slot-note">photo to come</span>
      </span>
    )
  }
  return (
    <figure className={`keepsake keepsake--${item.mount}${item.bare || item.note ? ' keepsake--bare' : ''}`} style={style}>
      <span className="keepsake__print">
        {body}
        {label && !item.bare && !item.note ? <figcaption>{label}</figcaption> : null}
      </span>
      <Mount kind={item.mount} />
    </figure>
  )
}

function Mount({ kind }: { readonly kind: Keepsake['mount'] }) {
  switch (kind) {
    case 'tape':
      return (
        <>
          <span className="keepsake__tape keepsake__tape--a" aria-hidden="true" />
          <span className="keepsake__tape keepsake__tape--b" aria-hidden="true" />
        </>
      )
    case 'pin':
      return <span className="keepsake__pin" aria-hidden="true" />
    case 'clip':
      return (
        <svg className="keepsake__clip" viewBox="0 0 24 64" aria-hidden="true" focusable="false">
          <path d="M8 40V12a6 6 0 0 1 12 0v36a9 9 0 0 1-18 0V18" />
        </svg>
      )
    case 'corners':
      return (
        <>
          {['tl', 'tr', 'bl', 'br'].map((corner) => (
            <span key={corner} className={`keepsake__corner keepsake__corner--${corner}`} aria-hidden="true" />
          ))}
        </>
      )
  }
}

/** Light faces get an ink mark, dark ones a white mark. */
const isLight = (hex: string) => {
  const value = Number.parseInt(hex.slice(1), 16)
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255]
  return 0.299 * r + 0.587 * g + 0.114 * b > 170
}

/** The book's own stickers: drawn here, on the same 24 grid as the tool marks. */
const own: Record<Exclude<OwnSticker, 'bob' | 'veg' | 'ibm'>, { name: string; tone: string; path: string }> = {
  camera: {
    name: 'A camera',
    tone: '#1c1915',
    path: 'M4 7h3.2l1.6-2.4h6.4L16.8 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zm8 2.6a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4zm0 2a2.2 2.2 0 1 1 0 4.4 2.2 2.2 0 0 1 0-4.4zM18.6 9.2a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8z',
  },
  bat: {
    name: 'A bat',
    tone: '#f2c230',
    path: 'M12 9.4c.5-.8.8-1.8.9-2.8.7.6 1.1 1.5 1.2 2.6 1.5-1.1 3.6-1.6 5.9-1.3 1.6.9 2.9 2.6 3.3 4.6-1.3-.9-2.9-.9-3.9.1-.8-.9-2.2-1.2-3.4-.5-.9 1.4-2.4 3.5-4 6-1.6-2.5-3.1-4.6-4-6-1.2-.7-2.6-.4-3.4.5-1-1-2.6-1-3.9-.1.4-2 1.7-3.7 3.3-4.6 2.3-.3 4.4.2 5.9 1.3.1-1.1.5-2 1.2-2.6.1 1 .4 2 .9 2.8z',
  },
  flask: {
    name: 'A lab flask',
    tone: '#7c4dff',
    path: 'M9 2.5h6v1.8h-1v5.1l5.6 9.3A2 2 0 0 1 17.9 21.5H6.1a2 2 0 0 1-1.7-2.8L10 9.4V4.3H9V2.5zm-1.4 12.3-1.7 2.9a.6.6 0 0 0 .5.9h11.2a.6.6 0 0 0 .5-.9l-1.7-2.9H7.6z',
  },
}

/** A die-cut vinyl sticker: the mark on its colour, a white cut edge, and a corner that lifts when touched. */
export function StickerMark({ item }: { readonly item: Sticker }) {
  const style = at(item.x, item.y, { '--size': `${item.size}%`, '--turn': `${item.turn}deg` })
  const wrap = ''
  if (item.id === 'bob') {
    // Bob is a character, so his sticker is cut round him rather than a square.
    return (
      <span className={`sticker sticker--cutout${wrap}`} style={style} role="img" aria-label="IBM Bob">
        <img src={`${base}about/bob.webp`} alt="" width={512} height={512} draggable={false} decoding="async" />
      </span>
    )
  }
  if (item.id === 'ibm') {
    // The employer: IBM's name in heavy capitals cut by horizontal bars, on IBM blue.
    return (
      <span className="sticker" style={{ ...style, '--tone': '#0f62fe' } as CSSProperties} role="img" aria-label="IBM">
        <span className="sticker__face">
          <svg className="sticker__ibm" viewBox="0 0 60 30" aria-hidden="true" focusable="false">
            <defs>
              <mask id="ibm-bars">
                <rect width="60" height="30" fill="#fff" />
                {[8.4, 11.4, 14.4, 17.4, 20.4].map((y) => (
                  <rect key={y} y={y} width="60" height="1.1" fill="#000" />
                ))}
              </mask>
            </defs>
            <text x="30" y="23" textAnchor="middle" mask="url(#ibm-bars)">
              IBM
            </text>
          </svg>
        </span>
      </span>
    )
  }
  if (item.id === 'veg') {
    // India's vegetarian mark: a green dot in a green square.
    return (
      <span className={`sticker sticker--veg${wrap}`} style={{ ...style, '--tone': '#fff' } as CSSProperties} role="img" aria-label="Vegetarian">
        <span className="sticker__face">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="3" width="18" height="18" rx="1.5" fill="none" stroke="#138a36" strokeWidth="2.2" />
            <circle cx="12" cy="12" r="5" fill="#138a36" />
          </svg>
        </span>
      </span>
    )
  }
  const mark = item.id in own ? own[item.id as keyof typeof own] : stickerMarks[item.id as keyof typeof stickerMarks]
  return (
    <span
      className={`sticker${wrap}`}
      style={{ ...style, '--tone': mark.tone, '--mark': isLight(mark.tone) ? '#1c1915' : '#fff' } as CSSProperties}
      role="img"
      aria-label={mark.name}
    >
      <span className="sticker__face">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d={mark.path} fillRule="evenodd" />
        </svg>
      </span>
    </span>
  )
}

interface StampProps {
  readonly country: string
  readonly value: string
  readonly middle: string
  readonly caption: string
  readonly postmark: string
  readonly x: number
  readonly y: number
  readonly size: number
  readonly turn: number
}

/**
 * A postage stamp stuck on the page: perforated white edges, a printed face with the owner's initials and the
 * three cities, and a round postmark struck across one corner.
 */
export function PostageStamp({ country, value, middle, caption, postmark, x, y, size, turn }: StampProps) {
  return (
    <span className="postage" style={at(x, y, { '--size': `${size}%`, '--turn': `${turn}deg` })} aria-hidden="true">
      <span className="postage__paper">
        <span className="postage__face">
          <span className="postage__top">
            <span>{country}</span>
            <span className="postage__value">{value}</span>
          </span>
          <span className="postage__middle">{middle}</span>
          <svg className="postage__road" viewBox="0 0 100 24" preserveAspectRatio="none" focusable="false">
            <path d="M0 20 C 20 20, 22 6, 50 8 S 80 18, 100 4" />
            <circle cx="6" cy="20" r="2.6" />
            <circle cx="50" cy="8" r="2.6" />
            <circle cx="96" cy="5" r="2.6" />
          </svg>
          <span className="postage__caption">{caption}</span>
        </span>
      </span>
      <svg className="postage__mark" viewBox="0 0 120 120" focusable="false">
        <circle cx="60" cy="60" r="34" />
        <circle cx="60" cy="60" r="26" />
        <text x="60" y="64" textAnchor="middle">
          {postmark}
        </text>
        <path d="M96 44c8-4 14 4 22 0M96 56c8-4 14 4 22 0M96 68c8-4 14 4 22 0M96 80c8-4 14 4 22 0" />
      </svg>
    </span>
  )
}
