import type { BuildSlug } from '../content/builds'
import type { BuildKind } from '../content/types'
import type { ExternalUrl } from '../content/types'

export type ThemeName = 'light' | 'dark'

export type PaletteName = 'plain' | 'signature'

/** "pill": round and roomy. "lean": the same round shape, slimmer, with small mono labels and plain states. */
export type ButtonStyle = 'pill' | 'lean'

/** "grain": a barely-there film grain on the page panels. "none": clean gradient panels. */
export type TextureName = 'grain' | 'none'

/** Routes are a closed set. Add one here, add its HTML entry, and the compiler points at the rest. */
export type RouteId = 'home' | 'builds' | 'experience' | 'credentials' | 'me' | 'writing'

/** Every kind of page, for choosing its header links. A project page is one per build. */
export type NavPage = RouteId | 'project' | 'post'

export interface NavItem {
  readonly label: string
  readonly to: RouteId | `#${string}`
  /** Home page sections (by id) during which this link shows as current. */
  readonly activeOn?: readonly string[]
}

export interface RouteConfig {
  /** Path under the site base, with a trailing slash for directories. "" is the root. */
  readonly path: string
  readonly label: string
  /** The page's title in tabs, search results and link previews. Aim for 50 to 60 characters. */
  readonly title: string
  /** The page's search and preview description. Aim for 120 to 160 characters. */
  readonly description: string
}

/** What search engines, link previews and AI assistants read about the site. See src/seo/. */
export interface SeoConfig {
  /** Language and region, as Open Graph writes it. */
  readonly locale: string
  /** The person behind the site, for structured data. Every value must be true. */
  readonly person: {
    readonly jobTitle: readonly string[]
    readonly description: string
    readonly employer: { readonly name: string; readonly url: `https://${string}` }
    readonly locality: string
    readonly country: string
    /** Topics the person works in, for structured data and llms.txt. */
    readonly knowsAbout: readonly string[]
  }
  /** The link preview image, under /public. Make it with `pnpm --filter @portfolio/app social-image`. */
  readonly image: { readonly path: string; readonly width: number; readonly height: number; readonly alt: string }
  /** A project page's title: `{title}` and `{kind}` are filled in, then the owner's name follows. */
  readonly projectTitle: string
  /** Light and dark browser chrome colours: the page surface in each theme. */
  readonly themeColor: { readonly light: string; readonly dark: string }
}

/** Turn a part of the site on or off without touching components. */
export interface FeatureFlags {
  readonly themeToggle: boolean
  /** The sound toggle in the header, and the site's sound design behind it. */
  readonly sound: boolean
  /** The WebGL light behind the hero. Off leaves the static CSS backdrop. */
  readonly heroLight: boolean
  /** Pointer and scroll depth in the hero. */
  readonly heroParallax: boolean
  readonly featured: boolean
  /** The experience page and its teaser on the home page. */
  readonly experience: boolean
  /** The credentials page and the links to it. */
  readonly credentials: boolean
  /** The /me page (life away from work) and the links to it. */
  readonly mePage: boolean
  /** The framed stage for a build's motion graphic or recording on its page. */
  readonly projectMedia: boolean
  /** Keep the stage, with its "coming" note, on builds that have no preview yet. Off hides it there until one is added. */
  readonly projectMediaPending: boolean
  /** The pointer drawn as a comet: dart head, speed tail, bow wave. Off brings back the system arrow. */
  readonly cometCursor: boolean
  /** A short chalk line and a little dust behind the pointer. */
  readonly chalkTrail: boolean
  /** Cards lean toward the pointer in 2.5D, with a soft light where it is. */
  readonly tilt: boolean
  /** A preview card that follows the pointer over outside links. */
  readonly linkPreviews: boolean
  /** Live npm download totals beside every npm package link. */
  readonly npmDownloads: boolean
  readonly contact: boolean
  readonly buildsPage: boolean
  /** Filter chips by kind on the All builds page. */
  readonly buildsFilter: boolean
  /** A page per build. Off makes cards plain, with only their outside links. */
  readonly projectPages: boolean
  /** The light bar that replaces the browser's scrollbar. Off brings the native one back. */
  readonly scrollLight: boolean
  readonly footer: boolean
  /** The floating dock: rises while scrolling, holds the logo and the page you're on, opens every page. */
  readonly dock: boolean
  /** Research & writing on home, after Featured builds: the paper and the latest writing. */
  readonly research: boolean
  /**
   * The Writing pages (/writing/ and one per post), made from content/writing/. They appear only once there is a
   * published post; until then the header keeps Research and nothing about them is on the site.
   */
  readonly writing: boolean
}

