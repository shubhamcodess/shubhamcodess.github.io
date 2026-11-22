import { useCallback, useEffect, useMemo, useState } from 'react'
import { site } from '../../config/site'
import { Header } from '../../layout/Header'
import { hrefTo } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { Book, type BookMode } from './Book'
import { book } from '../../content/about'
import { bookPages } from './pages'
import './about.css'

const modeKey = 'about-book-mode'
const phoneQuery = '(max-width: 699px)'

/** One page at a time on phones unless the visitor chose the spread; both pages everywhere else. */
function firstMode(): BookMode {
  const phone = window.matchMedia(phoneQuery).matches
  if (!phone) return 'spread'
  try {
    return localStorage.getItem(modeKey) === 'spread' ? 'spread' : 'single'
  } catch {
    return 'single'
  }
}

/**
 * /about/: who the owner is, as a hard-bound book. It lands closed, stickers already on the cover; it opens to
 * a title page, contents and a preface, then one chapter per spread. A chapter in the address (/about/#two-wheels)
 * opens the book there, and the address follows the page being read.
 */
export function AboutPage() {
  const copy = site.about
  const pages = useMemo(() => bookPages(), [])
  const [mode, setMode] = useState<BookMode>(firstMode)
  const [phone] = useState(() => window.matchMedia(phoneQuery).matches)
  const start = useMemo(() => {
    const anchor = decodeURIComponent(window.location.hash.slice(1))
    const index = anchor ? pages.findIndex((page) => page.anchor === anchor) : -1
    return Math.max(0, index)
  }, [pages])

  const onTurn = useCallback(
    (page: number) => {
      const anchor = pages[page]?.anchor
      const url = `${window.location.pathname}${window.location.search}${anchor ? `#${anchor}` : ''}`
      if (url !== `${window.location.pathname}${window.location.search}${window.location.hash}`) history.replaceState(history.state, '', url)
    },
    [pages],
  )

  // Development only: report how smoothly pages turn on whichever device has the page open.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    let stop: (() => void) | undefined
    void import('./perfProbe').then(({ startProbe }) => (stop = startProbe()))
    return () => stop?.()
  }, [])

  const choose = (next: BookMode) => {
    setMode(next)
    try {
      localStorage.setItem(modeKey, next)
    } catch {
      // Storage can be blocked; the choice holds for this visit.
    }
  }

  return (
    <div className="panel panel--grow">
      <Header page="me" />
      <main id="main" className="section container about">
        <header className="section__header about__header enter">
          <div>
            <p className="eyebrow">{copy.kicker}</p>
            <h1 className="section__title about__title">
              <span className="about__title-kind">{copy.title}</span> {book.title}
            </h1>
            <p className="section__lead">{book.subtitle}</p>
          </div>
        </header>

        <Book
          key={mode}
          pages={pages}
          mode={mode}
          start={start}
          onTurn={onTurn}
          spine={
            <>
              <span>{book.title}</span>
              <span>{book.author}</span>
            </>
          }
          labels={{ previous: copy.previous, next: copy.next, book: copy.book, of: copy.of, hint: copy.hint }}
        >
          {phone ? (
            <div className="book-mode" role="group" aria-label={copy.modeLabel}>
              {(['single', 'spread'] as const).map((value) => (
                <button key={value} type="button" className="book-mode__option" aria-pressed={mode === value} onClick={() => choose(value)}>
                  {copy.modes[value]}
                </button>
              ))}
            </div>
          ) : null}
        </Book>

        <nav className="page-onward" aria-label="Continue">
          {site.features.experience ? (
            <ActionLink href={hrefTo('experience')} icon="arrowLeft" iconFirst>
              {copy.back}
            </ActionLink>
          ) : (
            <span />
          )}
          {site.features.contact ? (
            <ActionLink href={hrefTo(`#${site.contact.id}`)} icon="arrowRight">
              {copy.onward}
            </ActionLink>
          ) : null}
        </nav>
      </main>
    </div>
  )
}
