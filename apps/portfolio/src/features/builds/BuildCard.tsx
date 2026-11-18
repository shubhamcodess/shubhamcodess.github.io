import type { CSSProperties } from 'react'
import { site } from '../../config/site'
import type { Build, BuildLinkKind } from '../../content/types'
import { hrefToBuild } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { FolderCard } from '../../ui/FolderCard'
import { NpmDownloads } from '../../ui/NpmDownloads'
import './builds.css'

export const linkLabels = {
  code: 'Code',
  live: 'Live',
  package: 'npm',
  download: 'Download',
} as const satisfies Record<BuildLinkKind, string>

interface BuildCardProps {
  readonly build: Build
  /** "feature" carries the plate with the build's headline fact. "compact" is the index card. */
  readonly variant: 'feature' | 'compact'
  readonly headingLevel: 2 | 3
}

export function BuildCard({ build, variant, headingLevel }: BuildCardProps) {
  const { highlight } = build
  const stat = highlight ? (
    <p className={`build-stat build-stat--${variant}`}>
      <span className="build-stat__value">{highlight.value}</span> <span className="build-stat__label">{highlight.label}</span>
    </p>
  ) : null

  // Featured: the headline fact on the left of the plate, the build's own logo as a small glass badge on the right.
  const plate =
    variant === 'feature' && (stat || build.logo) ? (
      <div className="build-plate">
        {stat}
        {build.logo ? (
          <span className="app-badge" style={{ '--app-badge-tile': build.logo.tile } as CSSProperties} aria-hidden="true">
            <span className="app-badge__tile">
              <img src={`${import.meta.env.BASE_URL}${build.logo.src}`} alt="" width={24} height={24} loading="lazy" decoding="async" />
            </span>
          </span>
        ) : null}
      </div>
    ) : null

  return (
    <FolderCard
      label={build.kind}
      title={build.title}
      headingLevel={headingLevel}
      summary={build.summary}
      {...(site.features.projectPages ? { href: hrefToBuild(build.slug), transitionName: `build-${build.slug}` } : {})}
      {...(plate ? { plate } : {})}
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
                {link.kind === 'package' && site.features.npmDownloads ? (
                  <NpmDownloads href={link.href} settings={site.npmDownloads} />
                ) : null}
              </ActionLink>
            )),
          }
        : {})}
    />
  )
}
