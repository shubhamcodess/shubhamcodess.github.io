import { siteSchema, type SiteConfig } from "@portfolio/content/schema";

/** Edit, push, deploy. */
const config = {
  name: "Shubham Prakash",
  description: "Shubham Prakash's corner of the internet.",
  background: { default: "oldGotham", onLoad: "config" },
  scene: { face: "clear", contentFade: "mid", depth: "big", sway: "full", haze: "full", dust: "full", density: "normal", reach: "mid", word: "faint" },
  headerButton: { texture: "hatch", shadow: "br", hover: "shadow", press: "keycap", sway: "off" },
  hero: {
    lead: "I am",
    nightName: "Vengeance", // For night mode, to read "I am Vengeance". Not wired up until dark mode exists.
    role: "Cloud Full Stack Developer",
    hook: { prefix: "Building", lines: ["tech that matters", "AI products at scale", "open source products", "for the cloud, end to end", "things worth shipping"], seed: 7, minMs: 3200, maxMs: 5600 },
    cta: { label: "What I shipped recently", href: "/#projects" },
    tilt: { y: 5, x: 2, reach: 3.5 }, // Degrees at rest, and how far the pointer moves it.
  },
  scroll: { lerp: 0.14, lag: 1, parallax: 1, reveal: "mask", hide: true },
  buttonMotion: { iconHover: "trace", textHover: "grow" },
  socials: [
    { label: "GitHub", href: "https://github.com/shubhamcodess" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shubham-prakash-dev/" },
  ],
  flags: { writing: false, photography: false, ask: false, motion: true, backgroundPanel: true },
} satisfies SiteConfig;

export const site = siteSchema.parse(config);
