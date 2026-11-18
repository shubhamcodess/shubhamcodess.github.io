import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { site } from '../config/site'
import type { RouteId } from '../config/types'
import { hrefTo, sitePages } from '../lib/routes'
import { Icon } from '../ui/Icon'
import { LogoMark } from '../ui/LogoMark'
import { Toggles } from './Toggles'
import './dock.css'

interface DockProps {
  /** The page this is, to name it on the dock and mark it in the list. Undefined on pages outside the index (404). */
  readonly current?: RouteId | undefined
}

/** A mouse moving in this strip at the foot of the screen, this close to the middle, keeps the dock up. */
const reach = { fromBottom: 160, fromMiddle: 260 }

/**
 * A small pill floating at the foot of the screen, over the page (nothing shifts under it). It rises while the
 * visitor scrolls, once the header is out of view, and settles away soon after they stop; it stays while it is
 * open, hovered, focused or a mouse is heading for it. It holds the logo (home) and the name of the page you're
 * on; that name opens every page of the site, with the sound and theme switches. Where the header or the
 * contact section and footer are in view, those already hold every link, so the dock stays away.
 */
export function Dock({ current }: DockProps) {
  const copy = site.dock
  const pages = sitePages()
  const here = pages.find((page) => page.id === current)
  const sheetId = useId()

  const root = useRef<HTMLElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const timer = useRef(0)

  const [up, setUp] = useState(false)
  const [open, setOpen] = useState(false)
  const [tone, setTone] = useState<'paper' | 'night'>('paper')

  // Whether something keeps it up: the list is open, a mouse is over it, or focus is inside it.
  const held = useCallback(() => {
    const element = root.current
    return !!element && (element.dataset.open === 'true' || element.matches(':hover') || element.contains(document.activeElement))
  }, [])

  const settle = useCallback(() => {
    window.clearTimeout(timer.current)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wait = reduced ? copy.lingerMs + 600 : copy.lingerMs
    const check = () => {
      if (held()) timer.current = window.setTimeout(check, wait)
      else setUp(false)
    }
    timer.current = window.setTimeout(check, wait)
  }, [copy.lingerMs, held])

  // The tone of what's under the bar: night over the hero and other night panels, the page's paper elsewhere.
  const readTone = useCallback(() => {
    const rect = bar.current?.getBoundingClientRect()
    if (!rect) return
    const under = document
      .elementsFromPoint(window.innerWidth / 2, rect.top + rect.height / 2)
      .find((element) => !root.current?.contains(element))
    setTone(under?.closest('.panel--night, .site-footer') ? 'night' : 'paper')
  }, [])

  useEffect(() => {
    // The header, the contact section and the footer already hold every link.
    const linksInView = () => {
      const header = document.querySelector('.site-header')
      if (header && header.getBoundingClientRect().bottom > 0) return true
      return [document.getElementById(site.contact.id), document.querySelector('.site-footer')].some(
        (element) => !!element && element.getBoundingClientRect().top < window.innerHeight - 80,
      )
    }

    let frame = 0
    const update = () => {
      frame = 0
      if (linksInView()) {
        if (root.current?.dataset.open !== 'true') setUp(false)
        return
      }
      readTone()
      setUp(true)
      settle()
    }
    const onScroll = () => {
      frame ||= requestAnimationFrame(update)
    }
    // A mouse heading for the dock keeps it up long enough to reach it.
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || root.current?.dataset.state !== 'up') return
      const near =
        event.clientY > window.innerHeight - reach.fromBottom &&
        Math.abs(event.clientX - window.innerWidth / 2) < reach.fromMiddle
      if (near) settle()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer.current)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onPointer)
    }
  }, [readTone, settle])

  // While open: Escape closes and returns focus to the button, a press outside closes, and the current page takes focus.
  useEffect(() => {
    if (!open) return
    sheet.current?.querySelector<HTMLElement>('[aria-current]')?.focus({ preventScroll: true })
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus({ preventScroll: true })
    }
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
      settle()
    }
  }, [open, settle])

  return (
    <nav
      ref={root}
      className="dock"
      aria-label={copy.label}
      data-state={up || open ? 'up' : 'away'}
      data-open={open}
      data-tone={tone}
      onFocus={() => setUp(true)}
      onBlur={settle}
      onPointerLeave={settle}
    >
      <div ref={sheet} className="dock__sheet" id={sheetId} role="region" aria-label={copy.sheetLabel} hidden={!open}>
        <ul className="dock__list">
          {pages.map((page) => (
            <li key={page.id}>
              <a
                className="dock__link"
                href={page.href}
                onClick={() => setOpen(false)}
                {...(page.id === current ? { 'aria-current': 'page' as const } : {})}
              >
                <span>{page.label}</span>
                <Icon name="arrowRight" size={14} />
              </a>
            </li>
          ))}
        </ul>
        <div className="dock__switches">
          <Toggles />
        </div>
      </div>
      <div ref={bar} className="dock__bar">
        <a className="dock__home" href={hrefTo('home')} aria-label={`${site.owner}, home`}>
          <LogoMark />
        </a>
        <span className="dock__rule" aria-hidden="true" />
        <button
          ref={button}
          className="dock__open"
          type="button"
          aria-expanded={open}
          aria-controls={sheetId}
          onClick={() => {
            readTone()
            setOpen((value) => !value)
          }}
        >
          <span>{here?.label ?? copy.label}</span>
          <span className="visually-hidden">, {copy.openHint}</span>
          <svg className="dock__glyph" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
            <circle cx="3" cy="3" r="1.25" />
            <circle cx="9" cy="3" r="1.25" />
            <circle cx="3" cy="9" r="1.25" />
            <circle cx="9" cy="9" r="1.25" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
