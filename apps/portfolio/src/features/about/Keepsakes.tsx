import { useId, type CSSProperties } from 'react'
import type { Keepsake, Sticker } from '../../content/about'
import { photos } from '../../content/me'
import { stickerMarks } from '../../content/sticker-marks'

const base = import.meta.env.BASE_URL
const at = (x: number, y: number, extra: Record<string, string | number> = {}) =>
  ({ '--x': `${x}%`, '--y': `${y}%`, ...extra }) as CSSProperties

/**
 * A photo kept in the book: a print with a white foot, held by tape, a pin, a clip or photo corners, set a
 * little crooked. A slot is the same print, empty, for a photo still to come.
 */
export function Photo({ item }: { readonly item: Keepsake }) {
  const known = item.photo ? photos.find((photo) => photo.name === item.photo) : undefined
  const src = known ? `${base}me/photos/${known.name}-print.webp` : item.src ? `${base}${item.src}` : undefined
  const label = item.label ?? known?.title
  const style = at(item.x, item.y, { '--w': `${item.w}%`, '--turn': `${item.turn}deg` })
  return (
    <figure className={`keepsake keepsake--${item.mount}${item.bare ? ' keepsake--bare' : ''}`} style={style}>
      <span className="keepsake__print">
        {src ? (
          <img
            src={src}
            alt={known?.alt ?? item.alt ?? ''}
            width={known?.width}
            height={known?.height}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <span className={`keepsake__slot keepsake__slot--${item.slot?.shape ?? 'wide'}`}>
            <span>{item.slot?.note}</span>
            <span className="keepsake__slot-note">photo to come</span>
          </span>
        )}
        {label && !item.bare ? <figcaption>{label}</figcaption> : null}
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

/** A die-cut vinyl sticker: the mark on its colour, a white cut edge, and a corner that lifts when touched. */
export function StickerMark({ item }: { readonly item: Sticker }) {
  const style = at(item.x, item.y, { '--size': `${item.size}%`, '--turn': `${item.turn}deg` })
  if (item.id === 'bob') {
    return (
      <span className="sticker sticker--word" style={{ ...style, '--tone': '#0f62fe' } as CSSProperties} role="img" aria-label="IBM Bob">
        <span className="sticker__face">
          <span className="sticker__word" aria-hidden="true">
            Bob
          </span>
        </span>
      </span>
    )
  }
  const mark = stickerMarks[item.id]
  return (
    <span
      className="sticker"
      style={{ ...style, '--tone': mark.tone, '--mark': isLight(mark.tone) ? '#1c1915' : '#fff' } as CSSProperties}
      role="img"
      aria-label={mark.name}
    >
      <span className="sticker__face">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d={mark.path} />
        </svg>
      </span>
    </span>
  )
}

/** The rubber stamp: three cities round the rim, initials in the middle, pressed a little unevenly. */
export function Stamp({ ring, middle, foot, x, y, size, turn }: { ring: string; middle: string; foot: string; x: number; y: number; size: number; turn: number }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      className="stamp"
      viewBox="0 0 200 200"
      style={at(x, y, { '--size': `${size}%`, '--turn': `${turn}deg` })}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <path id={`${id}-ring`} d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0" />
        <filter id={`${id}-ink`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.55" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" result="inked" />
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="1" seed="3" result="warp" />
          <feDisplacementMap in="inked" in2="warp" scale="3" />
        </filter>
      </defs>
      <g filter={`url(#${id}-ink)`} className="stamp__ink">
        <circle cx="100" cy="100" r="94" fill="none" strokeWidth="4" />
        <circle cx="100" cy="100" r="56" fill="none" strokeWidth="2" />
        <text className="stamp__ring" fontSize="15.5" letterSpacing="2.2">
          <textPath href={`#${id}-ring`} startOffset="0">
            {ring.toUpperCase()}
          </textPath>
        </text>
        <text className="stamp__middle" x="100" y="110" textAnchor="middle" fontSize="40">
          {middle}
        </text>
        <text className="stamp__foot" x="100" y="134" textAnchor="middle" fontSize="11" letterSpacing="2">
          {foot.toUpperCase()}
        </text>
      </g>
    </svg>
  )
}
