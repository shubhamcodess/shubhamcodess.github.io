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
    role: { lines: ["Cloud", "AI"], rest: "Full Stack Developer", seed: 3, minMs: 3600, maxMs: 6200 }, // The first word turns over; the rest stays on the dimension line.
    hook: { prefix: "Building", lines: ["tech that matters", "AI products at scale", "open source products", "for the cloud, end to end", "things worth shipping"], seed: 7, minMs: 3200, maxMs: 5600 },
    cta: { label: "What I shipped recently", href: "/#featured" },
    tilt: { y: 5, x: 2, reach: 3.5 }, // Degrees at rest, and how far the pointer moves it.
    figure: { enabled: true, props: { anchor: 1, face: "left", minHeight: 22, maxHeight: 52, clearance: 4 } },
  },
  shipped: {
    kicker: "Featured builds",
    title: ["What I shipped recently.", "Open source, real impact."],
    columns: 3,
    // Rank is this order. Try: both vertical with columns 2 and span 1, both horizontal with columns 1, or three cards with columns 3 and span 1.
    items: [
      { slug: "everything-tech", layout: "horizontal", span: 2 },
      { slug: "mcp-token-optimizer", layout: "vertical", span: 1 },
    ],
    seeAll: { label: "See all my builds", href: "/projects/" },
  },
  story: {
    kicker: "How I got here",
    pace: 1.05,
    figure: { anchor: 0.95, face: "left", minHeight: 30, maxHeight: 58, clearance: 0 },
    // Clients stay unnamed here. IBM is fine. Every claim comes from the user's own public profile; don't round anything up.
    scenes: [
      {
        label: "It started with", title: "Keeping it running.", role: "Associate System Engineer, IBM", drawing: "running",
        line: "My first system was one that couldn't stop: the global tax engines behind every in-store and online sale of a multinational retailer.",
        proof: ["Owned production deployments and high-priority incidents.", "Took part in two platform migrations: OpenShift 3 to 4, then OpenShift to GKE.", "Built a unit-testing framework for a legacy Spring codebase that had none."],
      },
      {
        label: "Then", title: "Building it.", role: "Application Developer, IBM", drawing: "building",
        line: "Moved enterprise applications off a legacy stack and onto Spring Boot, Angular and OpenShift, starting with the pilot that had to prove it.",
        proof: ["Built the pilot's Angular codebase and team standards from scratch. Its success got the wider migration approved.", "Made a 10,000-item dropdown feel instant, with virtualized rendering, pre-fetching and indexed in-memory search.", "Shipped the program's first single sign-on, on Azure AD."],
      },
      {
        label: "Then", title: "Leading it.", role: "Team lead and shadow architect, IBM", drawing: "leading",
        line: "Led teams of up to 10 engineers, then a B2B order platform live in production, co-designing its architecture with the solution architect.",
        proof: ["Designed the shared framework every source-system integration runs on. A new integration means writing tasks, not new plumbing.", "Turned a 20-minute data compile into seconds with a scheduled materialized view.", "Led a team to deliver an inventory valuation app a month ahead of schedule."],
      },
      {
        label: "Now", title: "Cloud Full Stack Developer.", role: "IBM", drawing: "whole",
        line: "I take products from requirement to production: backend, frontend, schema and deployment. And I build AI agents for enterprise applications.",
        proof: ["Designed a reusable GitHub Actions CI/CD framework, adopted across 10+ repositories.", "Built a browser-based Kubernetes fleet control plane, with an MCP server and an AI assistant on top.", "Built a workflow platform with a visual DAG builder, live run monitoring, RabbitMQ and Java 21 virtual threads."],
      },
    ],
  },
  projects: { kicker: "All projects", title: ["All my builds.", "The list is still growing."], description: "Projects by Shubham Prakash.", columns: 2 },
  scroll: { lerp: 0.14, lag: 1, parallax: 1, reveal: "mask", hide: true },
  buttonMotion: { iconHover: "trace", textHover: "grow" },
  socials: [
    { label: "GitHub", href: "https://github.com/shubhamcodess" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/shubham-prakash-dev/" },
  ],
  flags: { writing: false, photography: false, ask: false, motion: true, backgroundPanel: false },
} satisfies SiteConfig;

export const site = siteSchema.parse(config);
