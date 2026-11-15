import type { ReactNode } from 'react'
import { site } from '../config/site'
import { Footer } from '../layout/Footer'
import { ScrollLight } from '../layout/ScrollLight'
import { SoundDesign } from '../layout/SoundDesign'
import { LinkPreview } from '../ui/LinkPreview'
import { ChalkTrail } from '../ui/ChalkTrail'
import { TiltLayer } from '../ui/Tilt'

interface AppProps {
  /** The page itself, already loaded. See `pages.tsx`. */
  readonly children: ReactNode
}

/** The frame every page shares: skip link, the page, the footer, and the site-wide layers. */
export function App({ children }: AppProps) {
  return (
    <div className="frame">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {children}
      {site.features.footer ? <Footer /> : null}
      {site.features.scrollLight ? <ScrollLight /> : null}
      {site.features.tilt ? <TiltLayer /> : null}
      {site.features.chalkTrail ? <ChalkTrail /> : null}
      {site.features.linkPreviews ? <LinkPreview /> : null}
      {site.features.sound ? <SoundDesign /> : null}
    </div>
  )
}
