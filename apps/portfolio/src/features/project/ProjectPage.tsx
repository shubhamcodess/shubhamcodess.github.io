import { site } from '../../config/site'
import type { HeroLightConfig } from '../../config/types'
import { builds } from '../../content/builds'
import type { Build, BuildLinkKind } from '../../content/types'
import { Header } from '../../layout/Header'
import { hrefTo, hrefToBuild } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { LightBackdrop } from '../../ui/light/LightBackdrop'
import './project.css'

const linkLabels = {
  code: 'Source code',
  live: 'Open it live',
  package: 'npm package',
  download: 'Download',
} as const satisfies Record<BuildLinkKind, string>

/** The same light as the hero, turned down. Made once, so the scene never restarts on render. */
const titleLight: HeroLightConfig = { ...site.hero.light, intensity: site.projectPage.lightIntensity }

interface ProjectPageProps {
  readonly build: Build
}

export function ProjectPage({ build }: ProjectPageProps) {
  const { projectPage, features } = site
  const { story } = build
  const position = builds.findIndex((candidate) => candidate.slug === build.slug)
  const previous = builds[(position - 1 + builds.length) % builds.length]
  const next = builds[(position + 1) % builds.length]

  const sections = [
    { title: projectPage.sections.features, items: story.features },
    { title: projectPage.sections.engineering, items: story.engineering ?? [] },
    { title: projectPage.sections.limits, items: story.limits ?? [] },
  ].filter((section) => section.items.length > 0)

  return (
    <main id="main" className="frame__main">
      {/* Title plate: who this is, in one screen-width breath. */}
      <div className="panel panel--night project-title">
        <LightBackdrop config={titleLight} light={features.heroLight} parallax={features.heroParallax} />
        <Header current="builds" />
        <div className="project-title__body container">
          <ActionLink href={hrefTo('builds')} icon="arrowLeft" iconFirst>
            {projectPage.back}
          </ActionLink>
          <p className="eyebrow">
            {String(position + 1).padStart(2, '0')} / {String(builds.length).padStart(2, '0')} · {build.kind}
          </p>
          <h1 className="project-title__name">{build.title}</h1>
          <p className="project-title__summary">{build.summary}</p>
          {build.links.length > 0 ? (
            <ul className="project-title__links" aria-label={projectPage.labels.links}>
              {build.links.map((link) => (
                <li key={link.href}>
                  <ActionLink href={link.href} variant="glass" external>
                    {linkLabels[link.kind]}
                  </ActionLink>
                </li>
              ))}
            </ul>
          ) : null}
          {story.facts ? (
            <dl className="project-facts">
              {story.facts.map((fact) => (
                <div key={fact.label} className="project-facts__item">
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>

      {/* The story: a quiet rail of particulars beside the reading column. */}
      <div className="panel project-story">
        <div className="project-story__grid container">
          <aside className="project-rail" aria-label="Details">
            <dl>
              <div>
                <dt>{projectPage.labels.kind}</dt>
                <dd>{build.kind}</dd>
              </div>
              <div>
                <dt>{projectPage.labels.year}</dt>
                <dd>{build.year}</dd>
              </div>
              <div>
                <dt>{projectPage.labels.stack}</dt>
                <dd>
                  <ul>
                    {build.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </aside>
          <article className="project-body">
            <p className="project-body__overview">{story.overview}</p>
            {sections.map((section, index) => (
              <section key={section.title} className="project-section">
                <h2>
                  <span className="eyebrow">{String(index + 1).padStart(2, '0')}</span>
                  {section.title}
                </h2>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </article>
        </div>
      </div>

      {/* Onward: the index reads like a reel, so a project always leads to another. */}
      {previous && next ? (
        <nav className="project-onward" aria-label="More builds">
          <a className="panel project-onward__link" href={hrefToBuild(previous.slug)}>
            <span className="eyebrow">{projectPage.previous}</span>
            <span className="project-onward__name">{previous.title}</span>
          </a>
          <a className="panel project-onward__link project-onward__link--next" href={hrefToBuild(next.slug)}>
            <span className="eyebrow">{projectPage.next}</span>
            <span className="project-onward__name">{next.title}</span>
          </a>
        </nav>
      ) : null}
    </main>
  )
}
