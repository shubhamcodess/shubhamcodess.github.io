import type { StateKey } from './state-maps'

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

/** A place lived in, shown as its own page when the home tile is opened. */
export interface Place {
  /** Its address on the page: /me/#places/<id>. */
  readonly id: string
  /** What the place was to the owner, in a natural phrase, such as "What I call home". */
  readonly role: string
  readonly city: string
  readonly region: string
  /** The state drawn on the card, and where the city sits on it (latitude, longitude). */
  readonly map: StateKey
  readonly at: readonly [lat: number, lon: number]
  /** A sentence or two in the owner's words. */
  readonly line?: string
  /** Photos hung on the place's clotheslines, in order. As many lines are strung as the photos need. */
  readonly photos?: readonly PlacePhoto[]
}

/** One photo on a clothesline. Paths are under /public; metadata is stripped before a photo is added. */
export interface PlacePhoto {
  /** The large copy, shown when the print is opened (about 1600px on the long side). */
  readonly src: string
  /** The small copy hung on the line (about 560px tall). */
  readonly print: string
  /** What the photo shows. Also its caption when opened. */
  readonly alt: string
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
  /** A fine-line map drawn behind the city, with a marker on the city (latitude, longitude). */
  readonly map?: StateKey
  readonly at?: readonly [lat: number, lon: number]
  /** The tile's own page, shown when it is opened. */
  readonly story?: readonly string[]
  /** The places lived in, in the order their tabs show: where the owner is now first. Each is a page of its own. */
  readonly places?: readonly Place[]
}

export const pursuits: readonly Pursuit[] = [
  { id: 'biking', title: 'Biking', frame: 'sheet', size: 'wide' },
  { id: 'photography', title: 'Photography', frame: 'print', size: 'tall' },
  { id: 'filmmaking', title: 'Filmmaking', frame: 'film', size: 'tall' },
]

export const home: Home = {
  id: 'places',
  label: 'Work',
  city: 'Bengaluru',
  region: 'Karnataka, India',
  map: 'karnataka',
  at: [12.9716, 77.5946],
  places: [
    {
      id: 'bengaluru',
      role: 'Where I work now',
      city: 'Bengaluru',
      region: 'Karnataka',
      map: 'karnataka',
      at: [12.9716, 77.5946],
      photos: [
        {
          src: 'me/places/bengaluru-office.webp',
          print: 'me/places/bengaluru-office-print.webp',
          alt: 'The Innovation wall at the office, a living wall of plants under a perforated ceiling',
        },
        {
          src: 'me/places/bengaluru-meal.webp',
          print: 'me/places/bengaluru-meal-print.webp',
          alt: 'A South Indian meal on a banana leaf: rice, sambar, rasam, curries, curd and papad',
        },
        {
          src: 'me/places/bengaluru-chaat.webp',
          print: 'me/places/bengaluru-chaat-print.webp',
          alt: 'Chaat and a glass of tea on a balcony at dusk',
        },
        {
          src: 'me/places/bengaluru-christmas.webp',
          print: 'me/places/bengaluru-christmas-print.webp',
          alt: 'A rainbow-lit Christmas tree outside Phoenix Mall of Asia at night',
        },
      ],
    },
    { id: 'jamshedpur', role: 'What I call home', city: 'Jamshedpur', region: 'Jharkhand', map: 'jharkhand', at: [22.8046, 86.2029] },
    { id: 'bhubaneswar', role: 'Where I studied', city: 'Bhubaneswar', region: 'Odisha', map: 'odisha', at: [20.2961, 85.8245] },
  ],
}
