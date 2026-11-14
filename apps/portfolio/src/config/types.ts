import type { BuildSlug } from '../content/builds'
import type { BuildKind } from '../content/types'
import type { ExternalUrl } from '../content/types'

export type ThemeName = 'light' | 'dark'

/** Routes are a closed set. Add one here, add its HTML entry, and the compiler points at the rest. */
export type RouteId = 'home' | 'builds'

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
export type FeaturedSlugs =
  | readonly [S]
  | readonly [S, S]
  | readonly [S, S, S]
  | readonly [S, S, S, S]
  | readonly [S, S, S, S, S]

export interface SocialLink {
  readonly label: string
  readonly href: ExternalUrl
}

export interface SiteConfig {
  readonly owner: string
  readonly monogram: string
  readonly theme: { readonly default: ThemeName; readonly storageKey: string }
  readonly routes: Readonly<Record<RouteId, RouteConfig>>
  readonly nav: readonly RouteId[]
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
    readonly next: string
    readonly previous: string
  }
  /** Order of the groups on the All builds page. */
  readonly kinds: readonly BuildKind[]
  readonly socials: readonly SocialLink[]
  readonly features: FeatureFlags
}
