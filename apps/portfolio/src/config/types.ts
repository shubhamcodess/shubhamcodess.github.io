import type { BuildSlug } from '../content/builds'
import type { BuildKind } from '../content/types'
import type { ExternalUrl } from '../content/types'

export type ThemeName = 'light' | 'dark'

export type PaletteName = 'plain' | 'signature'

/** Routes are a closed set. Add one here, add its HTML entry, and the compiler points at the rest. */
export type RouteId = 'home' | 'builds' | 'experience' | 'credentials'

export interface RouteConfig {
  /** Path under the site base, with a trailing slash for directories. "" is the root. */
  readonly path: string
  readonly label: string
  readonly title: string
}

/** Turn a part of the site on or off without touching components. */
export interface FeatureFlags {
  readonly themeToggle: boolean
  /** The WebGL light behind the hero. Off leaves the static CSS backdrop. */
  readonly heroLight: boolean
  /** Pointer and scroll depth in the hero. */
  readonly heroParallax: boolean
  readonly featured: boolean
  /** The experience page and its teaser on the home page. */
  readonly experience: boolean
  /** The credentials page and the links to it. */
  readonly credentials: boolean
  /** The framed stage for a build's recording on its page, shown even before the recording exists. */
  readonly projectMedia: boolean
  /** A preview card that follows the pointer over outside links. */
  readonly linkPreviews: boolean
  readonly contact: boolean
  readonly buildsPage: boolean
  /** Filter chips by kind on the All builds page. */
  readonly buildsFilter: boolean
  /** A page per build. Off makes cards plain, with only their outside links. */
  readonly projectPages: boolean
  /** The light bar that replaces the browser's scrollbar. Off brings the native one back. */
  readonly scrollLight: boolean
  readonly footer: boolean
}

export type Rgb = readonly [red: number, green: number, blue: number]

/** Tuning for the hero light. Positions and widths are fractions of the scene. */
export interface HeroLightConfig {
  /** Overall brightness, 0 to 1. The light sits behind the words and must never compete with them. */
  readonly intensity: number
  /** Fewer lanes on narrow screens, so each one stays a clear line. */
  readonly lanes: { readonly wide: number; readonly narrow: number }
  /** How fast pulses travel. 0.4 is brisk, 0.2 is slow. */
  readonly speed: number
  /** Where the floor meets the wall, measured from the top. */
  readonly horizon: number
  /** Width of the upright band of light. */
  readonly wallWidth: { readonly wide: number; readonly narrow: number }
  /** Smaller values make the floor spread faster, so it reads as closer. */
  readonly floorPerspective: number
  readonly cornerRadius: number
  readonly cool: Rgb
  readonly warm: Rgb
  /** Share of lanes that take the warm color, 0 to 1. */
  readonly warmShare: number
  /** How dim the floor gets as it comes toward the viewer, 0 to 1. */
  readonly nearFade: number
  readonly maxPixelRatio: number
  readonly parallax: {
    /** How far the light follows the pointer, as a fraction of the scene. */
    readonly pointerLight: number
    /** How far the words move against the pointer, in pixels. */
    readonly pointerContent: number
    /** How much slower than the page the light scrolls, 0 to 1. */
    readonly scrollLight: number
  }
}

export interface HeroConfig {
  readonly name: readonly [first: string, last: string]
  readonly role: string
  readonly employer: string
  readonly statement: string
  readonly actions: readonly { readonly label: string; readonly to: RouteId | `#${string}` }[]
  /** Pixels of scroll after which the hero's action chips fade out. */
  readonly actionsHideAfter: number
  readonly light: HeroLightConfig
}

type S = BuildSlug
/** One to five builds. The featured grid has a designed layout for each count, and none beyond five. */
export type FeaturedSlugs = readonly [S] | readonly [S, S] | readonly [S, S, S] | readonly [S, S, S, S] | readonly [S, S, S, S, S]

/** How the contact badge hangs and swings. */
export interface SwingConfig {
  /** Spring stiffness. Higher swings faster. */
  readonly stiffness: number
  /** Friction. Lower keeps it swinging longer. */
  readonly damping: number
  /** Degrees it starts from when it first comes into view. */
  readonly dropAngle: number
  /** Most degrees the pointer can pull it to either side. */
  readonly pointerPull: number
  /** Degrees per second added by a tap. */
  readonly tapKick: number
}

export interface SocialLink {
  readonly label: string
  readonly href: ExternalUrl
  readonly icon: 'github' | 'linkedin' | 'producthunt' | 'substack'
  /** The handle or name shown beside the label. */
  readonly detail: string
}

export interface SiteConfig {
  readonly owner: string
  readonly monogram: string
  readonly theme: {
    readonly default: ThemeName
    readonly storageKey: string
    /**
     * The colour character of the whole site, in both themes.
     * "plain": pure black frame, neutral grey-green panels.
     * "signature": the hero light's two colours become the two themes. Midnight blue for dark, warm paper for light.
     */
    readonly palette: PaletteName
  }
  readonly routes: Readonly<Record<RouteId, RouteConfig>>
  readonly nav: readonly { readonly label: string; readonly to: RouteId | `#${string}` }[]
  readonly hero: HeroConfig
  readonly featured: {
    readonly id: string
    readonly title: string
    readonly lead: string
    readonly slugs: FeaturedSlugs
    readonly seeAll: string
  }
  readonly buildsPage: { readonly title: string; readonly lead: string; readonly allLabel: string }
  readonly projectPage: {
    /** Brightness of the light behind a project's title. Lower than the hero: this page is for reading. */
    readonly lightIntensity: number
    readonly sections: { readonly features: string; readonly engineering: string; readonly limits: string }
    readonly labels: { readonly year: string; readonly kind: string; readonly stack: string; readonly links: string }
    readonly back: string
    readonly overview: string
    readonly useCase: string
    /** Shown in the media stage until a build has its recording. */
    readonly mediaPending: string
    readonly next: string
    readonly previous: string
  }
  readonly experience: {
    /** The teaser on the home page. */
    readonly id: string
    readonly kicker: string
    readonly title: string
    readonly lead: string
    readonly more: string
    readonly toolsLabel: string
    /** The page itself. */
    readonly page: { readonly title: string; readonly lead: string }
    readonly labels: {
      readonly now: string
      readonly built: string
      readonly delivered: string
      readonly recognition: string
      readonly recognitionLead: string
    }
  }
  readonly credentialsPage: { readonly title: string; readonly lead: string; readonly verify: string; readonly more: string }
  readonly contact: {
    readonly id: string
    readonly kicker: string
    readonly title: string
    readonly lead: string
    readonly email: `${string}@${string}`
    readonly findLabel: string
    readonly links: readonly SocialLink[]
    readonly badge: {
      readonly kind: string
      readonly handle: string
      readonly serial: string
      readonly swapLabel: string
      /** Names the small button that plays the badge's arrival again. */
      readonly replayLabel: string
      /** The title printed on the badge. It can differ from the role in the hero. */
      readonly role: string
      readonly strap: string
      readonly portraitAlt: string
      readonly labs: { readonly name: string; readonly by: string; readonly status: string }
      /** The portrait's arrival: soft grey cells shimmer, then dissolve from the top down. Cell size in pixels, times in ms. */
      readonly reveal: { readonly cell: number; readonly holdMs: number; readonly dissolveMs: number; readonly pulseMs: number }
      readonly swing: SwingConfig
    }
  }
  /** Order of the groups on the All builds page. */
  readonly kinds: readonly BuildKind[]
  readonly features: FeatureFlags
}
