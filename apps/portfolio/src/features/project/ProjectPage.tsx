import { site } from '../../config/site'
import type { HeroLightConfig } from '../../config/types'
import { builds } from '../../content/builds'
import type { Build, BuildLinkKind } from '../../content/types'
import { Header } from '../../layout/Header'
import { hrefTo, hrefToBuild } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { Reveal } from '../../ui/Reveal'
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

  const live = build.links.find((link) => link.kind === 'live') ?? build.links[0]
  const sections = [
    { id: 'what', title: projectPage.sections.features, shown: true },
    { id: 'use-case', title: story.useCase?.title ?? projectPage.useCase, shown: Boolean(story.useCase) },
    { id: 'how', title: projectPage.sections.engineering, shown: Boolean(story.engineering?.length) },
    { id: 'limits', title: projectPage.sections.limits, shown: Boolean(story.limits?.length) },
  ].filter((section) => section.shown)
  const number = (id: string) => String(sections.findIndex((section) => section.id === id) + 1).padStart(2, '0')
  const heading = (id: string) => (
    <h2>
      <span className="eyebrow">{number(id)}</span>
      {sections.find((section) => section.id === id)?.title}
    </h2>
  )

  return (
    <main id="main" className="frame__main">
      {/* Title plate: who this is, in one screen-width breath. */}
      <div className="panel panel--night project-title">
        <LightBackdrop config={titleLight} light={features.heroLight} parallax={features.heroParallax} />
        <Header page="project" />
        <div className="project-title__body container">
          <ActionLink href={hrefTo('builds')} icon="arrowLeft" iconFirst>
            {projectPage.back}
          </ActionLink>
          <p className="eyebrow enter">
            {String(position + 1).padStart(2, '0')} / {String(builds.length).padStart(2, '0')} · {build.kind}
          </p>
          <h1 className="project-title__name" style={{ viewTransitionName: `build-${build.slug}` }}>
            {build.title}
          </h1>
          <p className="project-title__summary enter" style={{ '--enter-index': 1 } as React.CSSProperties}>
            {build.summary}
          </p>
          {build.links.length > 0 ? (
            <ul
              className="project-title__links enter"
              style={{ '--enter-index': 2 } as React.CSSProperties}
              aria-label={projectPage.labels.links}
            >
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
            <dl className="project-facts enter" style={{ '--enter-index': 3 } as React.CSSProperties}>
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

      {/* The story: the build in motion, then a rail of particulars beside the reading column. */}
      <div className="panel project-story">
        <div className="container">
          {features.projectMedia ? (
            <Reveal>
              <figure className="project-stage">
                <div className="project-stage__bar" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  {live ? <p>{new URL(live.href).host + new URL(live.href).pathname.replace(/\/$/, '')}</p> : null}
                </div>
                <div className="project-stage__screen">
                  {build.media?.kind === 'video' ? (
                    <video src={build.media.src} aria-label={build.media.alt} autoPlay muted loop playsInline />
                  ) : build.media ? (
                    <img src={build.media.src} alt={build.media.alt} loading="lazy" decoding="async" />
                  ) : (
                    <p className="eyebrow">{projectPage.mediaPending}</p>
                  )}
                </div>
              </figure>
            </Reveal>
          ) : null}

          <div className="project-story__grid">
            <aside className="project-rail">
              <nav className="project-rail__nav" aria-label="On this page">
                <a href="#overview">{projectPage.overview}</a>
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    {section.title}
                  </a>
                ))}
              </nav>
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
                    <ul className="build-stack">
                      {build.stack.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </aside>

            <article className="project-body">
              <p className="project-body__overview" id="overview">
                {story.overview}
              </p>

              <Reveal>
                <section className="project-section" id="what">
                  {heading('what')}
                  <ol className="project-tiles">
                    {story.features.map((item, index) => (
                      <li key={item}>
                        <span className="eyebrow">{String(index + 1).padStart(2, '0')}</span>
                        <p>{item}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              </Reveal>

              {story.useCase ? (
                <Reveal>
                  <section className="project-section" id="use-case">
                    {heading('use-case')}
                    <div className="project-prose">
                      {story.useCase.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </section>
                </Reveal>
              ) : null}

              {story.engineering?.length ? (
                <Reveal>
                  <section className="project-section" id="how">
                    {heading('how')}
                    <ul className="project-notes">
                      {story.engineering.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
              ) : null}

              {story.limits?.length ? (
                <Reveal>
                  <section className="project-section" id="limits">
                    {heading('limits')}
                    <ul className="project-limits">
                      {story.limits.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </section>
                </Reveal>
              ) : null}
            </article>
          </div>
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
