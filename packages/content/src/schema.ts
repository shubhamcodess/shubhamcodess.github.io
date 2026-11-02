import { PALETTE_IDS } from "@portfolio/design/palettes";
import { BUTTON_OPTIONS } from "@portfolio/design/button-options";
import { z } from "zod";
import { SCENE_OPTIONS } from "./scene-options";

export { SCENE_OPTIONS };

const url = z.url({ protocol: /^https?$/ });

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
    hero: z.strictObject({
      lead: z.string().min(1),
      nightName: z.string().min(1),
      role: z.strictObject({ lines: z.array(z.string().min(1)).min(1).max(4), rest: z.string().min(1), seed: z.number().int(), minMs: z.number().min(2000), maxMs: z.number().max(12000) }),
      hook: z.strictObject({ prefix: z.string().min(1), lines: z.array(z.string().min(1)).min(2).max(6), seed: z.number().int(), minMs: z.number().min(2000), maxMs: z.number().max(12000) }),
      cta: z.strictObject({ label: z.string().min(1), href: z.string().min(1) }),
      tilt: z.strictObject({ y: z.number().min(0).max(14), x: z.number().min(0).max(8), reach: z.number().min(0).max(8) }),
      /** The small figure standing at the end of the role's line. */
      figure: z.strictObject({ enabled: z.boolean() }),
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
    projects: z.strictObject({ kicker: z.string().min(1), title: z.tuple([z.string().min(1), z.string().min(1)]), description: z.string().min(1), columns: z.number().int().min(1).max(3) }),
    socials: z.array(z.strictObject({ label: z.string().min(1), href: url })),
    /** Sections hidden until there is something to show. */
    flags: z.strictObject({ writing: z.boolean(), photography: z.boolean(), ask: z.boolean(), motion: z.boolean(), backgroundPanel: z.boolean() }),
  })
  .strict();
export type SiteConfig = z.input<typeof siteSchema>;

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
    links: z.array(z.strictObject({ label: z.string().min(1), href: url, kind: z.enum(["site", "code", "feed", "package"]) })).max(3),
  })
  .refine((p) => !p.private || p.links.length === 0, { message: "Private projects have no links", path: ["links"] });
/** The short version, for cards. Everything in it comes from the file's frontmatter. */
export type ProjectSummary = z.output<typeof projectSchema>;
/** The full version, for its page: the same file, plus its body. */
export type Project = ProjectSummary & { html: string };
