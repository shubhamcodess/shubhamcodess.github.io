import { site } from '../../config/site'
import { Header } from '../../layout/Header'
import { useSectionTracking } from '../../lib/sections'
import { FeaturedSection } from '../builds/FeaturedSection'
import { ContactSection } from '../contact/ContactSection'
import { ExperienceTeaser } from '../experience/ExperienceTeaser'
import { Hero } from '../hero/Hero'
import { ResearchSection } from '../research/ResearchSection'

export function HomePage() {
  useSectionTracking()
  return (
    <main id="main" className="frame__main">
      <div className="panel panel--night">
        <Header page="home" />
        <Hero />
      </div>
      {site.features.featured ? <FeaturedSection /> : null}
      {site.features.research ? <ResearchSection /> : null}
      {site.features.experience ? <ExperienceTeaser /> : null}
      {site.features.contact ? <ContactSection /> : null}
    </main>
  )
}
