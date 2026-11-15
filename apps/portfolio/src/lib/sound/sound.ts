import { site } from '../../config/site'
import type { Voice } from './engine'

/**
 * Whether sound is on, shared by the toggle and every listener. The engine itself is loaded
 * only the first time sound is turned on, so visitors who never do pay nothing for it.
 */
type Engine = typeof import('./engine')

let engine: Engine | undefined
let on = read()
const listeners = new Set<() => void>()

function read(): boolean {
  try {
    const saved = localStorage.getItem(site.sound.storageKey)
    return saved === null ? site.sound.defaultOn : saved === 'on'
  } catch {
    return site.sound.defaultOn
  }
}

async function load(): Promise<Engine> {
  engine ??= await import('./engine')
  return engine
}

export const soundState = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  get: () => on,
}

/** Turns sound on or off. Call from a user's click so the browser allows the audio to start. */
export async function setSound(next: boolean): Promise<void> {
  on = next
  try {
    localStorage.setItem(site.sound.storageKey, next ? 'on' : 'off')
  } catch {
    // Storage can be blocked. The choice still holds for this page.
  }
  for (const listener of listeners) listener()
  if (next) await (await load()).start(site.sound, true)
  else engine?.stop()
}

/**
 * Wakes the sound on the first interaction of a page load, for a visitor who left it on.
 * Browsers only allow audio to start from a gesture, so it can't simply start on load.
 */
export async function wake(): Promise<void> {
  if (on) await (await load()).start(site.sound, false)
}

export function play(voice: Voice, strength?: number, direction?: number): void {
  if (on) engine?.play(voice, strength, direction)
}

export function pause(hidden: boolean): void {
  if (on) engine?.pause(hidden)
}
