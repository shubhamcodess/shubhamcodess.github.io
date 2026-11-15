import { techIcons } from '../content/tech-icons'
import './tech-tag.css'

interface TechTagProps {
  readonly name: string
}

/** A piece of tech as a small tag: its mark in the page's ink, then its name. Names without a mark show the name alone. */
export function TechTag({ name }: TechTagProps) {
  const mark = techIcons[name]
  return (
    <span className="tech-tag">
      {mark ? (
        <svg className="tech-tag__mark" viewBox="0 0 24 24" width={14} height={14} aria-hidden="true" focusable="false">
          <path d={mark} />
        </svg>
      ) : null}
      <span>{name}</span>
    </span>
  )
}