export interface WritingConfig {
  readonly title: string
  readonly lead: string
  /** Each kind's name, in the list, the filter and a post's heading. */
  readonly kinds: { readonly essay: string; readonly 'case-study': string; readonly research: string }
  readonly all: string
  readonly count: string
  readonly back: string
  readonly contents: string
  readonly published: string
  readonly reading: string
  readonly minutes: string
  readonly privateLabel: string
  readonly previous: string
  readonly next: string
  readonly tags: string
  readonly openPicture: string
  readonly closePicture: string
}

export interface ResearchConfig {
  /** The section's anchor on home. */
  readonly id: string
  /** The section's name, also its label in the dock and footer. */
  readonly label: string
  readonly title: string
  readonly lead: string
  readonly readPaper: string
  readonly viewCode: string
  /** How many posts the writing list shows. */
  readonly writingCount: number
  readonly writingLabel: string
  readonly allWriting: { readonly label: string; readonly href: string }
  /** Where each post lives, as its small tag. */
  readonly where: { readonly substack: string; readonly here: string }
  readonly endorse: {
    readonly button: string
    readonly kicker: string
    readonly note: string
    readonly codeLabel: string
    /** The link that opens an email to the owner offering to endorse, and that email's subject and body. {title} and {category} are filled in. */
    readonly offer: string
    readonly mailSubject: string
    readonly mailBody: string
    readonly howLabel: string
    readonly howHref: string
    /** The button once the paper is listed on arXiv. */
    readonly listed: string
  }
}

