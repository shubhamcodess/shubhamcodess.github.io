import { site } from '../config/site'
import type { RouteId } from '../config/types'
import { hrefTo } from '../lib/routes'
import { useTheme } from '../lib/useTheme'
import { Icon } from '../ui/Icon'
import './header.css'

interface HeaderProps {
  readonly current: RouteId
}

export function Header({ current }: HeaderProps) {
  const [theme, toggleTheme] = useTheme()
  const links = site.nav.filter((id) => id !== 'builds' || site.features.buildsPage)

  return (
    <header className="site-header container">
      <a className="site-header__logo" href={hrefTo('home')} aria-label={`${site.owner}, home`}>
        {site.monogram}
      </a>
      <nav className="site-header__nav" aria-label="Main">
        {links.map((id) => (
          <a key={id} className="site-header__link" href={hrefTo(id)} {...(id === current ? { 'aria-current': 'page' } : {})}>
            {site.routes[id].label}
          </a>
        ))}
        {site.features.themeToggle ? (
          <button
            className="site-header__theme"
            type="button"
            onClick={toggleTheme}
            aria-pressed={theme === 'dark'}
            aria-label="Dark theme"
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        ) : null}
      </nav>
    </header>
  )
}
