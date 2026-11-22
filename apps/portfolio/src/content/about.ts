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

/** A photo on a page, placed by percentages of the page so it holds at every size. */
export interface Keepsake {
  /** A photo's name in content/me.ts, or a path under public/ for a picture from elsewhere (a project's own site). */
  readonly photo?: string
  readonly src?: string
  readonly alt?: string
  /** An empty frame for a photo still to come, with the note pencilled in it. */
  readonly slot?: { readonly shape: 'wide' | 'tall'; readonly note: string }
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

/** A die-cut sticker on a page or the cover. */
export interface Sticker {
  readonly id: StickerId | 'bob'
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
    | { readonly kind: 'kit'; readonly kit: readonly Fact[] }
    | { readonly kind: 'builds'; readonly builds: readonly [BuildSlug, BuildSlug]; readonly more: readonly [BuildSlug, BuildSlug] }
    | { readonly kind: 'steps'; readonly steps: readonly { readonly title: string; readonly text: string }[] }
    | { readonly kind: 'stickers'; readonly sheet: readonly Sticker[]; readonly facts: readonly Fact[] }
    | { readonly kind: 'next' }
  )

export const book = {
  author: 'Shubham Prakash',
  title: 'Between Commits',
  subtitle: 'An about-me in nine chapters: the places, the work, the desk, the bike and what comes next.',
  volume: 'Volume one',
  year: '2026',
  /** The cover's photo, and the stickers already on it while the book is closed. */
  cover: {
    photo: 'portrait',
    stickers: [
      { id: 'claude', x: 76, y: 8, size: 17, turn: 12 },
      { id: 'kubernetes', x: -6, y: 70, size: 14, turn: -14 },
    ],
    hanging: [{ photo: 'bike-rain', mount: 'clip', x: 66, y: 71, w: 42, turn: 7 }],
  },
  stamp: { ring: 'Jamshedpur · Bhubaneswar · Bengaluru ·', middle: 'SP', foot: 'Since 2020' },
  places: 'Jamshedpur · Bhubaneswar · Bengaluru',
  preface: [
    'This is where a website would usually put its About page. I wanted something you could leaf through instead, so it’s a book.',
    'Each chapter is one part of me: where I come from, the work, the desk, the bike, the things I build and what I’m chasing right now. Skim it and you’ll know who I am and what I do.',
    'The photos are mine, most of them taken on a phone on the way to somewhere else.',
    'It isn’t finished. New chapters go in as they happen.',
  ],
  signed: 'Shubham, Bengaluru',
  contents: 'Contents',
  prefaceTitle: 'Preface',
  colophon: {
    title: 'About this book',
    lines: [
      'Set in Geist and Geist Mono.',
      'The pages turn with CSS 3D transforms and a little React. No page-turn library.',
      'The paper sound is made in your browser as you turn, with Web Audio.',
      'Every photo in it is mine.',
    ],
  },
  endpaper: { owner: 'This book belongs to', name: 'whoever is reading it' },
  pocket: { title: 'Say hello', text: 'The quickest way to reach me is mail.', cta: 'Write to me' },
  back: {
    blurb:
      'A developer from Jamshedpur, by way of Bhubaneswar, now in Bengaluru. Six years of shipping enterprise software at IBM, a growing shelf of open source tools, and a bike for clearing his head.',
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
        'I’m Shubham Prakash, a full stack developer at IBM. For six years I’ve built and run enterprise applications for a multinational retailer, and scaled them in production.',
        'I like the whole path of a product: the backend, the screen people use, the database underneath and the pipeline that ships it. More and more of that path now runs through AI agents, so I build tools for them too.',
        'Away from the keyboard I’m usually on the bike, behind a camera, or looking for something good to eat.',
      ],
      left: [{ photo: 'figurine', mount: 'pin', x: 54, y: 52, w: 36, turn: 4, label: 'Mini me' }],
      stickers: { right: [{ id: 'apple', x: 80, y: 84, size: 11, turn: -10 }] },
    },
    {
      id: 'three-cities',
      title: 'Three cities.',
      dek: 'Where I grew up, studied and work.',
      kind: 'route',
      stops: [
        { place: 'Jamshedpur', when: 'Home', what: 'Where I come from' },
        { place: 'Bhubaneswar', when: '2016 to 2020', what: 'BTech at ITER, SOA University' },
        { place: 'Bengaluru', when: '2020 to now', what: 'Six years at IBM' },
      ],
      story: [
        'Home is Jamshedpur, the steel city.',
        'From 2016 to 2020 I lived in Bhubaneswar, studying for my BTech at ITER, Siksha ’O’ Anusandhan University.',
        'In 2020 I moved to Bengaluru to join IBM, and I’ve been here since. It’s where the work, the rides and most of these photos happen.',
      ],
      right: [
        { slot: { shape: 'wide', note: 'Jamshedpur' }, mount: 'tape', x: 8, y: 54, w: 50, turn: -3 },
        { slot: { shape: 'tall', note: 'Bhubaneswar' }, mount: 'corners', x: 62, y: 50, w: 30, turn: 4 },
      ],
      left: [{ photo: 'christmas', mount: 'tape', x: 12, y: 72, w: 46, turn: -2, label: 'Bengaluru, at Christmas' }],
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
        '2020 to 2022, application developer. The global tax engines behind every in-store and online sale of a multinational retailer, and two platform migrations under them.',
        '2023 to 2024, full stack developer. Moving enterprise applications off a legacy stack, then leading a B2B order platform into production.',
        '2025 to now, senior cloud full stack developer. Products from requirement to production: a browser-based Kubernetes control plane with its own AI assistant, a workflow platform, and AI agents for enterprise applications.',
      ],
      links: [
        { label: 'Full experience', href: 'experience/' },
        { label: 'Case studies', href: 'writing/' },
      ],
      left: [{ photo: 'office', mount: 'tape', x: 8, y: 66, w: 62, turn: -2.5 }],
      stickers: {
        right: [
          { id: 'openjdk', x: 58, y: 70, size: 15, turn: -8 },
          { id: 'springboot', x: 74, y: 78, size: 14, turn: 9 },
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
        { id: 'claude', x: 8, y: 22, size: 23, turn: -8 },
        { id: 'bob', x: 38, y: 18, size: 22, turn: 6 },
        { id: 'githubcopilot', x: 68, y: 24, size: 21, turn: -4 },
        { id: 'openjdk', x: 12, y: 44, size: 20, turn: 9 },
        { id: 'nextdotjs', x: 40, y: 42, size: 19, turn: -11 },
        { id: 'springboot', x: 66, y: 46, size: 20, turn: 5 },
        { id: 'typescript', x: 6, y: 64, size: 18, turn: -3 },
        { id: 'kubernetes', x: 30, y: 63, size: 20, turn: 14 },
        { id: 'angular', x: 55, y: 66, size: 17, turn: -9 },
        { id: 'modelcontextprotocol', x: 76, y: 66, size: 17, turn: 8 },
        { id: 'react', x: 18, y: 80, size: 16, turn: 10 },
        { id: 'ollama', x: 42, y: 82, size: 16, turn: -6 },
        { id: 'googlecloud', x: 64, y: 82, size: 17, turn: 3 },
      ],
      story: [
        'Claude Code and IBM Bob for agentic work, Copilot inside VS Code, Java and Spring Boot at work, and Next.js with TypeScript for most of what I build on my own.',
      ],
      left: [
        { slot: { shape: 'wide', note: 'The MacBook' }, mount: 'tape', x: 8, y: 47, w: 58, turn: -2 },
        { photo: 'desk-clock', mount: 'clip', x: 50, y: 70, w: 42, turn: 5 },
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
        'It’s also where a lot of my photos come from: the dash, the tank, the road ahead.',
      ],
      left: [
        { photo: 'tank-badge', mount: 'pin', x: 10, y: 46, w: 32, turn: -5 },
        { photo: 'night-traffic', mount: 'tape', x: 52, y: 42, w: 34, turn: 4 },
      ],
      right: [
        { photo: 'bike-rain', mount: 'tape', x: 6, y: 40, w: 54, turn: -3 },
        { photo: 'out-for-a-ride', mount: 'corners', x: 40, y: 66, w: 52, turn: 3 },
      ],
    },
    {
      id: 'builds',
      title: 'Things I’ve built.',
      dek: 'Recent open source work, in my own time.',
      kind: 'builds',
      builds: ['mcp-token-optimizer', 'whatcmd'],
      more: ['tiny-browse', 'everything-tech'],
      story: [],
      links: [{ label: 'Every build', href: 'builds/' }],
      left: [{ src: 'previews/3e9b4474a833.png', alt: 'The MCP Token Optimizer website.', mount: 'tape', x: 10, y: 70, w: 70, turn: -2, bare: true }],
      right: [{ src: 'previews/937e1a9d0207.png', alt: 'The whatcmd website.', mount: 'clip', x: 14, y: 62, w: 70, turn: 2.5, bare: true }],
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
        'These days I start from a question, not a feature. First I look for an edge, then I research it, and only then do I build a solution or a project around what I find.',
        'The first result is a paper, The Blind Script, on what code-writing agents miss. The notes from the work go into writing on this site.',
      ],
      links: [
        { label: 'The paper', href: '#research' },
        { label: 'Writing', href: 'writing/' },
      ],
      stickers: { left: [{ id: 'modelcontextprotocol', x: 70, y: 74, size: 15, turn: 8 }] },
      right: [
        { src: 'research/the-blind-script-abstract.webp', alt: 'The first page of the paper The Blind Script.', mount: 'clip', x: 50, y: 50, w: 40, turn: 4, bare: true },
      ],
    },
    {
      id: 'off-the-clock',
      title: 'Off the clock.',
      dek: 'Food, places and the odd festival.',
      kind: 'facts',
      facts: [],
      story: ['Some of what I’ve eaten, seen and stopped for.'],
      left: [
        { photo: 'meal', mount: 'tape', x: 8, y: 34, w: 56, turn: -3 },
        { photo: 'chaat', mount: 'pin', x: 64, y: 30, w: 28, turn: 5 },
        { photo: 'doughnuts', mount: 'corners', x: 12, y: 64, w: 26, turn: 4 },
        { photo: 'sandwich', mount: 'tape', x: 48, y: 66, w: 26, turn: -5 },
      ],
      right: [
        { photo: 'durga-puja', mount: 'tape', x: 52, y: 10, w: 38, turn: 4 },
        { photo: 'yellow-taxi', mount: 'clip', x: 8, y: 46, w: 56, turn: -3 },
      ],
    },
    {
      id: 'to-be-continued',
      title: 'To be continued.',
      dek: 'The next chapter is still being written.',
      kind: 'next',
      story: [],
      stickers: {
        left: [{ id: 'nextdotjs', x: 72, y: 76, size: 14, turn: -10 }],
        right: [{ id: 'typescript', x: 64, y: 62, size: 15, turn: 7 }],
      },
    },
  ] satisfies readonly Chapter[] as readonly Chapter[],
}