export interface DockConfig {
  /** The dock's name for screen readers. */
  readonly label: string
  /** Read after the page name on the open button, for screen readers ("Experience, all pages"). */
  readonly openHint: string
  /** The open list's name for screen readers. */
  readonly sheetLabel: string
  /** How long the dock stays after scrolling stops, in ms. Long enough to reach it, short enough to stay out of the way. */
  readonly lingerMs: number
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
  /** The most pixels the light draws per frame. On large screens it renders smaller and the browser scales it up. */
  readonly maxPixels: number
  /** The most frames a second it draws. 120Hz screens would otherwise draw it twice as often for no visible gain. */
  readonly maxFps: number
  /**
   * How much the light softens behind the words on wide screens, so the lanes blur out where text sits.
   * It is drawn in the shader: a CSS backdrop blur would re-blur the moving canvas every frame. 0 (the chosen look) keeps the lanes crisp; about 4 frosts them.
   */
  readonly plateSoften: number
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

/** The page at any address with no page (404.html). The address that was typed sits between the two parts of `lead`. */
export interface NotFoundConfig {
  readonly code: string
  readonly title: string
  readonly lead: readonly [before: string, after: string]
  readonly actions: readonly { readonly label: string; readonly to: RouteId }[]
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
  /** Where the site lives, with no trailing slash. Used for the sitemap. */
  readonly url: `https://${string}`
  readonly monogram: string
  /** The header logo: "mark" is the drawn SP tile, "monogram" the letters set in type. */
  readonly logo: 'mark' | 'monogram'
  readonly theme: {
    readonly default: ThemeName
    readonly storageKey: string
    /**
     * The colour character of the whole site, in both themes.
     * "plain": pure black frame, neutral grey-green panels.
     * "signature": the hero light's two colours become the two themes. Midnight blue for dark, warm paper for light.
     */
    readonly palette: PaletteName
    /** The look of every chip and button. See ButtonStyle. */
    readonly buttons: ButtonStyle
    /** Paper texture on the page panels. See TextureName. */
    readonly texture: TextureName
    /** Names the theme switch for screen readers. */
    readonly label: string
  }
  readonly routes: Readonly<Record<RouteId, RouteConfig>>
  readonly seo: SeoConfig
  /**
   * The header's links, in order, at every width: the home page's own anchors. Each page leaves out its own link.
   * Keep each short: on a phone the bar holds the logo and these.
   * Every other page is in the dock and the footer.
   */
  readonly nav: readonly NavItem[]
  /** The floating dock at the foot of the screen: every page, from anywhere. */
  readonly dock: DockConfig
  readonly research: ResearchConfig
  readonly writing: WritingConfig
  readonly hero: HeroConfig
  readonly notFound: NotFoundConfig
  readonly featured: {
    readonly id: string
    readonly title: string
    readonly lead: string
    readonly slugs: FeaturedSlugs
    readonly seeAll: string
  }
  readonly buildsPage: {
    readonly title: string
    readonly lead: string
    readonly allLabel: string
    /** The two links at the foot of the page. */
    readonly experience: string
    readonly contact: string
  }
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
    /**
     * How a project page leads to the previous and next build. "links": quiet text links at the foot of
     * the story, like every other page. "panels": two large panels below it.
     */
    readonly onward: 'links' | 'panels'
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
    /** The home page's credentials block: a title and one line, matching the experience block above it. */
    readonly credentialsTitle: string
    readonly credentialsLead: string
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
  readonly me: {
    readonly kicker: string
    readonly title: string
    readonly lead: string
    readonly onward: string
    /** The link back to the professional side, at the foot of the page. */
    readonly back: string
    /** Names the row of tags for screen readers. */
    readonly topicsLabel: string
    /** The slight angle each tag hangs at, in degrees, in order. */
    readonly turns: readonly number[]
    /** The cue under the tags that leads to every photo. */
    readonly everyPhoto: string
    /** How a tag counts its photos: "1 photo", "4 photos". */
    readonly photo: { readonly one: string; readonly many: string }
    readonly gallery: {
      /** The gallery's heading for screen readers. */
      readonly label: string
      /** The small bar of tags kept at the top while the gallery is on screen, and its first pill. */
      readonly dockLabel: string
      readonly all: string
      readonly showAll: string
      /** Shown for a topic that has no photos yet. */
      readonly empty: string
    }
    readonly viewer: {
      readonly close: string
      readonly previous: string
      readonly next: string
    }
  }
  readonly credentialsPage: {
    readonly title: string
    readonly lead: string
    readonly verify: string
    readonly more: string
    readonly loading: string
    readonly failed: string
    /** Where the full record lives, offered when the list can't load. */
    readonly wallet: `https://${string}`
    readonly walletLabel: string
    /**
     * How every credential card looks, on home and on /credentials/.
     * "badge": the stitched card with the award mark, the credential's own badge, level, name, issuer and Verify.
     * "classic": the cards as they were before (home's patches, the credentials page's plain cards).
     */
    readonly card: 'badge' | 'classic'
    /**
     * Home's three featured credentials, always as the three stitched patches abreast.
     * "text": level, name and issuer. "badge": the issuer on top and the credential's own badge in the middle.
     */
    readonly homeCard: 'text' | 'badge'
    /** The small line above a credential's name when its title names no level. */
    readonly fallbackLevel: string
  }
  readonly contact: {
    readonly id: string
    readonly kicker: string
    readonly title: string
    readonly lead: string
    readonly email: `${string}@${string}`
    readonly findLabel: string
    /** A quiet link under the profiles to /me, for whoever wants to know the person too. */
    readonly offClock: string
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
  readonly sound: {
    /** Off until the visitor turns it on. Browsers won't play sound before a click anyway. */
    readonly defaultOn: boolean
    readonly storageKey: string
    /** Master level, 0 to 1. Every voice is already quiet; this scales them all. */
    readonly volume: number
    /** A soft page-turn after this many pixels of scrolling, and no closer together than gapMs. */
    readonly scroll: { readonly every: number; readonly gapMs: number }
    readonly label: string
  }
  /**
   * The comet cursor. `tailMax` is how many times its resting length the tail stretches at full speed,
   * `bowAt` the speed (0 to 1) above which the bow wave starts to show.
   */
  readonly cometCursor: { readonly tailMax: number; readonly bowAt: number }
  /**
   * The chalk trail. `lifeMs` is how long the line lasts, `width` its thickness in px at the tip,
   * `opacity` its strength (0 to 1), `dust` the chance (0 to 1) of shedding a speck on each pointer move,
   * `follow` how quickly the tip catches the pointer each frame (0 to 1, lower lags more),
   * `maxLength` the longest the line may be in px, however fast the pointer moves.
   */
  readonly chalkTrail: {
    readonly lifeMs: number
    readonly width: number
    readonly opacity: number
    readonly dust: number
    readonly follow: number
    readonly maxLength: number
  }
  /** Live npm download totals beside package links, fetched in the visitor's browser. */
  readonly npmDownloads: {
    /** How long a fetched total is kept before npm is asked again. */
    readonly ttlMinutes: number
    /** The least a total must be to show. */
    readonly min: number
  }
  /** How far a card leans toward the pointer, in degrees at its edge. Keep it small: a lean, not a flip. */
  readonly tilt: { readonly maxDeg: number }
  /** Order of the groups on the All builds page. */
  readonly kinds: readonly BuildKind[]
  readonly features: FeatureFlags
}
