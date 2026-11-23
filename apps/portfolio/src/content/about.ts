import type { BuildSlug } from './builds'
import type { StickerId } from './sticker-marks'

/**
 * The About page: a hard-bound book, closed on landing, one chapter per spread. The left page of a chapter
 * carries its topic and a few facts; the right page tells it. Everything here must be true, in the owner's voice.
 * Photos come from content/me.ts by name. A photo that hasn't been taken yet is a `slot`: an empty taped frame
 * with a pencilled note, in the shape it will have. Fill it by adding the photo to me.ts and naming it here.
 */

/** How a photo is held on the page. */
export type Mount = 'tape' | 'pin' | 'clip' | 'corners'

/** Something kept on a page, placed by percentages of the page so it holds at every size. */
export interface Keepsake {
  /** A photo's name in content/me.ts, or a path under public/ for a picture from elsewhere (a project's own site). */
  readonly photo?: string
  readonly src?: string
  readonly alt?: string
  /** An empty frame for a photo still to come, with the note pencilled in it. */
  readonly slot?: { readonly shape: 'wide' | 'tall'; readonly note: string }
  /** A pinned index card with a few written lines, in place of a photo. */
  readonly note?: { readonly title: string; readonly lines: readonly string[] }
  readonly mount: Mount
  /** Left and top edges, and width, as a percentage of the page. */
  readonly x: number
  readonly y: number
  readonly w: number
  /** Degrees. */
  readonly turn: number
  /** Written on the print's white foot. Defaults to the photo's title in me.ts. */
  readonly label?: string
  /** Leave out the white foot (a printout or a screenshot). */
  readonly bare?: true
}

/** Stickers drawn for the book itself, beside the tool marks. */
export type OwnSticker = 'bob' | 'ibm' | 'veg' | 'camera' | 'bat' | 'flask'

/** A die-cut sticker on a page or the cover. */
export interface Sticker {
  readonly id: StickerId | OwnSticker
  readonly x: number
  readonly y: number
  /** Size as a percentage of the page's width. */
  readonly size: number
  readonly turn: number
}

interface Fact {
  readonly value: string
  readonly label: string
}

interface ChapterBase {
  readonly id: string
  readonly title: string
  /** One line under the chapter title on the left page. */
  readonly dek: string
  /** The right page's text, one string per paragraph. */
  readonly story: readonly string[]
  /** Optional links at the foot of the right page. */
  readonly links?: readonly { readonly label: string; readonly href: string }[]
  readonly left?: readonly Keepsake[]
  readonly right?: readonly Keepsake[]
  readonly stickers?: { readonly left?: readonly Sticker[]; readonly right?: readonly Sticker[] }
}

/** What fills a chapter's left page under its title. */
export type Chapter = ChapterBase &
  (
    | { readonly kind: 'facts'; readonly facts: readonly Fact[] }
    | { readonly kind: 'route'; readonly stops: readonly { readonly place: string; readonly when: string; readonly what: string }[] }
    | {
        readonly kind: 'builds'
        readonly builds: readonly [BuildSlug, BuildSlug]
        /** Each build's own website, taped beside its note. */
        readonly shots: Readonly<Partial<Record<BuildSlug, string>>>
        readonly feature: BuildSlug
        readonly featureNote: string
      }
    | { readonly kind: 'steps'; readonly steps: readonly { readonly title: string; readonly text: string }[] }
    | { readonly kind: 'stickers'; readonly sheet: readonly Sticker[]; readonly facts: readonly Fact[] }
    | { readonly kind: 'next' }
  )

