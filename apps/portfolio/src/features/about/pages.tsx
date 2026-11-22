import type { CSSProperties, ReactNode } from 'react'
import { book, type Chapter, type Keepsake, type Sticker } from '../../content/about'
import { getBuild } from '../../content/builds'
import { site } from '../../config/site'
import { hrefToBuild } from '../../lib/routes'
import portrait from '../../assets/portrait.webp'
import type { BookPage } from './Book'
import { useBookNav } from './Book'
import { Photo, Stamp, StickerMark } from './Keepsakes'

const base = import.meta.env.BASE_URL
const href = (to: string) => (to.startsWith('http') || to.startsWith('mailto:') ? to : `${base}${to}`)
const numberWords = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']
const two = (n: number) => String(n).padStart(2, '0')

/** A paragraph list whose first letter is set as a drop cap (only the letter, never the punctuation after it). */
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

/** Page index of a chapter's left page: cover, endpaper, title, contents and preface come first. */
const chapterPage = (index: number) => 5 + index * 2

function Things({ photos = [], stickers = [] }: { photos?: readonly Keepsake[] | undefined; stickers?: readonly Sticker[] | undefined }) {
  return (
    <>
      {photos.map((item, index) => (
        <Photo key={`${item.photo ?? item.src ?? item.slot?.note}-${index}`} item={item} />
      ))}
      {stickers.map((item, index) => (
        <StickerMark key={`${item.id}-${index}`} item={item} />
      ))}
    </>
  )
}

function Folio({ page }: { readonly page: number }) {
  return (
    <span className={`page__folio page__folio--${page % 2 ? 'left' : 'right'}`} aria-hidden="true">
      {page}
    </span>
  )
}

function Cover() {
  return (
    <div className="cover">
      <div className="cover__cloth">
        <p className="cover__author">{book.author}</p>
        <div className="cover__window">
          <img src={portrait} alt={`${book.author}.`} width={1086} height={1448} decoding="async" draggable={false} />
        </div>
        <h2 className="cover__title">{book.title}</h2>
        <p className="cover__subtitle">{book.subtitle}</p>
        <p className="cover__foot">
          {book.volume} · {book.year}
        </p>
      </div>
      <Things photos={book.cover.hanging as readonly Keepsake[]} stickers={book.cover.stickers as readonly Sticker[]} />
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
      <Stamp {...book.stamp} x={58} y={58} size={34} turn={-14} />
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
            <span className="contents__name">{book.prefaceTitle}</span>
            <span className="contents__dots" aria-hidden="true" />
            <span className="contents__page">4</span>
          </button>
        </li>
        {book.chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <button type="button" onClick={() => goTo(chapterPage(index))}>
              <span className="contents__number">{two(index + 1)}</span>
              <span className="contents__name">{chapter.title.replace(/\.$/, '')}</span>
              <span className="contents__dots" aria-hidden="true" />
              <span className="contents__page">{chapterPage(index)}</span>
            </button>
          </li>
        ))}
      </ol>
      <StickerMark item={{ id: 'ollama', x: 72, y: 80, size: 13, turn: -9 }} />
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
      <StickerMark item={{ id: 'claude', x: 74, y: 80, size: 15, turn: 10 }} />
      <Folio page={4} />
    </div>
  )
}

function ChapterLeft({ chapter, index }: { readonly chapter: Chapter; readonly index: number }) {
  const page = chapterPage(index)
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
      <Folio page={page} />
    </div>
  )
}

function LeftBody({ chapter }: { readonly chapter: Chapter }) {
  switch (chapter.kind) {
    case 'facts':
      return chapter.facts.length ? (
        <dl className="chapter__facts">
          {chapter.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.value}</dt>
              <dd>{fact.label}</dd>
            </div>
          ))}
        </dl>
      ) : null
    case 'stickers':
    case 'kit': {
      const kit = chapter.kind === 'kit' ? chapter.kit : chapter.facts
      return (
        <dl className="chapter__facts chapter__facts--kit">
          {kit.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.value}</dt>
              <dd>{fact.label}</dd>
            </div>
          ))}
        </dl>
      )
    }
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
      return <BuildNote slug={chapter.builds[0]} more={chapter.more[0]} />
    case 'next':
      return (
        <div className="next">
          <p className="next__chapter">Chapter ten</p>
          <span className="next__lines" aria-hidden="true" />
        </div>
      )
  }
}

