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

/** What a piece of writing is. One template for all of them (content/writing/_template/index.md). */
export type WritingKind = 'essay' | 'case-study' | 'research'

export interface WritingFact {
  readonly label: string
  readonly value: string
}

export interface WritingNumber {
  readonly value: string
  readonly label: string
}

/** One ## heading of a post: its address on the page and its words, for Contents. */
export interface WritingSection {
  readonly id: string
  readonly title: string
}

/** A post's front matter, checked at build time, plus what the build works out (its slug, reading time, sections). */
export interface WritingMeta {
  /** The folder's name, and the address: /writing/<slug>/. */
  readonly slug: string
  readonly title: string
  readonly summary: string
  /** YYYY-MM-DD. */
  readonly date: string
  readonly kind: WritingKind
  /** The post's category, from its front matter: the filter on /writing/ is made from these (?category=<slug>). */
  readonly category: string
  readonly tags: readonly string[]
  readonly draft: boolean
  readonly masthead: 'letter' | 'torn'
  /** Where private work was done, such as "IBM"; such a post has no code or demo links. */
  readonly private?: string | undefined
  readonly facts: readonly WritingFact[]
  readonly numbers: readonly WritingNumber[]
  readonly note?: string | undefined
  readonly minutes: number
  readonly sections: readonly WritingSection[]
}

/** A post with its body: the Markdown made into HTML at build time, and the files beside it. */
export interface WritingPiece extends WritingMeta {
  readonly html: string
  readonly materials: readonly string[]
}

/** A research paper. Every fact must come from the paper itself. */
export interface Paper {
  readonly slug: string
  readonly title: string
  readonly subtitle: string
  /** Shown in mono above the title: kind, year, arXiv category. */
  readonly meta: readonly string[]
  /** Two or three sentences on what was done and found, in the owner's voice. */
  readonly summary: string
  /** One headline result, the same voice as a featured build's fact. */
  readonly stat: { readonly from: string; readonly to: string; readonly label: string }
  readonly pdf: ExternalUrl
  readonly code: ExternalUrl
  /** Page one of the PDF, under /public, with its pixel size. */
  readonly preview: { readonly src: string; readonly width: number; readonly height: number; readonly alt: string }
  /** arXiv: the category submitted to, the endorsement code once arXiv sends it, and the abstract page once listed. */
  readonly arxiv: { readonly category: string; readonly endorseCode?: string; readonly href?: ExternalUrl }
}

/** A piece of writing: on Substack now, on this site later. */
export interface WritingPost {
  readonly title: string
  readonly href: string
  readonly where: 'substack' | 'here'
  /** YYYY-MM-DD. */
  readonly date: string
}

export interface BuildLogo {
  /** The mark for dark mode, light strokes: a path under /public. */
  readonly src: string
  /** The dark tile behind it, as on the build's own site. */
  readonly tile: string
  /** The same mark for light mode, dark strokes on a light tile, as the build's own site does in its light theme. */
  readonly light: { readonly src: string; readonly tile: string }
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
