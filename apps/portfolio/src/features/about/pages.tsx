import type { CSSProperties, ReactNode } from 'react'
import { book, type Chapter, type Keepsake, type Sticker } from '../../content/about'
import { getBuild } from '../../content/builds'
import { site } from '../../config/site'
import { hrefToBuild } from '../../lib/routes'
import { Icon, type IconName } from '../../ui/Icon'
import type { BookPage } from './Book'
import { useBookNav } from './Book'
import { Photo, PostageStamp, StickerMark } from './Keepsakes'

const base = import.meta.env.BASE_URL
const href = (to: string) => (to.startsWith('http') || to.startsWith('mailto:') ? to : `${base}${to}`)
const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen']
const two = (n: number) => String(n).padStart(2, '0')
const plain = (title: string) => title.replace(/\.$/, '')

/** Page index of a chapter's left page: cover, inscription, title, contents and preface come first. */
const chapterPage = (index: number) => 5 + index * 2
const endPage = chapterPage(book.chapters.length)

function Things({ photos = [], stickers = [] }: { photos?: readonly Keepsake[] | undefined; stickers?: readonly Sticker[] | undefined }) {
  return (
    <>
      {photos.map((item, index) => (
        <Photo key={`${item.photo ?? item.src ?? item.slot?.note ?? item.note?.title}-${index}`} item={item} />
      ))}
      {stickers.map((item, index) => (
        <StickerMark key={`${item.id}-${index}`} item={item} />
      ))}
    </>
  )
}

/** Paragraphs; with `first`, the opening letter is a drop cap (only the letter, never the punctuation after it). */
function Prose({ lines, first = false }: { readonly lines: readonly string[]; readonly first?: boolean }) {
  return (
    <div className="page__prose">
      {lines.map((line, index) => (
        <p key={line.slice(0, 24)}>
          {first && index === 0 ? (
            <>
              <span className="page__drop">{line[0]}</span>
              {line.slice(1)}
            </>
          ) : (
            line
          )}
        </p>
      ))}
    </div>
  )
}

function Folio({ page }: { readonly page: number }) {
  return (
    <span className={`page__folio page__folio--${page % 2 ? 'left' : 'right'}`} aria-hidden="true">
      {page}
    </span>
  )
}

/**
 * The front board: the portrait printed edge to edge, washed into black-grey cloth, and the title set up the
 * spine side in tall capitals drawn only as a gold foil outline, so the photo shows through the letters.
 */
function Cover() {
  return (
    <div className="cover">
      <div className="leather">
        <span className="leather__stitch" aria-hidden="true" />
        <CircuitPattern />
        <p className="leather__author">{book.author}</p>
        <NeuralMark />
        <div className="leather__foot">
          <h2 className="leather__title">{book.title}</h2>
          <span className="leather__rule" aria-hidden="true" />
          <p className="leather__subtitle">{book.subtitle}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * A circuit of traces and nodes pressed into the leather: each line drawn twice, a dark groove with a faint
 * highlight under it, so it reads as debossed. Densest round the medallion, fading towards the edges.
 */
function CircuitPattern() {
  const traces = [
    'M50 40v40h30v50h-20', 'M150 20v30h40v40', 'M250 40v30h-30v40h20', 'M300 120h-40v40h-30', 'M20 170h40v-20h40',
    'M110 140v40h60', 'M200 210h50v40h40', 'M30 260h60v40h30', 'M150 300v-30h60', 'M260 300h-30v50',
    'M80 360h40v-30h40', 'M210 360v-40h60', 'M40 410h50v-30', 'M290 400h-60v-30', 'M140 410h40v-30h30',
  ]
  const nodes = [[60, 130], [190, 90], [240, 110], [230, 160], [100, 150], [170, 180], [290, 250], [120, 300], [210, 270], [230, 350], [160, 330], [270, 330], [90, 380], [210, 380]]
  return (
    <svg className="leather__circuit" viewBox="0 0 320 440" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="circuit-fade" cx="50%" cy="38%" r="62%">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.15" />
        </radialGradient>
        <mask id="circuit-mask">
          <rect width="320" height="440" fill="url(#circuit-fade)" />
        </mask>
      </defs>
      <g mask="url(#circuit-mask)">
        <g className="leather__circuit-light" transform="translate(0 0.8)">
          {traces.map((d) => (
            <path key={d} d={d} />
          ))}
          {nodes.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" />
          ))}
        </g>
        <g className="leather__circuit-groove">
          {traces.map((d) => (
            <path key={d} d={d} />
          ))}
          {nodes.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" />
          ))}
        </g>
      </g>
    </svg>
  )
}

