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
 * The posts on either side of one, in date order: previous is the one written before it, next the one after,
 * wrapping round at the ends so every post has both while there are at least two.
 */
export function neighbours(slug: string): { readonly previous?: WritingMeta | undefined; readonly next?: WritingMeta | undefined } {
  const index = posts.findIndex((post) => post.slug === slug)
  if (index < 0 || posts.length < 2) return {}
  return { previous: posts[(index + 1) % posts.length], next: posts[(index - 1 + posts.length) % posts.length] }
}
