import { site } from '../../config/site'
import { getBuild } from '../../content/builds'
import { hrefTo } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { Reveal } from '../../ui/Reveal'
import { BuildCard } from './BuildCard'

export function FeaturedSection() {
  const { featured, features } = site
  const headingId = `${featured.id}-title`

  return (
    <section className="panel section" id={featured.id} aria-labelledby={headingId}>
      <div className="container">
        <Reveal>
          <header className="section__header">
            <div>
              <h2 className="section__title" id={headingId}>
                {featured.title}
              </h2>
              <p className="section__lead">{featured.lead}</p>
            </div>
            {features.buildsPage ? (
              <ActionLink href={hrefTo('builds')} icon="arrowRight">
                {featured.seeAll}
              </ActionLink>
            ) : null}
          </header>
        </Reveal>
        <ul className="build-grid build-grid--feature" data-count={featured.slugs.length}>
          {featured.slugs.map((slug, index) => (
            <li key={slug}>
              <Reveal className="reveal-fill" index={index}>
                <BuildCard build={getBuild(slug)} variant="feature" headingLevel={3} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
