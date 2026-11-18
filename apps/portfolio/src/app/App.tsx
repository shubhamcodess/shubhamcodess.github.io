import type { ReactNode } from 'react'
import { site } from '../config/site'
import type { RouteId } from '../config/types'
import { Dock } from '../layout/Dock'
import { Footer } from '../layout/Footer'
import { ScrollLight } from '../layout/ScrollLight'
import { SoundDesign } from '../layout/SoundDesign'
import { LinkPreview } from '../ui/LinkPreview'
import { ChalkTrail } from '../ui/ChalkTrail'
import { CometCursor } from '../ui/CometCursor'
import { TiltLayer } from '../ui/Tilt'

interface AppProps {
  /** The page itself, already loaded. See `pages.tsx`. */
  readonly children: ReactNode
  /** Which page of the site index this is, for the dock. Undefined outside the index (404). */
  readonly current?: RouteId | undefined
}

/** The frame every page shares: skip link, the page, the footer, the dock, and the site-wide layers. */
export function App({ children, current }: AppProps) {
  return (
    <div className="frame">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {children}
      {site.features.footer ? <Footer /> : null}
      {site.features.dock ? <Dock current={current} /> : null}
      {site.features.scrollLight ? <ScrollLight /> : null}
      {site.features.tilt ? <TiltLayer /> : null}
      {site.features.chalkTrail ? <ChalkTrail /> : null}
      {site.features.cometCursor ? <CometCursor /> : null}
      {site.features.linkPreviews ? <LinkPreview /> : null}
      {site.features.sound ? <SoundDesign /> : null}
    </div>
  )
}