function BuildNote({ slug, more }: { readonly slug: Parameters<typeof getBuild>[0]; readonly more: Parameters<typeof getBuild>[0] }) {
  const build = getBuild(slug)
  const also = getBuild(more)
  return (
    <div className="build-note">
      <a className="build-note__title link-dots" href={hrefToBuild(build.slug)}>
        {build.title}
      </a>
      <p className="build-note__summary">{build.summary}</p>
      {build.highlight ? (
        <p className="build-note__number">
          <strong>{build.highlight.value}</strong> {build.highlight.label}
        </p>
      ) : null}
      <p className="build-note__also">
        Also:{' '}
        <a className="link-dots" href={hrefToBuild(also.slug)}>
          {also.title}
        </a>
        , {also.summary.split('. ')[0]?.replace(/\.$/, '')}.
      </p>
    </div>
  )
}

function ChapterRight({ chapter, index }: { readonly chapter: Chapter; readonly index: number }) {
  const page = chapterPage(index) + 1
  return (
    <div className={`page page--chapter-right page--${chapter.kind}-right`}>
      {chapter.kind === 'builds' ? (
        <BuildNote slug={chapter.builds[1]} more={chapter.more[1]} />
      ) : chapter.kind === 'next' ? (
        <SayHello />
      ) : (
        <Prose lines={chapter.story} first={index === 0} />
      )}
      {chapter.kind === 'stickers' ? (
        <div className="sticker-sheet" aria-label="Tools I use">
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
      <Folio page={page} />
    </div>
  )
}

function SayHello() {
  const contact = site.contact
  return (
    <div className="say-hello">
      <h3 className="page__heading">{book.pocket.title}</h3>
      <p>{book.pocket.text}</p>
      <a className="say-hello__mail link-dots" href={`mailto:${contact.email}`}>
        {contact.email}
      </a>
    </div>
  )
}

function Colophon() {
  return (
    <div className="page page--colophon">
      <h2 className="page__heading">{book.colophon.title}</h2>
      <ul className="colophon">
        {book.colophon.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <Stamp {...book.stamp} x={30} y={60} size={34} turn={9} />
      <StickerMark item={{ id: 'react', x: 70, y: 40, size: 13, turn: 12 }} />
      <Folio page={23} />
    </div>
  )
}

function BackEndpaper() {
  return (
    <Endpaper>
      <div className="pocket" data-no-turn>
        <span className="pocket__card">
          <span className="pocket__label">{book.pocket.title}</span>
          <a className="pocket__mail link-dots" href={`mailto:${site.contact.email}`}>
            {book.pocket.cta}
          </a>
        </span>
        <span className="pocket__sleeve" aria-hidden="true" />
      </div>
    </Endpaper>
  )
}

function BackCover() {
  return (
    <div className="cover cover--back">
      <div className="cover__cloth">
        <p className="cover__blurb">{book.back.blurb}</p>
        <p className="cover__foot">{book.author}</p>
      </div>
      <StickerMark item={{ id: 'githubcopilot', x: 70, y: 74, size: 15, turn: -8 }} />
    </div>
  )
}

/** Every page of the book, in reading order: cover, endpaper, title, contents, preface, the chapters, colophon, endpaper, back. */
export function bookPages(): BookPage[] {
  const chapterPages = book.chapters.flatMap((chapter, index): BookPage[] => [
    {
      key: `${chapter.id}-left`,
      label: `Chapter ${index + 1}: ${chapter.title.replace(/\.$/, '')}`,
      anchor: chapter.id,
      node: <ChapterLeft chapter={chapter} index={index} />,
    },
    {
      key: `${chapter.id}-right`,
      label: `Chapter ${index + 1}: ${chapter.title.replace(/\.$/, '')}`,
      anchor: chapter.id,
      node: <ChapterRight chapter={chapter} index={index} />,
    },
  ])
  return [
    { key: 'cover', label: book.title, tone: 'board', node: <Cover /> },
    { key: 'endpaper-front', label: book.title, tone: 'endpaper', node: <Endpaper><ExLibris /></Endpaper> },
    { key: 'title', label: book.title, node: <TitlePage /> },
    { key: 'contents', label: book.contents, node: <Contents /> },
    { key: 'preface', label: book.prefaceTitle, anchor: 'preface', node: <Preface /> },
    ...chapterPages,
    { key: 'colophon', label: book.colophon.title, node: <Colophon /> },
    { key: 'endpaper-back', label: book.pocket.title, tone: 'endpaper', node: <BackEndpaper /> },
    { key: 'back', label: book.title, tone: 'board', node: <BackCover /> },
  ]
}

function ExLibris() {
  return (
    <div className="ex-libris" style={{ '--turn': '-3deg' } as CSSProperties}>
      <span className="ex-libris__label">{book.endpaper.owner}</span>
      <span className="ex-libris__name">{book.endpaper.name}</span>
    </div>
  )
}
