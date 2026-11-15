import { site } from '../config/site'
import type { Build } from '../content/types'
import { BuildsPage } from '../features/builds/BuildsPage'
import { FeaturedSection } from '../features/builds/FeaturedSection'
import { ContactSection } from '../features/contact/ContactSection'
import { CredentialsPage } from '../features/credentials/CredentialsPage'
import { ExperiencePage } from '../features/experience/ExperiencePage'
import { ExperienceTeaser } from '../features/experience/ExperienceTeaser'
import { Hero } from '../features/hero/Hero'
import { ProjectPage } from '../features/project/ProjectPage'
import { Footer } from '../layout/Footer'
import { Header } from '../layout/Header'
import { ScrollLight } from '../layout/ScrollLight'
import { SoundDesign } from '../layout/SoundDesign'
import { LinkPreview } from '../ui/LinkPreview'
import { useSectionTracking } from '../lib/sections'

function HomePage() {
  useSectionTracking()
  return (
    <main id="main" className="frame__main">
      <div className="panel panel--night">
        <Header page="home" />
        <Hero />
      </div>
      {site.features.featured ? <FeaturedSection /> : null}
      {site.features.experience ? <ExperienceTeaser /> : null}
      {site.features.contact ? <ContactSection /> : null}
    </main>
  )
}

/** What a page load resolves to. A project page carries the build it is for. */
export type Page = { readonly id: 'home' | 'builds' | 'experience' | 'credentials' } | { readonly id: 'project'; readonly build: Build }

function render(page: Page) {
  switch (page.id) {
    case 'home':
      return <HomePage />
    case 'builds':
      return <BuildsPage />
    case 'experience':
      return <ExperiencePage />
    case 'credentials':
      return <CredentialsPage />
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
      {site.features.linkPreviews ? <LinkPreview /> : null}
      {site.features.sound ? <SoundDesign /> : null}
    </div>
  )
}
