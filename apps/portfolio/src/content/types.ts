/** Content contracts. Every card and, later, every project page reads from these. */

export type ExternalUrl = `https://${string}`

/** Kinds group the All builds page. Keep the set small: a kind with one build is not a group. */
export type BuildKind = 'AI tooling' | 'Developer tool' | 'In-browser AI' | 'App'

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

/** What the project page says. Every line must be true and come from the project's own README. */
export interface BuildStory {
  readonly overview: string
  /** Up to three measured facts, shown large at the top of the page. Each label names its source or conditions. */
  readonly facts?: readonly BuildHighlight[]
  readonly features: readonly string[]
  readonly engineering?: readonly string[]
  /** Stated plainly. A project that names its limits reads as more credible, not less. */
  readonly limits?: readonly string[]
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
  readonly story: BuildStory
}
