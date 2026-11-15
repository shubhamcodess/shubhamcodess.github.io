/**
 * The /me page: life away from work. Only what the owner has said goes here; every optional field
 * stays out until they supply it, and the page shows nothing in its place.
 *
 * `art` is a path under /public: an SVG drawing, an image, or a looping video (.mp4 or .webm),
 * for example "me/bike.svg". `line` is one or two sentences in the owner's words.
 */

/** How a tile is framed, a nod to what it holds. */
export type PursuitFrame = 'sheet' | 'print' | 'film'

/** How much of the grid a tile takes on wide screens. */
export type PursuitSize = 'wide' | 'tall' | 'square'

export interface Pursuit {
  readonly id: string
  readonly title: string
  readonly frame: PursuitFrame
  readonly size: PursuitSize
  readonly line?: string
  readonly art?: string
  /** Short facts shown as a list of mono label and value, such as the bike's make. */
  readonly details?: readonly { readonly label: string; readonly value: string }[]
}

export interface Home {
  readonly city: string
  readonly region: string
  readonly line?: string
  /** A map drawing, as a path under /public. */
  readonly art?: string
}

export const pursuits: readonly Pursuit[] = [
  { id: 'biking', title: 'Biking', frame: 'sheet', size: 'wide' },
  { id: 'photography', title: 'Photography', frame: 'print', size: 'tall' },
  { id: 'filmmaking', title: 'Filmmaking', frame: 'film', size: 'tall' },
]

export const home: Home = { city: 'Bengaluru', region: 'Karnataka, India' }
