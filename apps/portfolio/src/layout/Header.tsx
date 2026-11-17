import { useEffect, useId, useRef, useState } from 'react'
import { site } from '../config/site'
import type { NavItem, NavPage, SiteConfig } from '../config/types'
import { LogoMark } from '../ui/LogoMark'
import { hrefTo } from '../lib/routes'
import { useCurrentSection } from '../lib/sections'
import { Icon } from '../ui/Icon'
import { Toggles } from './Toggles'
import './header.css'

interface HeaderProps {
  /** The kind of page this header is on. It picks the links, from `nav` in the config. */
  readonly page: NavPage
}

export function Header({ page }: HeaderProps) {
  const { features } = site
  const section = useCurrentSection()
  const enabled: Readonly<Record<string, boolean>> = {
    builds: features.buildsPage,
    experience: features.experience,
    credentials: features.credentials,
    me: features.mePage,
    '#contact': features.contact,
    '#featured': features.featured,
  }
  const links: readonly NavItem[] = site.nav[page].filter((item) => enabled[item.to] ?? true)

  // A link is current when it is this page, or, on home, when its section is the one being read.
  const current = (item: NavItem) =>
    item.to === page
      ? { 'aria-current': 'page' as const }
      : section && item.activeOn?.includes(section)
        ? { 'aria-current': 'location' as const }
        : {}

  return (
    <header className="site-header container">
      <a className="site-header__logo" href={hrefTo('home')} aria-label={`${site.owner}, home`}>
        {(site.logo as SiteConfig['logo']) === 'mark' ? <LogoMark /> : site.monogram}
      </a>
      <nav className="site-header__nav" aria-label="Main">
        {links.map((item) => (
          <a
            key={item.to}
            className={`site-header__link${item.more ? ' site-header__link--more' : ''}`}
            href={hrefTo(item.to)}
            {...current(item)}
          >
            {item.label}
          </a>
        ))}
        <MoreMenu items={links.filter((item) => item.more)} />
        <Toggles />
      </nav>
    </header>
  )
}

/**
 * Phones only: the secondary links (`more` in the nav config) leave the bar for a small sheet under a
 * "More" button, so the bar keeps the work first and never overflows.
 * Escape, a click outside or choosing a link closes it.
 */
function MoreMenu({ items }: { readonly items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false)
  const sheetId = useId()
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  if (!items.length) return null
  return (
    <div className="more-menu" ref={root}>
      <button
        ref={button}
        type="button"
        className="site-header__link more-menu__button"
        aria-expanded={open}
        aria-controls={sheetId}
        onClick={() => setOpen((value) => !value)}
      >
        {site.navMore.label}
        <span className="more-menu__chevron" aria-hidden="true" />
      </button>
      <div className="more-menu__sheet" id={sheetId} role="region" aria-label={site.navMore.sheetLabel} hidden={!open}>
        <ul>
          {items.map((item) => (
            <li key={item.to}>
              <a className="more-menu__link" href={hrefTo(item.to)} onClick={() => setOpen(false)}>
                <span className="more-menu__label">{item.label}</span>
                <Icon name="arrowRight" size={14} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
