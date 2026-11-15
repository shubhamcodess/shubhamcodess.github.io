import { site } from '../../config/site'
import type { Voice } from './engine'

/**
 * Whether sound is on, shared by the toggle and every listener. The engine loads only for visitors
 * who have sound on, so everyone else pays nothing for it.
 *
 * The saved choice is the only truth. It is read again whenever it could have changed under this page:
 * coming back with Back or Forward (the page is restored as it was left), returning to the tab,
 * or another tab changing it.
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

function load(): Promise<Engine> {
  return engine ? Promise.resolve(engine) : import('./engine').then((loaded) => (engine = loaded))
}

/** Brings this page in line with the saved choice. */
function sync(): void {
  const saved = read()
  if (saved !== on) {
    on = saved
    for (const listener of listeners) listener()
    if (!on) engine?.stop()
  }
  // Ready ahead of the first gesture, so that gesture can start the audio in the same tick.
  if (on) void load()
}

sync()
window.addEventListener('pageshow', sync)
window.addEventListener('focus', sync)
window.addEventListener('storage', (event) => {
  if (event.key === site.sound.storageKey) sync()
})

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
  if (!next) return engine?.stop()
  const loaded = await load()
  await loaded.start(site.sound)
  loaded.play('tap')
}

/**
 * Starts the sound on a gesture, for a visitor who has it on. Browsers allow audio to start only from a
 * click, tap or key press, on every page and after every return. Safe to call on every gesture.
 */
export function wake(): void {
  if (!on) return
  if (engine) void engine.start(site.sound)
  else void load().then((loaded) => loaded.start(site.sound))
}

export function play(voice: Voice, strength?: number, direction?: number): void {
  if (on) engine?.play(voice, strength, direction)
}

export function pause(hidden: boolean): void {
  if (on) engine?.pause(hidden)
}
