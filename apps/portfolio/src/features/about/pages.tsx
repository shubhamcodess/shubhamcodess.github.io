import type { CSSProperties, ReactNode } from 'react'
import { book, type Chapter, type Keepsake, type Sticker } from '../../content/about'
import { getBuild } from '../../content/builds'
import { site } from '../../config/site'
import { hrefToBuild } from '../../lib/routes'
import { Icon, type IconName } from '../../ui/Icon'
import portrait from '../../assets/portrait.webp'
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
      {stickers.map((item, index) =>
        item.wrap ? (
          // Clipped at the board's edge, as if the rest of it is folded round the side.
          <span key={`${item.id}-${index}`} className="sticker-fold">
            <StickerMark item={item} />
          </span>
        ) : (
          <StickerMark key={`${item.id}-${index}`} item={item} />
        ),
      )}
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
 * The front board: the portrait printed edge to edge under a navy wash, the title set up the spine side in tall
 * foil letters that let the photo through (a double exposure), and stickers stuck on top, one folded over the edge.
 */
function Cover() {
  return (
    <div className="cover">
      <div className="cover__cloth cover__cloth--front" style={{ '--cover-photo': `url(${portrait})` } as CSSProperties}>
        <img className="cover__backdrop" src={portrait} alt="" width={1086} height={1448} decoding="async" draggable={false} />
        <span className="cover__wash" aria-hidden="true" />
        <h2 className="cover__vertical" aria-label={book.title}>
          {book.title.split(' ').map((word) => (
            <span key={word}>{word}</span>
          ))}
        </h2>
        <span className="cover__frame" aria-hidden="true" />
        <p className="cover__author">{book.author}</p>
        <p className="cover__subtitle">{book.subtitle}</p>
        <p className="cover__foot">
          {book.volume} · {book.year}
        </p>
      </div>
      <Things stickers={book.cover.stickers as readonly Sticker[]} />
    </div>
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
          {chapter.builds.map((slug) => (
            <BuildNote key={slug} slug={slug} />
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

function BuildNote({ slug, feature = false }: { readonly slug: Parameters<typeof getBuild>[0]; readonly feature?: boolean }) {
  const build = getBuild(slug)
  return (
    <div className={`build-note${feature ? ' build-note--feature' : ''}`}>
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
        <img className="cover__backdrop" src={`${base}me/photos/by-the-water.webp`} alt="" width={1600} height={900} loading="lazy" decoding="async" draggable={false} />
        <span className="cover__wash" aria-hidden="true" />
        <span className="cover__frame" aria-hidden="true" />
        <p className="cover__author">{book.author}</p>
        <p className="cover__blurb">{book.back.blurb}</p>
        <p className="cover__foot">{book.places}</p>
      </div>
      <StickerMark item={{ id: 'githubcopilot', x: 74, y: 8, size: 14, turn: 8 }} />
      <StickerMark item={{ id: 'veg', x: 64, y: 14, size: 10, turn: -9 }} />
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
