import { site } from '../config/site'
import type { NavItem, NavPage, SiteConfig } from '../config/types'
import { LogoMark } from '../ui/LogoMark'
import { hrefTo } from '../lib/routes'
import { useCurrentSection } from '../lib/sections'
import { writingLive } from '../lib/writing'
import { Toggles } from './Toggles'
import './header.css'

interface HeaderProps {
  /** The kind of page this header is on. Its own link is left out; on home, links follow the section being read. */
  readonly page: NavPage
}

/**
 * The logo and the home page's anchors (`nav` in the config), at every width. Each page leaves out its own link,
 * so the bar holds only the other pages; on home all of them show and follow the section being read. From 600px up the sound and theme switches sit at the end of the bar;
 * on phones they are in the dock and the footer. Every other page is in the dock and the footer.
 */
export function Header({ page }: HeaderProps) {
  const { features } = site
  const section = useCurrentSection()
  const enabled: Readonly<Record<string, boolean>> = {
    builds: features.buildsPage,
    experience: features.experience,
    credentials: features.credentials,
    me: features.mePage,
    '#contact': features.contact,
    '#research': features.research,
    '#featured': features.featured,
  }
  // Once there is writing, Research (a section on home) gives way to Writing, the page it leads to.
  const nav: readonly NavItem[] = site.nav.map((item) =>
    writingLive && item.to === `#${site.research.id}` ? { ...item, label: site.routes.writing.label, to: 'writing', activeOn: [] } : item,
  )
  const links: readonly NavItem[] = nav.filter((item) => item.to !== page && (enabled[item.to] ?? true))

  // On home, a link is current while its section is the one being read.
  const current = (item: NavItem) =>
    section && item.activeOn?.includes(section) ? { 'aria-current': 'location' as const } : {}

  return (
    <header className={`site-header container${page === 'home' ? ' site-header--home' : ''}`}>
      <a className="site-header__logo" href={hrefTo('home')} aria-label={`${site.owner}, home`}>
        {(site.logo as SiteConfig['logo']) === 'mark' ? <LogoMark /> : site.monogram}
      </a>
      <nav className="site-header__nav" aria-label="Main">
        {links.map((item) => (
          <a
            key={item.to}
            className={`site-header__link${item.phone === false ? ' site-header__link--wide' : ''}`}
            href={hrefTo(item.to)}
            {...current(item)}
          >
            {item.label}
          </a>
        ))}
        <span className="site-header__switches">
          <Toggles />
        </span>
      </nav>
    </header>
  )
}
