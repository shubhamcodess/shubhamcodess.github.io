import { PALETTE_IDS } from "@portfolio/design/palettes";
import { BUTTON_OPTIONS } from "@portfolio/design/button-options";
import { z } from "zod";
import { COUNT_METRICS, GITHUB_METRICS, NPM_METRICS, NPM_PATTERN, REPO_PATTERN } from "@portfolio/stats/metrics";
import { LOGO_OPTIONS } from "./logo-options";
import { SCENE_OPTIONS } from "./scene-options";

export { LOGO_OPTIONS, SCENE_OPTIONS };

const url = z.url({ protocol: /^https?$/ });

/** Live numbers on a link: which repo or package, and which of its numbers, in the order shown. See `@portfolio/stats`. */
const linkStats = z.union([
  z.strictObject({ npm: z.string().regex(NPM_PATTERN), show: z.array(z.enum(NPM_METRICS)).min(1).max(NPM_METRICS.length) }),
  z.strictObject({ github: z.string().regex(REPO_PATTERN), show: z.array(z.enum(GITHUB_METRICS)).min(1).max(GITHUB_METRICS.length) }),
]).refine((s) => new Set(s.show).size === s.show.length, { message: "A number can only be shown once", path: ["show"] });

export const LOG_VERBS = ["owned", "migrated", "built", "replaced", "made", "shipped", "led", "designed", "reworked", "turned"] as const;
export const TOOLS = ["java", "spring", "angular", "react", "typescript", "openshift", "gke", "kubernetes", "github-actions", "azure-ad", "oracle", "rabbitmq", "mcp"] as const;
export type Tool = (typeof TOOLS)[number];

