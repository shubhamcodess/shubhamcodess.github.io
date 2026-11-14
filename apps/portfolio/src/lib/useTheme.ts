import { useCallback, useEffect, useState } from 'react'
import { site } from '../config/site'
import type { ThemeName } from '../config/types'

function readTheme(): ThemeName {
  const current = document.documentElement.dataset.theme
  return current === 'dark' || current === 'light' ? current : site.theme.default
}

/** The theme lives on <html data-theme>. An inline script in each HTML file restores it before first paint. */
export function useTheme(): readonly [theme: ThemeName, toggle: () => void] {
  const [theme, setTheme] = useState<ThemeName>(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: ThemeName = current === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(site.theme.storageKey, next)
      } catch {
        // Storage can be blocked. The theme still changes for this visit.
      }
      return next
    })
  }, [])

  return [theme, toggle]
}
