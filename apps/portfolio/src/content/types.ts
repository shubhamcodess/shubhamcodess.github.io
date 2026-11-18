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
  /** Plain text with inline marks: `command`, **key word**, “quotation”, [[Key]]. See ui/RichText.tsx. */
  readonly overview: string
  /** Up to three measured facts, shown large at the top of the page. Each label names its source or conditions. */
  readonly facts?: readonly BuildHighlight[]
  readonly features: readonly string[]
  /** A longer write-up of one real use, in paragraphs. Shown as its own section when present. */
  readonly useCase?: { readonly title: string; readonly paragraphs: readonly string[] }
  readonly engineering?: readonly string[]
  /** Stated plainly. A project that names its limits reads as more credible, not less. */
  readonly limits?: readonly string[]
}

export interface BuildLogo {
  /** A path under /public. */
  readonly src: string
  /** The tile colour behind the mark on the build's own site. */
  readonly tile: string
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
  /**
   * The build's own logo, from its own site: the mark alone (an SVG under /public, its tile left out) and the
   * colour of the tile it sits on there. Shown as a small glass badge on the featured card.
   */
  readonly logo?: BuildLogo
  /** The build in motion: a recording or motion graphic, served from /public. */
  readonly media?: { readonly kind: 'video' | 'image'; readonly src: string; readonly alt: string }
}