export const siteSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    /** Light mode's background selection. onLoad: use the default, or one random pick per visit. */
    background: z.strictObject({ default: z.enum(PALETTE_IDS), onLoad: z.enum(["config", "random"]) }),
    /** The Gotham scene and how the page meets it. */
    scene: z.strictObject({
      face: z.enum(SCENE_OPTIONS.face),
      contentFade: z.enum(SCENE_OPTIONS.contentFade),
      depth: z.enum(SCENE_OPTIONS.depth),
      sway: z.enum(SCENE_OPTIONS.sway),
      haze: z.enum(SCENE_OPTIONS.haze),
      dust: z.enum(SCENE_OPTIONS.dust),
      density: z.enum(SCENE_OPTIONS.density),
      reach: z.enum(SCENE_OPTIONS.reach),
      word: z.enum(SCENE_OPTIONS.word),
    }),
    /** How the header's buttons look and move. Any use can still override these. */
    headerButton: z.strictObject({
      texture: z.enum(BUTTON_OPTIONS.texture),
      shadow: z.enum(BUTTON_OPTIONS.shadow),
      hover: z.enum(BUTTON_OPTIONS.hover),
      press: z.enum(BUTTON_OPTIONS.press),
      sway: z.enum(BUTTON_OPTIONS.sway),
    }),
    /** The site-wide default for every button's icon and label hover motion. Set on the page's root; any button can still override its own. */
    buttonMotion: z.strictObject({
      iconHover: z.enum(BUTTON_OPTIONS.iconHover),
      textHover: z.enum(BUTTON_OPTIONS.textHover),
    }),
    /** Live GitHub and npm numbers, wherever a link asks for them (a link's `stats` in its project file). Fetched in the visitor's browser. */
    stats: z.strictObject({
      /** How long fetched numbers are kept before fetching again. */
      ttlMinutes: z.number().int().min(1).max(24 * 60),
      /** Keep them across reloads, in the visitor's browser storage. */
      persist: z.boolean(),
      /** The least each count must be to show. Below it, the number is left off and the link stays plain. */
      min: z.strictObject(Object.fromEntries(COUNT_METRICS.map((m) => [m, z.number().int().min(0)])) as Record<(typeof COUNT_METRICS)[number], z.ZodNumber>),
      /** Show monthly downloads even when they equal weekly (a package under a month old). */
      monthlyWhenSameAsWeekly: z.boolean(),
      /** The small dotted ring after the links that clears the cache and fetches fresh. */
      refresh: z.boolean(),
    }),
    /** The header logo: a blueprint plate with SP on it and a batarang thrown into the P. See `SiteLogo`. */
    logo: z.strictObject({
      lettering: z.enum(LOGO_OPTIONS.lettering),
      /** Faint cap, mid and base lines under the letters. */
      guides: z.boolean(),
      /** A hatched wireframe copy of SP, set back down and to the right, for a 2.5D look. */
      depth: z.boolean(),
      blade: z.enum(LOGO_OPTIONS.blade),
      /** The dashed flight line and amber target drawn before each throw. */
      aim: z.boolean(),
      /** On load, draw the plate and the letters before the throw. Off, the plate is there from the first paint and only the throw plays. */
      intro: z.boolean(),
      /** Pulling it out and throwing it again when a mouse comes over the logo. */
      hover: z.boolean(),
      /** Pull the batarang out once the page scrolls past `threshold` pixels, and throw it again back at the top. */
      scroll: z.strictObject({ pull: z.boolean(), threshold: z.number().int().min(1).max(600) }),
      /** Playback speed. 1 is the designed timing. */
      speed: z.number().min(0.25).max(3),
      /** Full turns in flight. */
      spins: z.number().min(0).max(4),
    }),
    hero: z.strictObject({
      lead: z.string().min(1),
      nightName: z.string().min(1),
      role: z.strictObject({ lines: z.array(z.string().min(1)).min(1).max(4), rest: z.string().min(1), seed: z.number().int(), minMs: z.number().min(2000), maxMs: z.number().max(12000) }),
      hook: z.strictObject({ prefix: z.string().min(1), lines: z.array(z.string().min(1)).min(2).max(6), seed: z.number().int(), minMs: z.number().min(2000), maxMs: z.number().max(12000) }),
      cta: z.strictObject({ label: z.string().min(1), href: z.string().min(1) }),
      tilt: z.strictObject({ y: z.number().min(0).max(14), x: z.number().min(0).max(8), reach: z.number().min(0).max(8) }),
      /** The small figure on the role's line. It sizes itself to the room there, within these limits. See `BatFigure`. */
      figure: z.strictObject({
        enabled: z.boolean(),
        props: z.strictObject({ anchor: z.number().min(0).max(1), face: z.enum(["left", "right"]), minHeight: z.number().min(12).max(120), maxHeight: z.number().min(12).max(240), clearance: z.number().min(0).max(40) }),
      }),
    }),
    /** Smooth scroll, content layers and reveals. Set `lerp` to 0 for native scrolling. */
    scroll: z.strictObject({ lerp: z.number().min(0).max(1), lag: z.number().min(0).max(3), parallax: z.number().min(0).max(3), reveal: z.enum(["none", "fade", "rise", "mask"]), hide: z.boolean() }),
    /** The section after the hero. Rank is the order of `items`. `span` is how many of the `columns` a card takes. */
    shipped: z.strictObject({
      kicker: z.string().min(1),
      title: z.tuple([z.string().min(1), z.string().min(1)]),
      columns: z.number().int().min(1).max(3),
      items: z.array(z.strictObject({ slug: z.string().min(1), layout: z.enum(["vertical", "horizontal"]), span: z.number().int().min(1).max(3) })).min(1).max(6),
      seeAll: z.strictObject({ label: z.string().min(1), href: z.string().min(1) }),
    }).refine((s) => s.items.every((i) => i.span <= s.columns), { message: "A card can't span more than the columns", path: ["items"] })
      .refine((s) => new Set(s.items.map((i) => i.slug)).size === s.items.length, { message: "A project can only be featured once", path: ["items"] }),
    /** The /projects page. */
    /** Where it started and what it is now, as scenes the scroll plays through. Every word must be true, and clients stay unnamed. */
    story: z.strictObject({
      kicker: z.string().min(1),
      /** Screens of scrolling per scene. */
      pace: z.number().min(0.4).max(2),
      /** The blueprint frame around the scenes. The section works with it on or off. */
      frame: z.boolean(),
      figure: z.strictObject({ anchor: z.number().min(0).max(1), face: z.enum(["left", "right"]), minHeight: z.number().min(12).max(120), maxHeight: z.number().min(12).max(240), clearance: z.number().min(0).max(40) }),
      scenes: z.array(z.strictObject({
        /** Its milestone on the line: words, or a batarang. */
        stop: z.discriminatedUnion("kind", [z.strictObject({ kind: z.literal("text"), text: z.string().min(1).max(8) }), z.strictObject({ kind: z.literal("batarang") })]),
        label: z.string().min(1),
        title: z.string().min(1),
        role: z.string().min(1),
        line: z.string().min(1),
        /** The caption for the motion graphic beside it. */
        figure: z.string().min(1),
        /** What was done, one line each. */
        log: z.array(z.strictObject({ verb: z.enum(LOG_VERBS), what: z.string().min(1) })).min(3).max(5),
        /** What it was done with. Each one has a hand-drawn logo. */
        tools: z.array(z.enum(TOOLS)).min(1).max(6),
      })).min(2).max(6),
    }),
    projects: z.strictObject({ kicker: z.string().min(1), title: z.tuple([z.string().min(1), z.string().min(1)]), description: z.string().min(1), columns: z.number().int().min(1).max(3) }),
    socials: z.array(z.strictObject({ label: z.string().min(1), href: url })),
    /** Sections hidden until there is something to show. */
    flags: z.strictObject({ writing: z.boolean(), photography: z.boolean(), ask: z.boolean(), motion: z.boolean(), backgroundPanel: z.boolean() }),
  })
  .strict();
