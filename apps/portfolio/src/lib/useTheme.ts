import { useSyncExternalStore } from 'react'
import { site } from '../config/site'
import type { ThemeName } from '../config/types'

/**
 * The theme lives on <html data-theme>; an inline script in each HTML file restores it before first paint.
 * One store, so every toggle on the page (header and footer) shows the same state.
 */
const listeners = new Set<() => void>()

function read(): ThemeName {
  const current = document.documentElement.dataset.theme
  return current === 'dark' || current === 'light' ? current : site.theme.default
}

function setTheme(next: ThemeName): void {
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(site.theme.storageKey, next)
  } catch {
    // Storage can be blocked. The theme still changes for this visit.
  }
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Another tab, or Back and Forward, can change the saved theme under this page.
function sync(): void {
  try {
    const saved = localStorage.getItem(site.theme.storageKey)
    if ((saved === 'dark' || saved === 'light') && saved !== read()) {
      document.documentElement.dataset.theme = saved
      for (const listener of listeners) listener()
    }
  } catch {
    // Nothing saved to follow.
  }
}
window.addEventListener('pageshow', sync)
window.addEventListener('storage', (event) => {
  if (event.key === site.theme.storageKey) sync()
})

export function useTheme(): readonly [theme: ThemeName, toggle: () => void] {
  const theme = useSyncExternalStore(subscribe, read, () => site.theme.default)
  return [theme, () => setTheme(read() === 'dark' ? 'light' : 'dark')]
}
