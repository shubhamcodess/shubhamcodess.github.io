import { site } from '../config/site'
import type { RouteId } from '../config/types'
import { hrefTo } from '../lib/routes'
import { setSound, soundState } from '../lib/sound/sound'
import { useTheme } from '../lib/useTheme'
import { useSyncExternalStore } from 'react'
import { Icon } from '../ui/Icon'
import './header.css'

interface HeaderProps {
  /** The page this header is on, so its link can be marked. */
  readonly current: RouteId
}

export function Header({ current }: HeaderProps) {
  const [theme, toggleTheme] = useTheme()
  const sound = useSyncExternalStore(soundState.subscribe, soundState.get, () => false)
  const { features } = site
  const enabled: Readonly<Record<string, boolean>> = {
    builds: features.buildsPage,
    experience: features.experience,
    credentials: features.credentials,
    '#contact': features.contact,
    '#featured': features.featured,
  }
  const links = site.nav.filter((item) => enabled[item.to] ?? true)

  return (
    <header className="site-header container">
      <a className="site-header__logo" href={hrefTo('home')} aria-label={`${site.owner}, home`}>
        {site.monogram}
      </a>
      <nav className="site-header__nav" aria-label="Main">
        {links.map((item) => (
          <a
            key={item.to}
            className="site-header__link"
            href={hrefTo(item.to)}
            {...(item.to === current ? { 'aria-current': 'page' } : {})}
          >
            {item.label}
          </a>
        ))}
        {features.sound ? (
          <button
            className="site-header__theme site-header__sound"
            type="button"
            onClick={() => void setSound(!sound)}
            aria-pressed={sound}
            aria-label={site.sound.label}
            data-sound={sound ? 'close' : 'none'}
          >
            <span key={String(sound)} className="site-header__turn">
              <Icon name={sound ? 'soundOn' : 'soundOff'} size={18} />
            </span>
          </button>
        ) : null}
        {site.features.themeToggle ? (
          <button
            className="site-header__theme"
            type="button"
            onClick={toggleTheme}
            data-sound="chime"
            aria-pressed={theme === 'dark'}
            aria-label="Dark theme"
          >
            <span key={theme} className="site-header__turn">
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </span>
          </button>
        ) : null}
      </nav>
    </header>
  )
}
