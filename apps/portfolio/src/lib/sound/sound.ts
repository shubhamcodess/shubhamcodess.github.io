import { site } from '../../config/site'
import type { Voice } from './engine'

/**
 * Whether sound is on, shared by the toggle and every listener. The engine loads only for visitors
 * who have sound on (or turn it on), so everyone else pays nothing for it.
 */
type Engine = typeof import('./engine')

let engine: Engine | undefined
let on = read()
let galaxyPlayed = false
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

// A visitor who left sound on gets the engine straight away, so the first gesture on this page can start
// it in the same tick. Browsers refuse audio that starts later than the gesture.
if (on) void load()

export const soundState = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  get: () => on,
}

/** The galaxy belongs to the home page's first screen, where the light is, and plays once per page. */
function galaxy(loaded: Engine): void {
  const home = document.getElementById('root')?.dataset.route === 'home'
  if (galaxyPlayed || !site.sound.galaxy.onHome || !home || window.scrollY > window.innerHeight / 2) return
  galaxyPlayed = true
  loaded.play('galaxy')
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
  galaxy(loaded)
}

/**
 * Starts the sound on any gesture, for a visitor who left it on. Safe to call on every gesture:
 * it only resumes audio that isn't running yet.
 */
export function wake(): void {
  if (!on) return
  if (!engine) {
    void load()
    return
  }
  const loaded = engine
  void loaded.start(site.sound).then(() => {
    if (performance.now() < site.sound.galaxy.withinMs) galaxy(loaded)
  })
}

export function play(voice: Voice, strength?: number, direction?: number): void {
  if (on) engine?.play(voice, strength, direction)
}

export function pause(hidden: boolean): void {
  if (on) engine?.pause(hidden)
}