/**
 * The cover's centrepiece: a small neural network (inputs, two hidden layers, one output) inside a ring of
 * circuit ticks, pressed into the leather like the circuit around it, with its nodes picked out in silver.
 */
function NeuralMark() {
  const layers = [
    [52, 84, 116, 148],
    [44, 72, 100, 128, 156],
    [60, 100, 140],
    [100],
  ]
  const xs = [46, 82, 118, 154]
  const nodes = layers.flatMap((ys, layer) => ys.map((y) => [xs[layer] ?? 0, y] as const))
  const links = layers.slice(0, -1).flatMap((ys, layer) =>
    ys.flatMap((y) => (layers[layer + 1] ?? []).map((next) => `M${xs[layer]} ${y}L${xs[layer + 1]} ${next}`)),
  )
  const ticks = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2
    const r1 = 88
    const r2 = i % 4 ? 92 : 97
    return `M${100 + r1 * Math.cos(a)} ${100 + r1 * Math.sin(a)}L${100 + r2 * Math.cos(a)} ${100 + r2 * Math.sin(a)}`
  })
  const draw = (className: string, shift: number) => (
    <g className={className} transform={`translate(0 ${shift})`}>
      <circle cx="100" cy="100" r="82" />
      {ticks.map((d) => (
        <path key={d} d={d} />
      ))}
      {links.map((d) => (
        <path key={d} d={d} />
      ))}
      {nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.2" />
      ))}
    </g>
  )
  return (
    <svg className="leather__mark" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
      {draw('leather__mark-light', 0.9)}
      {draw('leather__mark-groove', 0)}
      <g className="leather__mark-nodes">
        {nodes.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" />
        ))}
      </g>
    </svg>
  )
}

function Endpaper({ children }: { readonly children?: ReactNode }) {
  return (
    <div className="endpaper">
      <svg className="endpaper__pattern" aria-hidden="true" focusable="false">
        <defs>
          <pattern id="endpaper-motif" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
            <path d="M8 10l-5 6 5 6M18 10l5 6-5 6" />
            <circle cx="34" cy="34" r="5" />
            <path d="M29 34h10M34 29v10" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#endpaper-motif)" />
      </svg>
      {children}
    </div>
  )
}

/** Inside the front board: a card tipped in and written on, the way a book is signed for someone. */
function Inscription() {
  const { inscription } = book
  return (
    <Endpaper>
      <div className="inscription">
        <p className="inscription__to">{inscription.to}</p>
        {inscription.lines.map((line) => (
          <p key={line.slice(0, 20)}>{line}</p>
        ))}
        <p className="inscription__from">{inscription.from}</p>
        <p className="inscription__place">{inscription.place}</p>
      </div>
    </Endpaper>
  )
}

function TitlePage() {
  return (
    <div className="page page--title">
      <p className="page__kicker">{book.author}</p>
      <h1 className="title-page__title">{book.title}</h1>
      <p className="title-page__subtitle">{book.subtitle}</p>
      <span className="title-page__rule" aria-hidden="true" />
      <p className="title-page__places">{book.places}</p>
      <p className="title-page__foot">
        {book.volume} · {book.year}
      </p>
      <PostageStamp {...book.stamp} x={62} y={62} size={26} turn={-6} />
    </div>
  )
}

function Contents() {
  const { goTo } = useBookNav()
  return (
    <div className="page page--contents">
      <h2 className="page__heading">{book.contents}</h2>
      <ol className="contents">
        <li>
          <button type="button" onClick={() => goTo(4)}>
            <span className="contents__number" />
            <span className="contents__name">{book.prefaceTitle}</span>
            <span className="contents__dots" aria-hidden="true" />
            <span className="contents__page">4</span>
          </button>
        </li>
        {book.chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <button type="button" onClick={() => goTo(chapterPage(index))}>
              <span className="contents__number">{two(index + 1)}</span>
              <span className="contents__name">{plain(chapter.title)}</span>
              <span className="contents__dots" aria-hidden="true" />
              <span className="contents__page">{chapterPage(index)}</span>
            </button>
          </li>
        ))}
      </ol>
      <Folio page={3} />
    </div>
  )
}

