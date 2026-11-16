import type { Build } from './types'

/**
 * Every public build, in display order for the All builds page. Card data only: each build's full
 * story is in build-stories.ts, which only project pages load.
 * Facts come from each repository's README and its own benchmarks. Don't round numbers up.
 */
export const builds = [
  {
    slug: 'mcp-token-optimizer',
    title: 'MCP Token Optimizer',
    kind: 'AI tooling',
    summary:
      'A self-hosted proxy between your AI agent and its MCP servers. It shrinks every tool response without changing what the agent can do.',
    year: 2026,
    stack: ['TypeScript', 'Node.js', 'MCP', 'Ollama', 'TOON'],
    highlight: { value: '98.4%', label: 'tokens saved on a CI build log' },
    links: [
      { kind: 'code', href: 'https://github.com/shubhamcodess/mcp-token-optimizer' },
      { kind: 'live', href: 'https://shubhamcodess.github.io/mcp-token-optimizer/' },
      { kind: 'package', href: 'https://www.npmjs.com/package/@shubhamcodess/mcp-token-optimizer' },
    ],
  },
  {
    slug: 'whatcmd',
    title: 'whatcmd',
    kind: 'Developer tool',
    summary:
      'Type plain English at your shell prompt and get the right command for your OS and tools. A local model, no API keys, and nothing runs until you press Enter.',
    year: 2026,
    stack: ['TypeScript', 'Node.js', 'Ollama', 'zsh', 'bash'],
    highlight: { value: '217 ms', label: 'median end to end, on an M4 Pro' },
    links: [
      { kind: 'code', href: 'https://github.com/shubhamcodess/whatcmd' },
      { kind: 'live', href: 'https://shubhamcodess.github.io/whatcmd/' },
      { kind: 'package', href: 'https://www.npmjs.com/package/@shubhamcodess/whatcmd' },
    ],
  },
  {
    slug: 'everything-tech',
    title: 'EverythingTech',
    kind: 'App',
    summary:
      'A daily tech newspaper with no human editor. It reads 45+ sources overnight, merges the duplicates and writes each story from the full article.',
    year: 2026,
    stack: ['Python', 'GitHub Actions', 'GitHub Pages'],
    highlight: { value: '45+', label: 'sources read overnight' },
    links: [
      { kind: 'live', href: 'https://shubhamcodess.github.io/everything-tech-newsletter/' },
      { kind: 'code', href: 'https://github.com/shubhamcodess/everything-tech-newsletter' },
    ],
  },
  {
    slug: 'tiny-browse',
    title: 'tiny-browse',
    kind: 'AI tooling',
    summary:
      'An MCP server and Node library that gives any AI agent web search. It uses the Chrome you already have and returns clean Markdown inside a hard token budget.',
    year: 2026,
    stack: ['TypeScript', 'MCP', 'Chrome DevTools Protocol'],
    highlight: { value: '0', label: 'runtime dependencies' },
    links: [
      { kind: 'code', href: 'https://github.com/shubhamcodess/tiny-browse' },
      { kind: 'live', href: 'https://shubhamcodess.github.io/tiny-browse/' },
      { kind: 'package', href: 'https://www.npmjs.com/package/@shubhamcodess/tiny-browse' },
    ],
  },
  {
    slug: 'fuzzy',
    title: 'fuzzy',
    kind: 'Developer tool',
    summary:
      'Search any GitHub repository by name, typo or meaning. A Rust engine compiled to WebAssembly builds the index in your browser, so the code never leaves it.',
    year: 2026,
    stack: ['Rust', 'WebAssembly', 'TypeScript', 'tree-sitter'],
    highlight: { value: '139 KB', label: 'search engine, gzipped' },
    links: [
      { kind: 'live', href: 'https://shubhamcodess.github.io/fuzzy/' },
      { kind: 'code', href: 'https://github.com/shubhamcodess/fuzzy' },
    ],
  },
  {
    slug: 'openvox',
    title: 'openvox',
    kind: 'In-browser AI',
    summary:
      'Talk to GitHub. Name a profile or repository and it introduces it out loud, then answers spoken questions. Speech, retrieval and the model run in the browser.',
    year: 2026,
    stack: ['React', 'TypeScript', 'WebGPU', 'WebLLM'],
    highlight: { value: '0', label: 'servers. Audio never leaves the browser' },
    links: [
      { kind: 'live', href: 'https://shubhamcodess.github.io/openvox/' },
      { kind: 'code', href: 'https://github.com/shubhamcodess/openvox' },
    ],
  },
  {
    slug: 'classify',
    title: 'classify',
    kind: 'In-browser AI',
    summary:
      'Write a playbook of categories and rules, drop in a spreadsheet, and get every row decided. Unsure rows queue for review, and files never leave the tab.',
    year: 2026,
    stack: ['JavaScript', 'transformers.js', 'WebGPU'],
    links: [
      { kind: 'live', href: 'https://shubhamcodess.github.io/classify/' },
      { kind: 'code', href: 'https://github.com/shubhamcodess/classify' },
    ],
  },
  {
    slug: 'notch-porch',
    title: 'Notch Porch',
    kind: 'App',
    summary:
      "A widget dock that lives in your MacBook's notch, and as a pill at the top of the screen on Windows. It starts with a full YouTube Music player.",
    year: 2026,
    stack: ['JavaScript', 'Electron'],
    links: [
      { kind: 'code', href: 'https://github.com/shubhamcodess/notch-porch' },
      { kind: 'download', href: 'https://github.com/shubhamcodess/notch-porch/releases' },
    ],
  },
  {
    slug: 'focusify-yt',
    title: 'Focusify',
    kind: 'App',
    summary:
      'A Chrome extension that keeps YouTube on your study topic and hides videos that do not fit. Everything runs on your machine, with no accounts or tracking.',
    year: 2026,
    stack: ['JavaScript', 'Chrome extension', 'Ollama'],
    links: [{ kind: 'code', href: 'https://github.com/shubhamcodess/focusify-yt' }],
  },
] as const satisfies readonly Build[]

export type BuildSlug = (typeof builds)[number]['slug']

const bySlug: ReadonlyMap<string, Build> = new Map(builds.map((build) => [build.slug, build]))

export function getBuild(slug: BuildSlug): Build {
  const build = bySlug.get(slug)
  if (!build) throw new Error(`Unknown build: ${slug}`)
  return build
}
