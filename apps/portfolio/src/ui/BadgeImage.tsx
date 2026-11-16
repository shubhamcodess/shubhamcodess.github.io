import './badge-image.css'

interface BadgeImageProps {
  /** A path under /public. */
  readonly src: string
  readonly className?: string | undefined
}

/**
 * A credential's badge, set behind a pane of glass like a plaque: a clear, faint pane with a soft sheen across it,
 * and the badge's own colours eased back a little so it sits with the page in light and dark rather than shouting.
 * Decorative: the card around it names the credential.
 */
export function BadgeImage({ src, className }: BadgeImageProps) {
  return (
    <span className={`badge-glass${className ? ` ${className}` : ''}`} aria-hidden="true">
      <img src={`${import.meta.env.BASE_URL}${src}`} alt="" loading="lazy" decoding="async" />
    </span>
  )
}
