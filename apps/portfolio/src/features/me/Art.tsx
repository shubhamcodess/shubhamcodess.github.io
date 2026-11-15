interface ArtProps {
  readonly src: string
  readonly label: string
}

/** A drawing, picture or looping clip for a tile, chosen by its file type. Decorative: the tile's title says what it is. */
export function Art({ src, label }: ArtProps) {
  const url = `${import.meta.env.BASE_URL}${src}`
  return /\.(mp4|webm)$/i.test(src) ? (
    <video className="me-art" src={url} autoPlay muted loop playsInline aria-label={label} />
  ) : (
    <img className="me-art" src={url} alt="" loading="lazy" decoding="async" />
  )
}
