import { useSyncExternalStore } from 'react'
import { site } from '../config/site'
import { setSound, soundState } from '../lib/sound/sound'
import { useTheme } from '../lib/useTheme'
import { Icon } from '../ui/Icon'
import './toggles.css'

/** The sound and theme switches. The header and the footer both carry them, and they always agree. */
export function Toggles() {
  const { features, sound: copy, theme: themeCopy } = site
  const [theme, toggleTheme] = useTheme()
  const sound = useSyncExternalStore(soundState.subscribe, soundState.get, () => false)

  return (
    <>
      {features.sound ? (
        <button
          className="icon-toggle icon-toggle--sound"
          type="button"
          onClick={() => void setSound(!sound)}
          aria-pressed={sound}
          aria-label={copy.label}
          data-sound={sound ? undefined : 'none'}
        >
          <span key={String(sound)} className="icon-toggle__turn">
            <Icon name={sound ? 'soundOn' : 'soundOff'} size={18} />
          </span>
        </button>
      ) : null}
      {features.themeToggle ? (
        <button className="icon-toggle" type="button" onClick={toggleTheme} aria-pressed={theme === 'dark'} aria-label={themeCopy.label}>
          <span key={theme} className="icon-toggle__turn">
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </span>
        </button>
      ) : null}
    </>
  )
}
