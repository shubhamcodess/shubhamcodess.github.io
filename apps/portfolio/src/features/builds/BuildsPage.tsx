import { useState } from 'react'
import { site } from '../../config/site'
import { builds } from '../../content/builds'
import type { BuildKind } from '../../content/types'
import { Header } from '../../layout/Header'
import { BuildCard } from './BuildCard'

type Filter = BuildKind | 'all'

export function BuildsPage() {
  const { buildsPage, kinds, features } = site
  const [filter, setFilter] = useState<Filter>('all')
  const shown = filter === 'all' ? builds : builds.filter((build) => build.kind === filter)
  const options: readonly { readonly id: Filter; readonly label: string; readonly count: number }[] = [
    { id: 'all', label: buildsPage.allLabel, count: builds.length },
    ...kinds.map((kind) => ({ id: kind, label: kind, count: builds.filter((build) => build.kind === kind).length })),
  ]

  return (
    <div className="panel panel--grow">
      <Header current="builds" />
      <main id="main" className="section container">
        <header className="section__header">
          <div>
            <h1 className="section__title">{buildsPage.title}</h1>
            <p className="section__lead">{buildsPage.lead}</p>
          </div>
        </header>
        {features.buildsFilter ? (
          <div className="build-filter" role="group" aria-label="Filter by kind">
            {options
              .filter((option) => option.count > 0)
              .map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="build-filter__chip"
                  data-sound="chime"
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label} <span>{String(option.count).padStart(2, '0')}</span>
                </button>
              ))}
          </div>
        ) : null}
        <ul key={filter} className="build-grid build-grid--compact" aria-live="polite">
          {shown.map((build, index) => (
            <li key={build.slug} className="enter" style={{ '--enter-index': Math.min(index, 8) } as React.CSSProperties}>
              <BuildCard build={build} position={index + 1} variant="compact" headingLevel={2} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
