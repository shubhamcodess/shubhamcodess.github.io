import type { Paper, WritingPost } from './types'
import writingFeed from './writing.json'

/**
 * The research shown on home. Facts come from the paper and its repository
 * (github.com/shubhamcodess/codemode-quiet-faults). Don't round numbers up.
 */
export const papers = [
  {
    slug: 'the-blind-script',
    title: 'The Blind Script',
    subtitle: 'Quiet tool faults in code-mode agents, and an injection-safe execution digest',
    meta: ['Paper', '2026', 'cs.AI'],
    summary:
      'Agents that call tools from a script only see what the script prints, so a tool that quietly returns bad data goes unnoticed. I measured how often, across 2,088 runs of four small local models, and tested a fix: a short report the runtime builds from the tools’ own schemas.',
    stat: { from: '3', to: '36', label: 'of 48 quiet faults caught, before and after the digest (qwen3:4b)' },
    pdf: 'https://github.com/shubhamcodess/codemode-quiet-faults/blob/main/paper/main.pdf',
    code: 'https://github.com/shubhamcodess/codemode-quiet-faults',
    preview: {
      // Page one cropped to the title, author line and abstract, at twice the resolution so the words can be read.
      src: 'research/the-blind-script-abstract.webp',
      width: 1330,
      height: 1330,
      alt: 'The top of page one of the paper: its title, author and abstract.',
    },
    arxiv: { category: 'cs.AI' },
  },
] as const satisfies readonly Paper[]

/** The latest writing, newest first: the Substack feed, refreshed by `pnpm data` (scripts/fetch-writing.mjs). */
export const writing: readonly WritingPost[] = writingFeed as readonly WritingPost[]
