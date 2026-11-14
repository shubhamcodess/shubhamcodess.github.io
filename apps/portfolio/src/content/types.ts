/** Content contracts. Every card and, later, every project page reads from these. */

export type ExternalUrl = `https://${string}`

export type BuildKind = 'AI tooling' | 'Developer tool' | 'Browser app' | 'Desktop app' | 'Publishing'

export type BuildLinkKind = 'code' | 'live' | 'package' | 'download'

export interface BuildLink {
  readonly kind: BuildLinkKind
  readonly href: ExternalUrl
}

/** One measured or verifiable fact, shown large on the card. The label says where the number comes from. */
export interface BuildHighlight {
  readonly value: string
  readonly label: string
}

export interface Build {
  /** Stable id, used for keys, anchors and later the project route. */
  readonly slug: string
  readonly title: string
  readonly kind: BuildKind
  /** One or two sentences. Must be true and taken from the project's own README. */
  readonly summary: string
  readonly year: number
  readonly stack: readonly string[]
  readonly highlight?: BuildHighlight
  /** Private projects carry no links. The first link is the card's main action. */
  readonly links: readonly BuildLink[]
}
