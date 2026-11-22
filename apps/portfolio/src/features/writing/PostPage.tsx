import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from 'react'
import { site } from '../../config/site'
import type { WritingMeta } from '../../content/types'
import { Header } from '../../layout/Header'
import { hrefTo } from '../../lib/routes'
import { neighbours, posts } from '../../lib/writing'
import { ActionLink } from '../../ui/ActionLink'
import { Icon } from '../../ui/Icon'
import { formatDate, postHref } from './WritingPage'
import './writing.css'

interface PostPageProps {
  readonly slug: string
  /** The post's body: its Markdown made into HTML at build time (src/content/writing-loader.ts). */
  readonly html: string
}

/** A torn foot for the "torn" masthead: an irregular tear 2 to 16px deep, the same every time for a given post. */
function tornEdge(slug: string): string {
  let seed = [...slug].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 233280, 7)
  const random = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  const points = ['0 0', '100% 0', '100% calc(100% - 12px)']
  for (let x = 98; x > 0; x -= 1.6 + random() * 2.2) points.push(`${x.toFixed(2)}% calc(100% - ${(2 + random() * 14).toFixed(1)}px)`)
  points.push('0 calc(100% - 9px)')
  return `polygon(${points.join(', ')})`
}

/**
 * One post (from prototype 39). A slim bar (All writing, and Contents on phones and tablets) that stays under the
 * top edge while reading; the masthead, a sheet of paper (a letter by default, or torn) holding only what the
 * post's front matter gives; the reading column with Contents as a rail on wide screens; then tags, and the
 * previous and next posts. Any picture opens full size when tapped.
 */
