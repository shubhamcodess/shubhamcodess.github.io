import { site } from '../config/site'
import type { Build } from '../content/types'
import { BuildsPage } from '../features/builds/BuildsPage'
import { FeaturedSection } from '../features/builds/FeaturedSection'
import { Hero } from '../features/hero/Hero'
import { ProjectPage } from '../features/project/ProjectPage'
import { Footer } from '../layout/Footer'
import { Header } from '../layout/Header'
import { ScrollLight } from '../layout/ScrollLight'

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

/** What a page load resolves to. A project page carries the build it is for. */
export type Page = { readonly id: 'home' } | { readonly id: 'builds' } | { readonly id: 'project'; readonly build: Build }

function render(page: Page) {
  switch (page.id) {
    case 'home':
      return <HomePage />
    case 'builds':
      return <BuildsPage />
    case 'project':
      return <ProjectPage build={page.build} />
  }
}

interface AppProps {
  readonly page: Page
}

export function App({ page }: AppProps) {
  return (
    <div className="frame">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {render(page)}
      {site.features.footer ? <Footer /> : null}
      {site.features.scrollLight ? <ScrollLight /> : null}
    </div>
  )
}