export type SiteConfig = z.input<typeof siteSchema>;
/** The live numbers' settings, after parsing. */
export type StatsSettings = z.output<typeof siteSchema>["stats"];
/** The logo's settings, after parsing. */
export type LogoSettings = z.output<typeof siteSchema>["logo"];

export const projectSchema = z
  .strictObject({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: z.string().min(1),
    line: z.string().min(1).max(200),
    stack: z.array(z.string().min(1)).min(1),
    status: z.string().min(1),
    since: z.string().regex(/^\d{4}-\d{2}$/),
    /** A status that's running right now gets the small breathing square. */
    live: z.boolean(),
    /** Which live drawing this project shows. Built with the blueprint-motion-graphic skill. */
    stage: z.string().min(1).nullable(),
    /** Real numbers, shown on the plate when there's no drawing yet. */
    facts: z.array(z.strictObject({ value: z.string().min(1).max(10), label: z.string().min(1).max(40) })).min(1).max(3),
    /** hidden is left off the site, but the repo is public, so never put secrets in a hidden project. */
    visibility: z.enum(["listed", "hidden"]),
    /** Rank on the /projects page. The homepage's picks and rank are `shipped` in content/site.ts. */
    order: z.number().int().nonnegative(),
    private: z.boolean(),
    mount: z.enum(["path", "subdomain"]).default("path"),
    links: z.array(z.strictObject({ label: z.string().min(1), href: url, kind: z.enum(["site", "code", "feed", "package"]), stats: linkStats.optional() })).max(3),
  })
  .refine((p) => !p.private || p.links.length === 0, { message: "Private projects have no links", path: ["links"] });
/** The short version, for cards. Everything in it comes from the file's frontmatter. */
export type ProjectSummary = z.output<typeof projectSchema>;
/** The full version, for its page: the same file, plus its body. */
export type Project = ProjectSummary & { html: string };
