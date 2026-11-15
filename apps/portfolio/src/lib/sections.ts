import { useEffect, useSyncExternalStore } from 'react'

/**
 * Which home section the visitor is reading, kept in the address bar as #id and shared with the header.
 * The top of the page has no section, and no hash.
 */
let current = ''
const listeners = new Set<() => void>()

/** A section counts as being read once its top passes this far down the viewport. */
const readingLine = 0.4

function set(next: string): void {
  if (next === current) return
  current = next
  const { pathname, search } = window.location
  history.replaceState(history.state, '', `${pathname}${search}${next ? `#${next}` : ''}`)
  for (const listener of listeners) listener()
}

export function useCurrentSection(): string {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    () => current,
    () => '',
  )
}

/**
 * Follows the sections of `main` that carry an id. Also lands on the section named in the address
 * when the page opens: the content is drawn after load, so the browser's own jump would find nothing.
 */
export function useSectionTracking(): void {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('#main > [id]'))
    const target = decodeURIComponent(window.location.hash.slice(1))
    const landing = target ? document.getElementById(target) : null
    if (landing) landing.scrollIntoView({ behavior: 'instant', block: 'start' })

    let frame = 0
    const update = () => {
      frame = 0
      const line = window.innerHeight * readingLine
      const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      let reading = ''
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) reading = section.id
      }
      set(atEnd && sections.length ? (sections.at(-1)?.id ?? reading) : reading)
    }
    const schedule = () => {
      frame ||= requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])
}
