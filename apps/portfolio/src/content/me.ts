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
  /** The tile's own page, shown when it is opened: paragraphs in the owner's words. */
  readonly story?: readonly string[]
}

/** One stop on the path through places, shown when the home tile is opened. Not a link. */
export interface Place {
  /** What the place was to the owner, such as "Home". */
  readonly role: string
  readonly city: string
  readonly region: string
  /** A sentence or two in the owner's words. */
  readonly line?: string
  /** Pictures under /public, such as "me/places/jamshedpur-1.jpg", each with what it shows. */
  readonly photos?: readonly { readonly src: string; readonly alt: string }[]
}

export interface Home {
  /** Its address on the page, /me/#<id>. */
  readonly id: string
  /** The small label above the city, such as "Work". */
  readonly label: string
  readonly city: string
  readonly region: string
  readonly line?: string
  /** A drawing, as a path under /public. Leave out when `map` draws the place instead. */
  readonly art?: string
  /** A fine-line map drawn behind the city, with a marker on it. */
  readonly map?: 'karnataka'
  /** The tile's own page, shown when it is opened. */
  readonly story?: readonly string[]
  /** The places lived in, oldest first, shown as a path when the tile is opened. The last is now. */
  readonly places?: readonly Place[]
}

export const pursuits: readonly Pursuit[] = [
  { id: 'biking', title: 'Biking', frame: 'sheet', size: 'wide' },
  { id: 'photography', title: 'Photography', frame: 'print', size: 'tall' },
  { id: 'filmmaking', title: 'Filmmaking', frame: 'film', size: 'tall' },
]

export const home: Home = {
  id: 'work',
  label: 'Work',
  city: 'Bengaluru',
  region: 'Karnataka, India',
  map: 'karnataka',
  places: [
    { role: 'Home', city: 'Jamshedpur', region: 'Jharkhand' },
    { role: 'Education', city: 'Bhubaneswar', region: 'Odisha' },
    { role: 'Work', city: 'Bengaluru', region: 'Karnataka' },
  ],
}
