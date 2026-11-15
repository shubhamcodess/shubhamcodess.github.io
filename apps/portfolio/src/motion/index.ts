import type { BuildSlug } from '../content/builds'
import type { Motion } from './types'

/*
 * Every build that has a motion graphic. The replays themselves are each their own chunk: nothing is fetched
 * until a project page asks for its own build's replay, so no other page carries any of it. The label is here,
 * not in the chunk, so the words are on the page before the replay loads.
 */
export interface MotionEntry {
  /** What the replay shows, in words, for screen readers and search. */
  readonly label: string
  readonly load: () => Promise<Motion>
}

const entries = {
  'mcp-token-optimizer': {
    label:
      'Replay of MCP Token Optimizer: a coding agent asks the GitHub MCP server for 40 issues. The response is 37,355 tokens; mto removes noise fields such as node_id, avatar_url and the *_url links, keeps the originals, and the agent receives 13,244 tokens, 64.5% fewer.',
    load: () => import('./mcp-token-optimizer').then((m) => m.motion),
  },
  whatcmd: {
    label:
      'Replay of whatcmd in a terminal: it is installed with npm and set up with whatcmd init, then plain-English requests after /w become shell commands on the prompt, such as finding files bigger than 100MB, refining them with /w+, and finding what is using port 8080. A joke is refused, and a risky rm -rf gets a warning.',
    load: () => import('./whatcmd').then((m) => m.motion),
  },
  fuzzy: {
    label:
      'Replay of fuzzy on expressjs/express: the repository is indexed in 10.5 seconds, a keyword search for res.redirect finds 40 results in 1.7 ms, then a search by meaning, "stop users who are not logged in", finds the same restrict function in 27 ms.',
    load: () => import('./fuzzy').then((m) => m.motion),
  },
  'everything-tech': {
    label:
      'Recording of a reader on EverythingTech, the edition of Friday 30 October 2026: the front page with its cover story on the Binance withdrawals, the must-reads, the Wire filtered to AI stories, a quick hit opened, the foot of the page, the archive of past editions, and the switch to night and back to day.',
    load: () => import('./everything-tech').then((m) => m.motion),
  },
  classify: {
    label:
      'Replay of classify on a support-ticket spreadsheet: the file is dropped in, each of seven rows gets a category, a decision and who decided it, one unsure row at 47% confidence asks a person, and the same file comes back with the new columns.',
    load: () => import('./classify').then((m) => m.motion),
  },
} satisfies Partial<Record<BuildSlug, MotionEntry>>

/** Looked up by a build's slug. The set above is checked against the real slugs. */
export const motions: Readonly<Partial<Record<string, MotionEntry>>> = entries
