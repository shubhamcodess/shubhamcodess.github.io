import type { ReactNode } from 'react'
import './folder-card.css'

interface FolderCardProps {
  /** Shown in the tab, for example "01". */
  readonly index: string
  /** Shown beside the index in the tab. */
  readonly label: string
  readonly title: string
  readonly headingLevel: 2 | 3
  readonly summary: string
  /** Makes the whole card open this address. Links in `actions` stay clickable on top. */
  readonly href?: string
  /** A name shared with the page this card opens, so the title travels there. */
  readonly transitionName?: string
  /** The area above the sheet: a headline fact now, a drawing or screenshot later. Leave out for the compact card. */
  readonly plate?: ReactNode
  readonly meta?: ReactNode
  readonly actions?: ReactNode
}

/**
 * The folder: a tab that rises out of a sheet, over an optional plate.
 * It knows nothing about builds, so anything filed on the site can use it.
 */
export function FolderCard({ index, label, title, headingLevel, summary, href, transitionName, plate, meta, actions }: FolderCardProps) {
  const Heading = `h${headingLevel}` as const
  return (
    <article className={plate ? 'folder folder--plate' : 'folder'} data-tilt="">
      {plate ? <div className="folder__plate">{plate}</div> : null}
      <div className="folder__sheet" data-tilt-surface="">
        <p className="folder__tab">
          <span className="folder__index">{index}</span>
          <span>{label}</span>
        </p>
        <Heading className="folder__title">
          {href ? (
            <a className="folder__link" href={href} {...(transitionName ? { style: { viewTransitionName: transitionName } } : {})}>
              {title}
            </a>
          ) : (
            title
          )}
        </Heading>
        <p className="folder__summary">{summary}</p>
        {meta ? <div className="folder__meta">{meta}</div> : null}
        {actions ? <div className="folder__actions">{actions}</div> : null}
      </div>
    </article>
  )
}