export const book = {
  author: 'Shubham Prakash',
  title: 'Beyond Stack',
  subtitle: 'A memoir of code, roads and everything in between.',
  volume: 'Volume one',
  year: '2026',
  /** The postage stamp: the owner's initials, the three cities, the year it all started. */
  stamp: { country: 'India', value: '2020', middle: 'SP', caption: 'Jamshedpur · Bhubaneswar · Bengaluru', postmark: 'Bengaluru · 2026' },
  places: 'Jamshedpur · Bhubaneswar · Bengaluru',
  /** Written inside the front board, the way a book is signed for someone. */
  inscription: {
    to: 'For whoever opens this,',
    lines: [
      'this is me. Where I come from, what I do all day, what I build at night, and the things that have nothing to do with code.',
      'Turn the pages, drag the corners, take your time. The photos are mine, and so are the words.',
    ],
    from: 'Shubham',
    place: 'Bengaluru, 2026',
  },
  preface: [
    'This is where a website would usually put its About page: a photo, a paragraph, a list of skills. I wanted something you could leaf through instead, so it’s a book.',
    'Each chapter is one part of me. Where I come from and where I live now. Six years of work at IBM. The desk I build on and the tools I reach for. The bike. The things I’ve made in my own time, and the lab I’m starting. The way I work these days. And the parts that are just for fun: photos, food, and a long-running thing for Batman.',
    'Skim it and you’ll know who I am and what I do. Read it slowly and you’ll know a bit more than that.',
    'It isn’t finished. New chapters go in as they happen.',
  ],
  signed: 'Shubham, Bengaluru',
  contents: 'Contents',
  prefaceTitle: 'Preface',
  hello: { title: 'Say hello', text: 'The quickest way to reach me is mail. I read everything that comes in.', elsewhere: 'Or find me elsewhere' },
  end: {
    title: 'The end',
    note: 'for now.',
    lines: [
      'Thanks for reading this far. This book gets a new chapter whenever something worth writing down happens: a new build, a new city, a long ride, the lab opening its doors.',
      'Come back in a while and there will be more of it.',
    ],
  },
  back: {
    blurb:
      'A developer from Jamshedpur, by way of Bhubaneswar, now in Bengaluru. Six years of shipping enterprise software at IBM, a growing shelf of open source tools, a lab in the making, and a bike for clearing his head.',
  },
  chapters: [
    {
      id: 'hello',
      title: 'Hello.',
      dek: 'Who I am, in one page.',
      kind: 'facts',
      facts: [
        { value: 'Cloud Full Stack Developer', label: 'at IBM' },
        { value: '6 years', label: 'shipping enterprise applications' },
        { value: 'Bengaluru', label: 'where I live and work' },
      ],
      story: [
        'I’m Shubham Prakash, a cloud full stack developer at IBM. For six years I’ve built and run enterprise applications for a multinational retailer: the tax engines behind its sales, the platforms behind its orders and its stock, and the pipelines that ship them.',
        'I like owning the whole path of a product. The backend, the screen people actually use, the database underneath, and the pipeline that carries it to production. When something breaks at two in the morning, I want to know every part of it well enough to fix it.',
        'More and more of that path now runs through AI agents, so alongside the day job I build tools for them: a proxy that saves them tokens, an assistant that reads a live cluster before it answers, and small utilities I wished existed.',
        'Away from the keyboard I’m on the bike, behind a camera, cooking, or watching a Marvel film.',
      ],
      left: [{ photo: 'figurine', mount: 'pin', x: 56, y: 54, w: 34, turn: 4, label: 'Mini me' }],
      stickers: { right: [{ id: 'claude', x: 80, y: 84, size: 11, turn: -10 }] },
    },
    {
      id: 'three-cities',
      title: 'Three cities.',
      dek: 'Where I grew up, studied and work.',
      kind: 'route',
      stops: [
        { place: 'Jamshedpur', when: 'Home', what: 'Where I grew up' },
        { place: 'Bhubaneswar', when: '2016 to 2020', what: 'BTech at ITER, SOA University' },
        { place: 'Bengaluru', when: '2020 to now', what: 'Six years at IBM' },
      ],
      story: [
        'Home is Jamshedpur, the steel city, where I grew up.',
        'From 2016 to 2020 I lived in Bhubaneswar, studying for my BTech at ITER, Siksha ’O’ Anusandhan University.',
        'In October 2020 I moved to Bengaluru to join IBM, and I’ve been here since. It’s where the work happens, where most of the rides start, and where a lot of the photos in this book were taken.',
      ],
      right: [
        { photo: 'tatanagar', mount: 'tape', x: 6, y: 50, w: 52, turn: -3, label: 'Tatanagar Jn., Jamshedpur' },
        { photo: 'iter', mount: 'corners', x: 40, y: 72, w: 52, turn: 3, label: 'ITER, Bhubaneswar' },
      ],
      left: [{ photo: 'bangalore-palace', mount: 'pin', x: 54, y: 54, w: 36, turn: 3, label: 'Bangalore Palace, Bengaluru' }],
    },
    {
      id: 'the-work',
      title: 'The work.',
      dek: 'Six years at IBM, three roles.',
      kind: 'facts',
      facts: [
        { value: '2020', label: 'joined IBM as an application developer' },
        { value: 'Up to 10', label: 'engineers led on one team' },
        { value: '10+', label: 'repositories on a CI/CD framework I built' },
      ],
      story: [
        '2020 to 2022, application developer. I looked after the global tax engines behind every in-store and online sale of a multinational retailer. I wrote a unit-testing framework for a legacy Spring codebase that had none, replaced repeated tax-holiday firefighting with a check that runs in advance, and moved the platform twice: OpenShift 3 to 4, then OpenShift to GKE.',
        '2023 to 2024, full stack developer. I set up the Angular codebase and team standards for a migration pilot, which got the wider migration approved, and built the shared framework every source-system integration runs on, plus the program’s first single sign-on. Then I helped take a B2B order platform into production, leading teams of up to ten.',
        '2025 to now, senior cloud full stack developer. Products from requirement to production: a browser-based Kubernetes control plane with an MCP server and an AI assistant, a workflow platform with a visual DAG builder, and AI agents for enterprise applications.',
      ],
      links: [
        { label: 'Full experience', href: 'experience/' },
        { label: 'Case studies', href: 'writing/' },
      ],
      left: [{ photo: 'office', mount: 'tape', x: 8, y: 66, w: 56, turn: -2.5 }],
      stickers: {
        left: [
          { id: 'ibm', x: 70, y: 62, size: 17, turn: -6 },
          { id: 'openjdk', x: 74, y: 79, size: 12, turn: 9 },
        ],
      },
    },
    {
      id: 'the-desk',
      title: 'The desk.',
      dek: 'What I build on, and the tools I reach for.',
      kind: 'stickers',
      facts: [{ value: 'MacBook Pro 16″', label: 'M4 Pro, 48 GB' }],
      sheet: [
        { id: 'claude', x: 6, y: 8, size: 22, turn: -8 },
        { id: 'bob', x: 36, y: 2, size: 25, turn: 6 },
        { id: 'githubcopilot', x: 68, y: 10, size: 21, turn: -4 },
        { id: 'openjdk', x: 10, y: 36, size: 19, turn: 9 },
        { id: 'nextdotjs', x: 38, y: 38, size: 18, turn: -11 },
        { id: 'springboot', x: 64, y: 40, size: 19, turn: 5 },
        { id: 'typescript', x: 4, y: 66, size: 17, turn: -3 },
        { id: 'kubernetes', x: 27, y: 64, size: 19, turn: 14 },
        { id: 'angular', x: 52, y: 68, size: 16, turn: -9 },
        { id: 'modelcontextprotocol', x: 74, y: 70, size: 16, turn: 8 },
      ],
      story: [
        'Most of what I build starts on a 16-inch MacBook Pro with an M4 Pro and 48 GB of memory, enough to run a local model next to everything else. Several of my tools need exactly that: no API keys, nothing leaving the machine.',
        'For agents I use Claude Code and IBM Bob, and GitHub Copilot inside VS Code. At work it’s Java and Spring Boot, with Angular or Next.js on top, on Kubernetes. On my own it’s mostly Next.js and TypeScript.',
      ],
      left: [
        { photo: 'at-the-macbook', mount: 'tape', x: 8, y: 44, w: 62, turn: -2 },
        { photo: 'new-macbook', mount: 'clip', x: 46, y: 72, w: 46, turn: 4 },
      ],
    },
    {
      id: 'two-wheels',
      title: 'On two wheels.',
      dek: 'How I clear my head.',
      kind: 'facts',
      facts: [{ value: 'TVS Apache RTR 160 4V', label: 'the bike, with its TFT dash' }],
      story: [
        'Most days end on the bike. A ride right after the rain, a ride out on a sunny day, or just the evening ride back home, stuck behind the lights.',
        'Early mornings are the best of it: the roads are empty, the sun is low across them, and the city hasn’t started yet.',
        'The bike is also where a lot of my photos come from: the dash in the rain, the badge on the tank, the helmet waiting on the tank, the road ahead.',
      ],
      left: [
        { photo: 'helmet-on-the-tank', mount: 'pin', x: 10, y: 44, w: 30, turn: -5 },
        { photo: 'tank-badge', mount: 'tape', x: 52, y: 42, w: 30, turn: 4 },
      ],
      right: [
        { photo: 'morning-ride', mount: 'tape', x: 6, y: 52, w: 52, turn: -3 },
        { photo: 'bike-rain', mount: 'corners', x: 44, y: 70, w: 48, turn: 3 },
      ],
    },
    {
      id: 'builds',
      title: 'Things I’ve built.',
      dek: 'Open source work, in my own time.',
      kind: 'builds',
      builds: ['mcp-token-optimizer', 'whatcmd'],
      shots: { 'mcp-token-optimizer': 'about/mcp-token-optimizer.webp', whatcmd: 'about/whatcmd.webp' },
      feature: 'everything-tech',
      featureNote: 'Its front page, as it printed on 22 November 2026.',
      story: [],
      links: [{ label: 'Every build', href: 'builds/' }],
      right: [
        { src: 'about/everything-tech-today.webp', alt: 'The front page of EverythingTech, the daily tech newspaper.', mount: 'clip', x: 16, y: 47, w: 68, turn: -1.5, bare: true },
      ],
      stickers: { left: [{ id: 'modelcontextprotocol', x: 80, y: 86, size: 11, turn: 8 }] },
    },
    {
      id: 'the-lab',
      title: 'The lab.',
      dek: 'Something I’m building. Still in the works.',
      kind: 'facts',
      facts: [
        { value: 'In the works', label: 'nothing to link to yet' },
        { value: 'Experiments, launches, collaborators', label: 'what it’s for' },
      ],
      story: [
        'I’m building a lab. It’s still in the works, so there’s nothing to link to yet.',
        'It’s meant to be a place where I can run experiments, launch products, and build with other developers, instead of keeping every idea in a private repository.',
        'The longer goal is a platform for doing more Palantir-style work in AI: taking large, messy information and building the tools that turn it into decisions.',
        'If that sounds like something you’d want to build with me, write to me.',
      ],
      left: [
        {
          note: { title: 'The lab, to do', lines: ['run experiments', 'launch products', 'find collaborators', 'build the platform'] },
          mount: 'pin',
          x: 14,
          y: 60,
          w: 60,
          turn: -3,
        },
      ],
      right: [{ photo: 'late-desk', mount: 'tape', x: 10, y: 66, w: 52, turn: -3, label: 'Where the lab happens, for now' }],
      stickers: { right: [{ id: 'flask', x: 72, y: 72, size: 15, turn: 8 }] },
    },
    {
      id: 'right-now',
      title: 'Right now.',
      dek: 'Research first, then the build.',
      kind: 'steps',
      steps: [
        { title: 'Find an edge', text: 'Something tools or agents still get wrong.' },
        { title: 'Research it', text: 'Properly, before writing any code.' },
        { title: 'Build the answer', text: 'A solution or a project, from what the research found.' },
      ],
      story: [
        'These days I start from a question, not a feature list. First I look for an edge: something today’s tools or agents still get wrong. Then I research it properly, reading and measuring before I write any code. Only then do I build a solution or a project around what I find.',
        'The first result is a paper, The Blind Script, on what code-writing agents miss. The notes from the work, including case studies from private projects, go into the writing on this site.',
      ],
      links: [
        { label: 'The paper', href: '#research' },
        { label: 'Writing', href: 'writing/' },
      ],
      right: [
        { src: 'research/the-blind-script-abstract.webp', alt: 'The first page of the paper The Blind Script.', mount: 'clip', x: 52, y: 56, w: 36, turn: 4, bare: true },
      ],
      left: [{ photo: 'at-the-macbook-2', mount: 'pin', x: 18, y: 64, w: 54, turn: -2.5 }],
    },
    {
      id: 'through-the-lens',
      title: 'Through the lens.',
      dek: 'Photography and filmmaking.',
      kind: 'facts',
      facts: [{ value: 'Photos and films', label: 'mostly on a phone, on the way somewhere' }],
      story: [
        'I like photography and filmmaking. Most of it is a phone in my pocket and whatever the light is doing: a sky going orange over the rooftops, a yellow Ambassador waiting outside a station, a pandal lit up from the roof down at Durga Puja.',
        'Filmmaking pulls at me the same way, framing a moment, only with time and sound added to it.',
        'Nearly every photo in this book is one of mine.',
      ],
      left: [
        { photo: 'rooftop-sunset', mount: 'tape', x: 8, y: 46, w: 58, turn: -2 },
        { photo: 'yellow-taxi', mount: 'corners', x: 36, y: 70, w: 54, turn: 3 },
      ],
      right: [
        { photo: 'christmas', mount: 'tape', x: 6, y: 58, w: 46, turn: -3 },
        { photo: 'durga-puja', mount: 'pin', x: 58, y: 48, w: 32, turn: 4 },
      ],
      stickers: { left: [{ id: 'camera', x: 76, y: 28, size: 15, turn: 10 }] },
    },
    {
      id: 'small-things',
      title: 'Small things.',
      dek: 'A few more from the camera roll.',
      kind: 'facts',
      facts: [],
      story: [
        'A rose with the rain still on it, one leaf that turned yellow before the rest, the wing over the clouds on the way somewhere, a café lit up behind the trees. These are the things I stop for.',
      ],
      left: [
        { photo: 'white-rose', mount: 'tape', x: 6, y: 34, w: 28, turn: -3 },
        { photo: 'yellow-leaf', mount: 'pin', x: 37, y: 42, w: 27, turn: 2 },
        { photo: 'yellow-rose', mount: 'corners', x: 67, y: 34, w: 26, turn: 4 },
      ],
      right: [
        { photo: 'cafe-at-night', mount: 'tape', x: 4, y: 34, w: 56, turn: -2.5 },
        { photo: 'over-the-clouds', mount: 'clip', x: 66, y: 31, w: 26, turn: 3 },
        { photo: 'cranes', mount: 'corners', x: 6, y: 66, w: 52, turn: 2 },
        { photo: 'glass-tower', mount: 'pin', x: 66, y: 64, w: 25, turn: -3 },
      ],
    },
    {
      id: 'food',
      title: 'Food.',
      dek: 'I cook, and I eat out. Vegetarian, always.',
      kind: 'facts',
      facts: [
        { value: 'Vegetarian', label: 'the green dot, every time' },
        { value: 'Cook and eat out', label: 'both, happily' },
      ],
      story: [
        'I like food from both sides of the counter. I cook at home, and I’m just as happy finding a new place to eat out.',
        'I’m vegetarian, which in India mostly means the menu is on my side. A proper banana-leaf meal, chaat and chai on the balcony as the sky turns pink, a grilled sandwich by the window, a cappuccino at a quiet table: these are the plates that end up on my phone.',
        'And when there’s a box of six doughnuts, picking one is still the hard part.',
      ],
      left: [
        { photo: 'meal', mount: 'tape', x: 8, y: 54, w: 54, turn: -3 },
        { photo: 'chaat', mount: 'pin', x: 64, y: 48, w: 28, turn: 5 },
      ],
      right: [
        { photo: 'coffee', mount: 'corners', x: 8, y: 64, w: 24, turn: -4 },
        { photo: 'doughnuts', mount: 'tape', x: 38, y: 62, w: 24, turn: 3 },
        { photo: 'sandwich', mount: 'clip', x: 68, y: 64, w: 24, turn: -2 },
      ],
      stickers: { left: [{ id: 'veg', x: 76, y: 22, size: 13, turn: -6 }] },
    },
    {
      id: 'batman',
      title: 'I’m Batman.',
      dek: 'On a lighter note: films, comics and a favourite.',
      kind: 'facts',
      facts: [
        { value: 'Batman', label: 'the favourite' },
        { value: 'Marvel', label: 'the films, the comics, the characters' },
      ],
      story: [
        'On a lighter note: I love Marvel films and comics, and comic-book characters in general.',
        'My favourite is Batman. No powers, just preparation, a good set of tools and refusing to give up, which isn’t a bad way to think about engineering either.',
        'Hence the T-shirt, and the keychain on the bike that just says Vengeance.',
      ],
      left: [{ photo: 'batman-tee', mount: 'tape', x: 8, y: 56, w: 64, turn: -2.5 }],
      right: [{ photo: 'vengeance-chai', mount: 'pin', x: 56, y: 42, w: 32, turn: 4 }],
      stickers: { left: [{ id: 'bat', x: 74, y: 22, size: 15, turn: -10 }] },
    },
    {
      id: 'to-be-continued',
      title: 'To be continued.',
      dek: 'The next chapter is still being written.',
      kind: 'next',
      story: [],
    },
  ] satisfies readonly Chapter[] as readonly Chapter[],
}
