import { PALETTE_IDS } from "@portfolio/design";
import { z } from "zod";

const url = z.url({ protocol: /^https?$/ });

export const siteSchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1),
    /** Light mode's background selection. onLoad: use the default, or one random pick per visit. */
    background: z.strictObject({ default: z.enum(PALETTE_IDS), onLoad: z.enum(["config", "random"]) }),
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
    /** Which live drawing this project shows. Built with the blueprint-motion-graphic skill. */
    stage: z.string().min(1).nullable(),
    /** hidden is left off the site, but the repo is public, so never put secrets in a hidden project. */
    visibility: z.enum(["featured", "listed", "hidden"]),
    size: z.enum(["big", "small"]),
    order: z.number().int().nonnegative(),
    private: z.boolean(),
    mount: z.enum(["path", "subdomain"]).default("path"),
    links: z.array(z.strictObject({ label: z.string().min(1), href: url, kind: z.enum(["site", "code", "feed"]) })).max(3),
  })
  .refine((p) => !p.private || p.links.length === 0, { message: "Private projects have no links", path: ["links"] });
export type Project = z.output<typeof projectSchema> & { html: string };
