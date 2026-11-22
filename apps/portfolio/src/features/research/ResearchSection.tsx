import { useEffect, useId, useRef, useState } from 'react'
import { site } from '../../config/site'
import { papers, writing } from '../../content/research'
import type { Paper } from '../../content/types'
import { ActionLink } from '../../ui/ActionLink'
import { Reveal } from '../../ui/Reveal'
import './research.css'

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/**
 * Research & writing, on home after Featured builds (from prototype 38). Builds are folders; research is paper:
 * a raised sheet of words beside the paper's printed first page. Under it, the latest writing as a short list.
 */
export function ResearchSection() {
  const copy = site.research
  const headingId = `${copy.id}-title`
  const posts = writing.slice(0, copy.writingCount)

  return (
    <section className="panel section" id={copy.id} aria-labelledby={headingId}>
      <div className="container">
        <Reveal>
          <header className="section__header">
            <div>
              <h2 className="section__title" id={headingId}>
                {copy.title}
              </h2>
              <p className="section__lead">{copy.lead}</p>
            </div>
          </header>
        </Reveal>

        {papers.map((paper, index) => (
          <Reveal key={paper.slug} index={index}>
            <PaperCard paper={paper} />
          </Reveal>
        ))}

        {posts.length > 0 ? (
          <Reveal index={papers.length}>
            <nav className="writing" aria-labelledby={`${copy.id}-writing`}>
              <div className="writing__head">
                <h3 className="writing__label" id={`${copy.id}-writing`}>
                  {copy.writingLabel}
                </h3>
                <ActionLink href={copy.allWriting.href} icon="arrowRight" external>
                  {copy.allWriting.label}
                </ActionLink>
              </div>
              <ul className="writing__list">
                {posts.map((post) => (
                  <li key={post.href}>
                    <a className="writing__item" href={post.href} {...(post.where === 'here' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}>
                      <WritingTitle title={post.title} />
                      <span className="writing__meta">
                        <span className="writing__where">{copy.where[post.where]}</span>
                        <time dateTime={post.date}>{dateFormat.format(new Date(post.date))}</time>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        ) : null}
      </div>
    </section>
  )
}

/**
 * A post's title on one line. When it doesn't fit and ends in an ellipsis, hovering or focusing the row shows the
 * whole title in a small raised label just above it (our own, not the browser's tooltip).
 */
function WritingTitle({ title }: { readonly title: string }) {
  const words = useRef<HTMLSpanElement>(null)
  const [cut, setCut] = useState(false)

  useEffect(() => {
    const element = words.current
    if (!element) return
    const measure = () => setCut(element.scrollWidth > element.clientWidth + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <span className="writing__title" data-cut={cut || undefined}>
      <span ref={words} className="link-dots">
        {title}
      </span>
      {cut ? (
        <span className="writing__full" aria-hidden="true">
          {title}
        </span>
      ) : null}
    </span>
  )
}

/** One paper: the words on the left, page one printed on the right with a second sheet behind it. */
function PaperCard({ paper }: { readonly paper: Paper }) {
  const copy = site.research
  const titleId = `${paper.slug}-title`
  return (
    <article className="paper" aria-labelledby={titleId}>
      <div className="paper__words">
        <p className="paper__meta">
          {paper.meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
        <h3 className="paper__title" id={titleId}>
          {paper.title}
        </h3>
        <p className="paper__subtitle">{paper.subtitle}</p>
        <p className="paper__summary">{paper.summary}</p>
        <p className="paper__stat">
          <span className="paper__stat-value">
            {paper.stat.from}
            <span className="paper__stat-arrow" aria-hidden="true">
              {' → '}
            </span>
            <span className="visually-hidden"> to </span>
            {paper.stat.to}
          </span>
          <span className="paper__stat-label">{paper.stat.label}</span>
        </p>
        <div className="paper__actions">
          <ActionLink href={paper.pdf} external label={`${copy.readPaper}: ${paper.title}`}>
            {copy.readPaper}
          </ActionLink>
          <ActionLink href={paper.code} external label={`${paper.title}: ${copy.viewCode}`}>
            {copy.viewCode}
          </ActionLink>
          {paper.arxiv.href ? (
            <a className="paper__primary" href={paper.arxiv.href} target="_blank" rel="noopener noreferrer">
              {copy.endorse.listed}
            </a>
          ) : (
            <Endorse paper={paper} />
          )}
        </div>
      </div>
      <a className="paper__sheet" href={paper.pdf} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
        <span className="paper__page paper__page--behind" />
        <img
          className="paper__page"
          src={`${import.meta.env.BASE_URL}${paper.preview.src}`}
          width={paper.preview.width}
          height={paper.preview.height}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </a>
    </article>
  )
}

/** An email to the owner offering to endorse, with the subject and a short note already written. */
function offerMail(paper: Paper): string {
  const { endorse } = site.research
  const fill = (text: string) => text.replaceAll('{title}', paper.title).replaceAll('{category}', paper.arxiv.category)
  const query = `subject=${encodeURIComponent(fill(endorse.mailSubject))}&body=${encodeURIComponent(fill(endorse.mailBody))}`
  return `mailto:${site.contact.email}?${query}`
}

/**
 * Asking for an arXiv endorsement: a button that opens a short note above it. Its main link, "I'd like to endorse",
 * opens an email to the owner with the offer already written, so they can reply with the code. Once the code is in
 * the content, the note also shows it and links to arXiv's form. Escape or a press outside closes it.
 */
function Endorse({ paper }: { readonly paper: Paper }) {
  const copy = site.research.endorse
  const [open, setOpen] = useState(false)
  const noteId = useId()
  const root = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const { category, endorseCode } = paper.arxiv

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  const [before, after] = copy.note.split('{category}')
  return (
    <div className="endorse" ref={root}>
      <button
        ref={button}
        className="paper__primary"
        type="button"
        aria-expanded={open}
        aria-controls={noteId}
        onClick={() => setOpen((value) => !value)}
      >
        {copy.button}
      </button>
      <div className="endorse__note" id={noteId} role="region" aria-label={copy.button} hidden={!open}>
        <p className="endorse__kicker">
          {copy.kicker} · {category}
        </p>
        <p>
          {before}
          <strong>{category}</strong>
          {after}
        </p>
        {endorseCode ? (
          <>
            <p className="endorse__code">
              {copy.codeLabel}: <span>{endorseCode}</span>
            </p>
            <ActionLink href={`https://arxiv.org/auth/endorse?x=${encodeURIComponent(endorseCode)}`} external>
              {copy.button}
            </ActionLink>
          </>
        ) : null}
        <ActionLink href={offerMail(paper)} icon="arrowRight">
          {copy.offer}
        </ActionLink>
        <ActionLink href={copy.howHref} external>
          {copy.howLabel}
        </ActionLink>
      </div>
    </div>
  )
}
