/**
 * The /me page: life away from work. Small tags for what the owner does, then one gallery of every photo.
 * Only what the owner has given goes here, in their words or in plain words about what a photo shows.
 */

/** The things the owner does. Each is a tag at the top of the page and a category a photo can carry. */
export const topics = [
  { id: 'biking', title: 'Biking' },
  { id: 'photography', title: 'Photography' },
  { id: 'filmmaking', title: 'Filmmaking' },
  { id: 'food', title: 'Food' },
  { id: 'people', title: 'People' },
  { id: 'places', title: 'Places' },
] as const

export type Topic = (typeof topics)[number]
export type TopicId = Topic['id']

/**
 * One photo in the gallery. Files are WebP under public/me/photos/, with all metadata stripped:
 * `<name>.webp` (about 1600px on the long side, for the viewer) and `<name>-print.webp` (560px tall, for the line).
 */
export interface MePhoto {
  /** The file name without its extension: me/photos/<name>.webp and <name>-print.webp. */
  readonly name: string
  /** The large copy's size, so a wide photo can hang across two places, uncropped. */
  readonly width: number
  readonly height: number
  /** A few words, written on the print's foot on the line. */
  readonly title: string
  /** A line in the owner's voice, on the print when it is opened: what the moment was, not what the picture contains. */
  readonly caption: string
  /** What the photo shows, plainly, for screen readers and search. */
  readonly alt: string
  /** One or two of the topics; the tag of each shows it. */
  readonly topics: readonly [TopicId] | readonly [TopicId, TopicId]
  /**
   * A clip rather than a still: me/photos/<name>.mp4 (720p, H.264, metadata stripped) plays when it's opened,
   * and the two WebP copies are its poster.
   */
  readonly video?: true
}

/** Every photo, in the order it hangs. Add a photo by adding its two files and one entry here. */
export const photos: readonly MePhoto[] = [
  {
    name: 'tank-badge',
    width: 900,
    height: 1600,
    title: 'The tank badge',
    caption: 'The badge on the tank, catching the light.',
    alt: 'The brushed-metal emblem on the side of the bike’s tank, up close.',
    topics: ['biking', 'photography'],
  },
  {
    name: 'office',
    width: 1600,
    height: 900,
    title: 'The Innovation wall',
    caption: 'The green wall at work. Better than staring at a screen.',
    alt: 'A living wall of plants at the office in Bengaluru, under a perforated ceiling.',
    topics: ['places'],
  },
  {
    name: 'meal',
    width: 1600,
    height: 900,
    title: 'On a banana leaf',
    caption: 'A proper banana-leaf meal. Rice, sambar, rasam and everything in between.',
    alt: 'A South Indian meal: rice, sambar, rasam, curries, curd and papad.',
    topics: ['food'],
  },
  {
    name: 'chaat',
    width: 900,
    height: 1600,
    title: 'Chaat at dusk',
    caption: 'Chaat and chai on the balcony as the sky turned pink.',
    alt: 'Chaat and a glass of tea on a balcony at dusk.',
    topics: ['food'],
  },
  {
    name: 'bike-rain',
    width: 1600,
    height: 900,
    title: 'After the rain',
    caption: 'Starting the ride right after the rain.',
    alt: 'Rain on the handlebars and the dashboard of the bike.',
    topics: ['biking'],
  },
  {
    name: 'out-for-a-ride',
    width: 1600,
    height: 900,
    title: 'Out for a ride',
    caption: 'Riding out on a sunny day.',
    alt: 'The handlebars and dashboard on a sunny ride, the road ahead.',
    topics: ['biking'],
  },
  {
    name: 'doughnuts',
    width: 900,
    height: 1600,
    title: 'A box of doughnuts',
    caption: 'Six doughnuts. Picking one was the hard part.',
    alt: 'Six glazed doughnuts in an open box, one with rainbow sprinkles.',
    topics: ['food'],
  },
  {
    name: 'figurine',
    width: 1066,
    height: 1600,
    title: 'The figurine',
    caption: 'Mini me, striped shirt and all.',
    alt: 'A figurine in a striped shirt and chinos, standing on a desk.',
    topics: ['people'],
  },
  {
    name: 'night-traffic',
    width: 900,
    height: 1600,
    title: 'Night traffic',
    caption: 'Stuck behind the lights on an evening ride back home.',
    alt: 'Waiting in evening traffic, the dashboard showing the next turn.',
    topics: ['biking'],
  },
  {
    name: 'yellow-taxi',
    width: 1600,
    height: 900,
    title: 'Yellow taxi',
    caption: 'The yellow Ambassadors, still waiting outside the station.',
    alt: 'A yellow Ambassador taxi outside the station, under the New Cab Road sign.',
    topics: ['places', 'photography'],
  },
  {
    name: 'christmas',
    width: 1600,
    height: 901,
    title: 'Christmas lights',
    caption: 'The Christmas tree outside Phoenix Mall of Asia, lit up in every colour.',
    alt: 'A rainbow-lit Christmas tree outside Phoenix Mall of Asia at night.',
    topics: ['places'],
  },
  {
    name: 'sandwich',
    width: 900,
    height: 1600,
    title: 'Grilled sandwich',
    caption: 'Grilled sandwich and a window seat.',
    alt: 'A grilled sandwich with cucumber and lettuce, by a window.',
    topics: ['food'],
  },
]
