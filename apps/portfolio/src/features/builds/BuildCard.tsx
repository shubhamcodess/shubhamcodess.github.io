import type { Build, BuildLinkKind } from '../../content/types'
import { ActionLink } from '../../ui/ActionLink'
import { FolderCard } from '../../ui/FolderCard'
import './builds.css'

const linkLabels = {
  code: 'Code',
  live: 'Live',
  package: 'npm',
  download: 'Download',
} as const satisfies Record<BuildLinkKind, string>

interface BuildCardProps {
  readonly build: Build
  /** Position in its list, starting at 1. */
  readonly position: number
  /** "feature" carries the plate with the build's headline fact. "compact" is the index card. */
  readonly variant: 'feature' | 'compact'
  readonly headingLevel: 2 | 3
}

export function BuildCard({ build, position, variant, headingLevel }: BuildCardProps) {
  const { highlight } = build
  const stat = highlight ? (
    <p className={`build-stat build-stat--${variant}`}>
      <span className="build-stat__value">{highlight.value}</span> <span className="build-stat__label">{highlight.label}</span>
    </p>
  ) : null

  return (
    <FolderCard
      index={String(position).padStart(2, '0')}
      label={build.kind}
      title={build.title}
      headingLevel={headingLevel}
      summary={build.summary}
      {...(variant === 'feature' && stat ? { plate: stat } : {})}
      meta={
        <>
          {variant === 'compact' ? stat : null}
          <ul className="build-stack" aria-label="Built with">
            {build.stack.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      }
      {...(build.links.length > 0
        ? {
            actions: build.links.map((link) => (
              <ActionLink key={link.href} href={link.href} external label={`${linkLabels[link.kind]}: ${build.title}`}>
                {linkLabels[link.kind]}
              </ActionLink>
            )),
          }
        : {})}
    />
  )
}
