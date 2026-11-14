import { site } from '../../config/site'
import { builds } from '../../content/builds'
import { Header } from '../../layout/Header'
import { BuildCard } from './BuildCard'

export function BuildsPage() {
  const { buildsPage } = site

  return (
    <div className="panel panel--grow">
      <Header current="builds" />
      <main id="main" className="section container">
        <header className="section__header">
          <div>
            <h1 className="section__title">{buildsPage.title}</h1>
            <p className="section__lead">{buildsPage.lead}</p>
          </div>
          <p className="eyebrow">{String(builds.length).padStart(2, '0')} builds</p>
        </header>
        <ul className="build-grid build-grid--compact">
          {builds.map((build, index) => (
            <li key={build.slug}>
              <BuildCard build={build} position={index + 1} variant="compact" headingLevel={2} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