function Preface() {
  return (
    <div className="page page--preface">
      <h2 className="page__heading">{book.prefaceTitle}</h2>
      <Prose lines={book.preface} first />
      <p className="preface__signed">{book.signed}</p>
      <Folio page={4} />
    </div>
  )
}

function ChapterLeft({ chapter, index }: { readonly chapter: Chapter; readonly index: number }) {
  return (
    <div className={`page page--chapter-left page--${chapter.kind}`}>
      <p className="chapter__number" aria-hidden="true">
        {two(index + 1)}
      </p>
      <p className="page__kicker">Chapter {numberWords[index]}</p>
      <h2 className="chapter__title" id={`chapter-${chapter.id}`}>
        {chapter.title}
      </h2>
      <p className="chapter__dek">{chapter.dek}</p>
      <LeftBody chapter={chapter} />
      <Things photos={chapter.left} stickers={chapter.stickers?.left} />
      <Folio page={chapterPage(index)} />
    </div>
  )
}

function Facts({ facts }: { readonly facts: readonly { readonly value: string; readonly label: string }[] }) {
  return facts.length ? (
    <dl className="chapter__facts">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.value}</dt>
          <dd>{fact.label}</dd>
        </div>
      ))}
    </dl>
  ) : null
}

function LeftBody({ chapter }: { readonly chapter: Chapter }) {
  switch (chapter.kind) {
    case 'facts':
    case 'stickers':
      return <Facts facts={chapter.facts} />
    case 'route':
      return (
        <ol className="route">
          {chapter.stops.map((stop) => (
            <li key={stop.place}>
              <span className="route__when">{stop.when}</span>
              <span className="route__place">{stop.place}</span>
              <span className="route__what">{stop.what}</span>
            </li>
          ))}
        </ol>
      )
    case 'steps':
      return (
        <ol className="steps">
          {chapter.steps.map((step, index) => (
            <li key={step.title}>
              <span className="steps__number">{index + 1}</span>
              <span className="steps__title">{step.title}</span>
              <span className="steps__text">{step.text}</span>
            </li>
          ))}
        </ol>
      )
    case 'builds':
      return (
        <div className="build-notes">
          {chapter.builds.map((slug, index) => (
            <BuildNote key={slug} slug={slug} shot={chapter.shots[slug]} turn={index ? 3 : -3} />
          ))}
        </div>
      )
    case 'next':
      return (
        <div className="next">
          <p className="next__chapter">Chapter {numberWords[book.chapters.length]}</p>
          <span className="next__lines" aria-hidden="true" />
        </div>
      )
  }
}

function BuildNote({
  slug,
  feature = false,
  shot,
  turn = 0,
}: {
  readonly slug: Parameters<typeof getBuild>[0]
  readonly feature?: boolean
  readonly shot?: string | undefined
  readonly turn?: number
}) {
  const build = getBuild(slug)
  return (
    <div className={`build-note${feature ? ' build-note--feature' : ''}`}>
      {shot ? (
        // The build's own website, taped beside its note; the words run round it.
        <span className="build-note__shot" style={{ '--turn': `${turn}deg` } as CSSProperties}>
          <img src={`${base}${shot}`} alt={`The ${build.title} website.`} width={640} height={336} decoding="async" draggable={false} />
          <span className="keepsake__tape keepsake__tape--a" aria-hidden="true" />
        </span>
      ) : null}
      <a className="build-note__title link-dots" href={hrefToBuild(build.slug)}>
        {build.title}
      </a>
      <p className="build-note__summary">{build.summary}</p>
      {build.highlight ? (
        <p className="build-note__number">
          <strong>{build.highlight.value}</strong> {build.highlight.label}
        </p>
      ) : null}
    </div>
  )
}

