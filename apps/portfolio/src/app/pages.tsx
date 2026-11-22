import type { ReactElement } from 'react'
import type { Build } from '../content/types'

/** What a page load resolves to. A project page carries the build it is for. */
export type Page =
  | { readonly id: 'home' | 'builds' | 'experience' | 'credentials' | 'me' | 'writing' | 'notFound' }
  | { readonly id: 'project'; readonly build: Build }
  | { readonly id: 'post'; readonly slug: string }

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
    case 'me':
      return import('../features/me/MePage').then(({ MePage }) => <MePage />)
    case 'notFound':
      return import('../features/not-found/NotFoundPage').then(({ NotFoundPage }) => <NotFoundPage />)
    case 'project':
      return import('../features/project/ProjectPage').then(({ ProjectPage }) => <ProjectPage build={page.build} />)
    case 'writing':
      return import('../features/writing/WritingPage').then(({ WritingPage }) => <WritingPage />)
    case 'post':
      // The page's code and the post's body load side by side, so the post is drawn whole in one pass.
      return Promise.all([import('../features/writing/PostPage'), import('../lib/writing').then(({ bodies }) => bodies[page.slug]?.())]).then(
        ([{ PostPage }, body]) => <PostPage slug={page.slug} html={body?.default ?? ''} />,
      )
  }
}
