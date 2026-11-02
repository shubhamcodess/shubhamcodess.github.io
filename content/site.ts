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
    kicker: "Experience",
    title: ["My day job.", "How it's been over the years."],
    pace: 1.05,
    frame: true, // false takes the blueprint frame away; the words stay on the same column.
    figure: { anchor: 0.94, face: "left", minHeight: 22, maxHeight: 46, clearance: 6 },
    // Clients stay unnamed here. IBM is fine. Every claim comes from the user's own public profile; don't round anything up.
    scenes: [
      {
        stop: { kind: "text", text: "2020" },
        label: "It started with", title: "Keeping it running.", role: "Associate System Engineer, IBM", figure: "A system that can't stop",
        line: "The global tax engines behind every in-store and online sale of a multinational retailer.",
        log: [
          { verb: "owned", what: "production deployments and high-priority incidents" },
          { verb: "migrated", what: "the platform twice: OpenShift 3 to 4, then OpenShift to GKE" },
          { verb: "replaced", what: "repeated tax-holiday firefighting with an advance-check process" },
          { verb: "built", what: "a unit-testing framework for a legacy Spring codebase that had none" },
        ],
        tools: ["java", "spring", "angular", "openshift", "gke"],
      },
      {
        stop: { kind: "batarang" },
        label: "Then", title: "Building it.", role: "Application Developer, IBM", figure: "Legacy into a modern stack",
        line: "Moving enterprise applications off a legacy stack, starting with the pilot that had to prove it.",
        log: [
          { verb: "built", what: "the pilot's Angular codebase and team standards from scratch; it got the wider migration approved" },
          { verb: "made", what: "a 10,000-item dropdown feel instant" },
          { verb: "built", what: "a multi-day calendar view natively, with no library" },
          { verb: "shipped", what: "the program's first single sign-on" },
          { verb: "led", what: "teams of up to 10 engineers" },
        ],
        tools: ["angular", "typescript", "spring", "java", "openshift", "azure-ad"],
      },
      {
        stop: { kind: "batarang" },
        label: "Then", title: "Leading it.", role: "Team lead and shadow architect, IBM", figure: "One framework, many systems",
        line: "A B2B order platform live in production, with its architecture co-designed alongside the solution architect.",
        log: [
          { verb: "designed", what: "the shared framework every source-system integration runs on" },
          { verb: "reworked", what: "batch processing with bounded concurrency and a tuned thread executor" },
          { verb: "turned", what: "a 20-minute data compile into seconds" },
          { verb: "led", what: "a team to deliver an inventory valuation app a month ahead of schedule" },
        ],
        tools: ["java", "spring", "angular", "oracle", "openshift"],
      },
      {
        stop: { kind: "batarang" },
        label: "Now", title: "Cloud Full Stack Developer.", role: "IBM", figure: "Every layer, with agents on top",
        line: "Products from requirement to production: backend, frontend, schema and deployment. And AI agents for enterprise applications.",
        log: [
          { verb: "designed", what: "a reusable CI/CD framework, adopted across 10+ repositories" },
          { verb: "built", what: "a browser-based Kubernetes fleet control plane, with an MCP server and an AI assistant" },
          { verb: "built", what: "a workflow platform with a visual DAG builder and live run monitoring" },
          { verb: "led", what: "the team: PR reviews, code standards, architecture decisions" },
        ],
        tools: ["java", "react", "kubernetes", "github-actions", "rabbitmq", "mcp"],
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