function ChapterRight({ chapter, index }: { readonly chapter: Chapter; readonly index: number }) {
  let body: ReactNode
  if (chapter.kind === 'builds') {
    body = (
      <>
        <BuildNote slug={chapter.feature} feature />
        <p className="build-note__aside">{chapter.featureNote}</p>
      </>
    )
  } else if (chapter.kind === 'next') {
    body = <SayHello />
  } else {
    body = <Prose lines={chapter.story} first={index === 0} />
  }
  return (
    <div className={`page page--chapter-right page--${chapter.kind}-right`}>
      {body}
      {chapter.kind === 'stickers' ? (
        <div className="sticker-sheet" role="group" aria-label="Tools I use">
          {chapter.sheet.map((item, sticker) => (
            <StickerMark key={`${item.id}-${sticker}`} item={item} />
          ))}
        </div>
      ) : null}
      {chapter.links?.length ? (
        <p className="page__links">
          {chapter.links.map((link) => (
            <a key={link.href} className="link-dots" href={href(link.href)}>
              {link.label} →
            </a>
          ))}
        </p>
      ) : null}
      <Things photos={chapter.right} stickers={chapter.stickers?.right} />
      <Folio page={chapterPage(index) + 1} />
    </div>
  )
}

/** The last chapter's right page: mail first, then every profile, each with its mark. */
function SayHello() {
  const contact = site.contact
  return (
    <div className="say-hello">
      <h3 className="page__heading">{book.hello.title}</h3>
      <p>{book.hello.text}</p>
      <a className="say-hello__mail" href={`mailto:${contact.email}`}>
        <Icon name="mail" size={16} />
        <span className="link-dots">{contact.email}</span>
      </a>
      <p className="say-hello__elsewhere">{book.hello.elsewhere}</p>
      <ul className="socials">
        {contact.links.map((link) => (
          <li key={link.href}>
            <a href={link.href} rel="me noopener" target="_blank">
              <Icon name={link.icon as IconName} size={16} />
              <span className="socials__name">{link.label}</span>
              <span className="socials__handle">{link.detail}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The last printed page: the end, for now, and the stamp again as a sign-off. */
function TheEnd() {
  return (
    <div className="page page--end">
      <p className="the-end__title">
        {book.end.title}
        <span>{book.end.note}</span>
      </p>
      <span className="title-page__rule" aria-hidden="true" />
      <Prose lines={book.end.lines} />
      <PostageStamp {...book.stamp} x={34} y={66} size={26} turn={5} />
      <Folio page={endPage} />
    </div>
  )
}

/** The back board: the same print-and-wash as the front, this time looking out over the water, with the blurb. */
function BackCover() {
  return (
    <div className="cover cover--back">
      <div className="cover__cloth cover__cloth--front cover__cloth--back">
        <img className="cover__backdrop" src={`${base}about/back-cover.webp`} alt="" width={1200} height={675} decoding="async" draggable={false} />
        <span className="cover__wash" aria-hidden="true" />
        <span className="cover__frame" aria-hidden="true" />
        <p className="cover__author">{book.author}</p>
        <p className="cover__blurb">{book.back.blurb}</p>
        <p className="cover__foot">{book.places}</p>
      </div>
    </div>
  )
}

/** Every page of the book, in reading order: cover, inscription, title, contents, preface, the chapters, the end, endpaper, back. */
export function bookPages(): BookPage[] {
  const chapterPages = book.chapters.flatMap((chapter, index): BookPage[] => {
    const label = `Chapter ${index + 1}: ${plain(chapter.title)}`
    return [
      { key: `${chapter.id}-left`, label, anchor: chapter.id, node: <ChapterLeft chapter={chapter} index={index} /> },
      { key: `${chapter.id}-right`, label, anchor: chapter.id, node: <ChapterRight chapter={chapter} index={index} /> },
    ]
  })
  return [
    { key: 'cover', label: book.title, tone: 'board', node: <Cover /> },
    { key: 'inscription', label: book.title, tone: 'endpaper', node: <Inscription /> },
    { key: 'title', label: book.title, node: <TitlePage /> },
    { key: 'contents', label: book.contents, node: <Contents /> },
    { key: 'preface', label: book.prefaceTitle, anchor: 'preface', node: <Preface /> },
    ...chapterPages,
    { key: 'the-end', label: book.end.title, node: <TheEnd /> },
    { key: 'endpaper-back', label: book.end.title, tone: 'endpaper', node: <Endpaper /> },
    { key: 'back', label: book.title, tone: 'board', node: <BackCover /> },
  ]
}
