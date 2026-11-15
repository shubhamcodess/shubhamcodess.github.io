import base from './base.css?inline'

/** One build's motion graphic: a replay of the real thing, brought over from the build's own site. */
export interface Motion {
  /** The replay's own styles. They live in a shadow root, so they never reach the rest of the page. */
  readonly css: string
  /**
   * Builds the replay inside `root`, which has a fixed height the replay fills exactly, and starts it.
   * With reduced motion it shows its last frame, still.
   */
  mount(root: HTMLElement): MotionControls
}

/** What the stage's own Pause and Replay buttons drive. */
export interface MotionControls {
  /** True when the replay is a still frame (reduced motion): there is nothing to pause or replay. */
  readonly still: boolean
  setPaused(paused: boolean): void
  replay(): void
  /** Stops the replay and lets it go. */
  stop(): void
}

/** A pausable wait. Rejects once the run it belongs to has been replaced, which ends that run. */
export function makeClock(isPlaying: () => boolean) {
  let run = 0
  return {
    /** Starts a new run and returns its number. Any older run stops at its next wait. */
    next: () => ++run,
    stop: () => {
      run++
    },
    current: () => run,
    sleep: async (ms: number, me: number) => {
      let left = ms
      while (left > 0) {
        if (me !== run) throw new Error('replaced')
        await new Promise((resolve) => setTimeout(resolve, 40))
        if (isPlaying()) left -= 40
      }
      if (me !== run) throw new Error('replaced')
    },
  }
}

export const prefersStill = () => matchMedia('(prefers-reduced-motion: reduce)').matches

export const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (c) => (c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;'))

/** The element that must exist inside a replay's own markup. */
export function part<T extends HTMLElement = HTMLElement>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector)
  if (!element) throw new Error(`motion: missing ${selector}`)
  return element
}

/**
 * The replay's styles: the shared base, its site's own rules, then how it fills the stage (`fit`), and last the
 * site's two typefaces.
 */
export const styles = (own: string, fit: string) =>
  `${base}\n${own}\n${fit}\n:host{--sans:var(--font-sans);--mono:var(--font-mono)}`
