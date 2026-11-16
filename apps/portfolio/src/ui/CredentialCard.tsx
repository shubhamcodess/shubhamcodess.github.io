import { Icon } from './Icon'
import './credential-card.css'

/** Levels a credential's title can end with. They show small above the name. */
const levels = ['Professional', 'Associate', 'Foundations', 'Fundamentals', 'Practitioner', 'Advanced', 'Essentials', 'Expert', 'Leader']

/**
 * A credential's level and name, read from its title.
 * "Claude Certified Architect, Professional" gives Professional and Claude Certified Architect;
 * "Azure Developer Associate" gives Associate and Azure Developer; "Associate Cloud Engineer" gives Associate and
 * Cloud Engineer; "Azure Fundamentals" keeps its whole name.
 */
export function splitCredential(title: string): { readonly level?: string; readonly name: string } {
  const [, head, tail] = /^(.*), ([^,]+)$/.exec(title) ?? []
  if (head && tail && levels.includes(tail)) return { level: tail, name: head }
  const last = levels.find((level) => title.endsWith(` ${level}`))
  if (last) return { level: last, name: title.split(' ').length > 2 ? title.slice(0, -last.length - 1) : title }
  const first = levels.find((level) => title.startsWith(`${level} `))
  if (first) return { level: first, name: title.slice(first.length + 1) }
  return { name: title }
}

interface CredentialCardProps {
  readonly name: string
  readonly issuer: string
  readonly level?: string | undefined
  readonly href?: string | undefined
  /** The credential's own badge, or the issuer's mark when it has none. A path under /public. */
  readonly image?: string | undefined
  /** Shown when there is no level. */
  readonly fallbackLevel: string
  readonly verify: string
}

/**
 * One credential, the same on home and on /credentials/: a raised card with a stitched line inside its edge,
 * the award mark and the level on the left, the credential's own badge on the right, then its name, its issuer
 * and Verify. The whole card is the link to the issuer's record.
 */
export function CredentialCard({ name, issuer, level, href, image, fallbackLevel, verify }: CredentialCardProps) {
  const content = (
    <>
      <span className="credcard__head">
        <span className="credcard__mark">
          <Icon name="credential" size={20} />
        </span>
        {image ? (
          <img className="credcard__badge" src={`${import.meta.env.BASE_URL}${image}`} alt="" loading="lazy" decoding="async" />
        ) : null}
      </span>
      <span className="credcard__level">{level ?? fallbackLevel}</span>
      <span className="credcard__name">{name}</span>
      <span className="credcard__foot">
        <span className="credcard__issuer">{issuer}</span>
        {href ? (
          <span className="credcard__verify">
            <span>{verify}</span>
            <Icon name="arrowUpRight" />
          </span>
        ) : null}
      </span>
    </>
  )
  const className = 'credcard'
  return href ? (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-tilt=""
      aria-label={`${verify}: ${name}${level ? `, ${level}` : ''}, ${issuer}`}
    >
      {content}
    </a>
  ) : (
    <div className={className} data-tilt="">
      {content}
    </div>
  )
}
