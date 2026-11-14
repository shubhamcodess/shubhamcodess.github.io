import { site } from '../config/site'
import type { RouteId } from '../config/types'
import { BuildsPage } from '../features/builds/BuildsPage'
import { FeaturedSection } from '../features/builds/FeaturedSection'
import { Hero } from '../features/hero/Hero'
import { Footer } from '../layout/Footer'
import { Header } from '../layout/Header'

function HomePage() {
  return (
    <main id="main" className="frame__main">
      <div className="panel panel--night">
        <Header current="home" />
        <Hero />
      </div>
      {site.features.featured ? <FeaturedSection /> : null}
    </main>
  )
}

const pages = {
  home: HomePage,
  builds: BuildsPage,
} as const satisfies Record<RouteId, () => React.JSX.Element>

interface AppProps {
  readonly route: RouteId
}

export function App({ route }: AppProps) {
  const Page = pages[route]
  return (
    <div className="frame">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Page />
      {site.features.footer ? <Footer /> : null}
    </div>
  )
}
