import type { ReactElement } from 'react'
import type { Build } from '../content/types'

/** What a page load resolves to. A project page carries the build it is for. */
export type Page = { readonly id: 'home' | 'builds' | 'experience' | 'credentials' } | { readonly id: 'project'; readonly build: Build }

/**
 * Each page is its own chunk, so a visitor downloads only the page they open (plus what every page shares).
 * The loader runs before the first paint, in main.tsx, so pages still appear fully drawn.
 */
export function loadPage(page: Page): Promise<ReactElement> {
  switch (page.id) {
    case 'home':
      return import('../features/home/HomePage').then(({ HomePage }) => <HomePage />)
    case 'builds':
      return import('../features/builds/BuildsPage').then(({ BuildsPage }) => <BuildsPage />)
    case 'experience':
      return import('../features/experience/ExperiencePage').then(({ ExperiencePage }) => <ExperiencePage />)
    case 'credentials':
      return import('../features/credentials/CredentialsPage').then(({ CredentialsPage }) => <CredentialsPage />)
    case 'project':
      return import('../features/project/ProjectPage').then(({ ProjectPage }) => <ProjectPage build={page.build} />)
  }
}
