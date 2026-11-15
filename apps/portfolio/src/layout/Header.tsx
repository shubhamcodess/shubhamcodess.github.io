import { site } from '../config/site'
import type { NavItem, NavPage } from '../config/types'
import { hrefTo } from '../lib/routes'
import { useCurrentSection } from '../lib/sections'
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
  const links = site.nav[page].filter((item) => enabled[item.to] ?? true)

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
        {site.monogram}
      </a>
      <nav className="site-header__nav" aria-label="Main">
        {links.map((item) => (
          <a key={item.to} className="site-header__link" href={hrefTo(item.to)} {...current(item)}>
            {item.label}
          </a>
        ))}
        <Toggles />
      </nav>
    </header>
  )
}
