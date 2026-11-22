import * as writing from 'virtual:writing'
import { site } from '../config/site'
import type { WritingMeta } from '../content/types'

/** Every published post, newest first (their front matter, checked at build time by src/content/writing-loader.ts). */
export const posts = writing.posts as readonly WritingMeta[]
/** Each post's body, loaded only on its own page. */
export const bodies = writing.bodies

/** The Writing pages are on the site once they are switched on and there is a published post. */
export const writingLive = site.features.writing && posts.length > 0

/**
 * The posts on either side of one, in the order they were written (oldest first; on the same day, by title):
 * previous is the one before it, next the one after. No wrapping: the first post has only Next, the last only
 * Previous, and every post between has both.
 */
export function neighbours(slug: string): { readonly previous?: WritingMeta | undefined; readonly next?: WritingMeta | undefined } {
  const written = [...posts].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title))
  const index = written.findIndex((post) => post.slug === slug)
  if (index < 0) return {}
  return { previous: written[index - 1], next: written[index + 1] }
}