export function PostPage({ slug, html }: PostPageProps) {
  const post = posts.find((item) => item.slug === slug) as WritingMeta
  const copy = site.writing
  const { previous, next } = neighbours(slug)
  const rows = post.facts.length
    ? [
        { label: 'Category', value: post.category },
        { label: 'Kind', value: copy.kinds[post.kind] },
        ...post.facts,
        { label: copy.published, value: formatDate(post.date) },
        { label: copy.reading, value: copy.minutes.replace('{n}', String(post.minutes)).replace(' read', '') },
      ]
    : []
  const kicker = [
    rows.length ? copy.kinds[post.kind] : `${post.category} · ${copy.kinds[post.kind]}`,
    post.private ? `${post.private} · ${copy.privateLabel}` : '',
    rows.length ? '' : formatDate(post.date),
    rows.length ? '' : copy.minutes.replace('{n}', String(post.minutes)),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="panel panel--grow">
      <Header page="post" />
      <main id="main" className="section container post">
        <PostBar post={post} />
        <header className={`post-mast post-mast--${post.masthead}${rows.length ? '' : ' post-mast--plain'} enter`}>
          {post.masthead === 'torn' ? <span className="post-mast__tape" aria-hidden="true" /> : null}
          <div className="post-mast__paper" style={post.masthead === 'torn' ? { clipPath: tornEdge(post.slug) } : undefined}>
            <div className="post-mast__main">
              <p className="post-mast__kicker">{kicker}</p>
              <h1 className="post-mast__title">{post.title}</h1>
              <p className="post-mast__dek">{post.summary}</p>
            </div>
            {rows.length ? (
              <dl className="post-mast__facts">
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {post.numbers.length || post.note ? (
              <div className="post-mast__numbers">
                {post.numbers.map((number) => (
                  <p key={number.label}>
                    <span className="post-mast__value">{number.value}</span>
                    <span className="post-mast__label">{number.label}</span>
                  </p>
                ))}
                {post.note ? <p className="post-mast__note">{post.note}</p> : null}
              </div>
            ) : null}
          </div>
        </header>

        <div className="post-layout">
          {post.sections.length ? (
            <nav className="post-toc" aria-label={copy.contents}>
              <p className="post-toc__label">{copy.contents}</p>
              {post.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`}>
                  {section.title}
                </a>
              ))}
            </nav>
          ) : null}
          <Prose html={html} />
        </div>

        <footer className="post-foot">
          {post.tags.length ? (
            <ul className="post-tags" aria-label={copy.tags}>
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
          {previous && next ? (
            <nav className="post-onward" aria-label="More writing">
              <a className="post-onward__link" href={postHref(previous.slug)}>
                <span className="post-onward__label">
                  <Icon name="arrowLeft" size={14} /> {copy.previous}
                </span>
                <span className="link-dots">{previous.title}</span>
              </a>
              <a className="post-onward__link post-onward__link--next" href={postHref(next.slug)}>
                <span className="post-onward__label">
                  {copy.next} <Icon name="arrowRight" size={14} />
                </span>
                <span className="link-dots">{next.title}</span>
              </a>
            </nav>
          ) : null}
        </footer>
      </main>
    </div>
  )
}

/** The bar above the masthead. On phones and tablets it stays under the top edge, with the page's paper behind it once stuck. */
function PostBar({ post }: { readonly post: WritingMeta }) {
  const copy = site.writing
  const [open, setOpen] = useState(false)
  const [stuck, setStuck] = useState(false)
  const sheetId = useId()
  const marker = useRef<HTMLSpanElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const update = () => setStuck((marker.current?.getBoundingClientRect().top ?? 0) < 0)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      button.current?.focus()
    }
    const onPointer = (event: PointerEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  return (
    <>
      <span ref={marker} aria-hidden="true" />
      <div className="post-bar" data-stuck={stuck || undefined}>
        <ActionLink href={hrefTo('writing')} icon="arrowLeft" iconFirst>
          {copy.back}
        </ActionLink>
        {post.sections.length ? (
          <div className="post-contents" ref={box}>
            <button
              ref={button}
              type="button"
              className="post-contents__button"
              aria-expanded={open}
              aria-controls={sheetId}
              onClick={() => setOpen((value) => !value)}
            >
              {copy.contents} <Icon name="chevronDown" size={14} />
            </button>
            <nav className="post-contents__sheet" id={sheetId} aria-label={copy.contents} hidden={!open}>
              {post.sections.map((section) => (
                <a key={section.id} href={`#${section.id}`} onClick={() => setOpen(false)}>
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </>
  )
}

interface Opened {
  readonly src: string
  readonly alt: string
  readonly width?: number
  readonly height?: number
}

/** The post's body. Tapping any picture opens it full size over the page; Escape, the close button or a tap outside closes it. */
function Prose({ html }: { readonly html: string }) {
  const [opened, setOpened] = useState<Opened | null>(null)
  const returnTo = useRef<HTMLElement | null>(null)
  const close = useRef<HTMLButtonElement>(null)

  const onClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const trigger = (event.target as HTMLElement).closest<HTMLButtonElement>('.post-figure__open')
    if (!trigger) return
    // The picture the theme is showing (a drawing may have a light and a dark version).
    const image = [...trigger.querySelectorAll('img')].find((item) => getComputedStyle(item).display !== 'none')
    if (!image) return
    returnTo.current = trigger
    setOpened({ src: image.currentSrc || image.src, alt: image.alt, width: image.naturalWidth, height: image.naturalHeight })
  }, [])

  const shut = useCallback(() => {
    setOpened(null)
    returnTo.current?.focus()
  }, [])

  useEffect(() => {
    if (!opened) return
    close.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && shut()
    document.addEventListener('keydown', onKey)
    const overflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = overflow
    }
  }, [opened, shut])

  return (
    <>
      {/* Built from the post's own Markdown at build time; raw HTML in a post is shown as text, never run. */}
      <div className="post-prose" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
      {opened ? (
        <div className="post-zoom" role="dialog" aria-modal="true" aria-label={opened.alt} onClick={(event) => event.target === event.currentTarget && shut()}>
          <img className="post-zoom__image" src={opened.src} alt={opened.alt} width={opened.width} height={opened.height} />
          <button ref={close} type="button" className="post-zoom__close" onClick={shut} aria-label={site.writing.closePicture}>
            <Icon name="close" size={18} />
          </button>
        </div>
      ) : null}
    </>
  )
}
