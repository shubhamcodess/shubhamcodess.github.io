import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { site } from '../../config/site'
import { photos, topics, type TopicId } from '../../content/me'
import { Header } from '../../layout/Header'
import { hrefTo } from '../../lib/routes'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { ActionLink } from '../../ui/ActionLink'
import { Icon } from '../../ui/Icon'
import { Reveal } from '../../ui/Reveal'
import { Gallery } from './Gallery'
import { PhotoViewer } from './PhotoViewer'
import { TopicArt } from './TopicArt'
import './me.css'

const topicIds = new Set<string>(topics.map((topic) => topic.id))
const countOf = (id: TopicId) => photos.filter((photo) => photo.topics.some((topic) => topic === id)).length

/** The topic named in the address: /me/#gallery/food. Plain #gallery, or anything else, is every photo. */
const readTopic = (): TopicId | null => {
  const [section, id = ''] = decodeURIComponent(window.location.hash.slice(1)).split('/')
  return section === 'gallery' && topicIds.has(id) ? (id as TopicId) : null
}

/**
 * Life away from work. Small paper tags for what the owner does, then one gallery of every photo, hung on
 * twine. A tag isn't a page: it shows that topic's photos and brings the gallery up. While the gallery is on
 * screen the tags wait at the top as a small bar, with All to see everything again. The address follows the
 * choice (/me/#gallery/food), so a link lands on it.
 */
export function MePage() {
  const { me, features } = site
  const reducedMotion = useReducedMotion()
  const [topic, setTopic] = useState<TopicId | null>(readTopic)
  const [opened, setOpened] = useState<number | null>(null)
  const [docked, setDocked] = useState(false)
  const tagsRef = useRef<HTMLUListElement>(null)
  const galleryRef = useRef<HTMLElement>(null)

  const shown = useMemo(() => (topic ? photos.filter((photo) => photo.topics.some((id) => id === topic)) : photos), [topic])
  const counts = useMemo(() => new Map(topics.map((item) => [item.id, countOf(item.id)])), [])

  const choose = useCallback(
    (next: TopicId | null) => {
      setTopic(next)
      setOpened(null)
      history.replaceState(history.state, '', `${window.location.pathname}${window.location.search}#gallery${next ? `/${next}` : ''}`)
      galleryRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    },
    [reducedMotion],
  )

  // Landing on /me/#gallery or /me/#gallery/<topic> opens straight onto the gallery.
  useEffect(() => {
    if (window.location.hash.startsWith('#gallery')) galleryRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    const onHash = () => setTopic(readTopic())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // The bar of tags shows once the tags have scrolled away and the gallery is on screen.
  useEffect(() => {
    const tags = tagsRef.current
    const gallery = galleryRef.current
    if (!tags || !gallery) return
    let tagsGone = false
    let galleryOn = false
    const watch = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === tags) tagsGone = !entry.isIntersecting
        else galleryOn = entry.isIntersecting
      }
      setDocked(tagsGone && galleryOn)
    })
    watch.observe(tags)
    watch.observe(gallery)
    return () => watch.disconnect()
  }, [])

  const current = topics.find((item) => item.id === topic)
  const countLabel = (count: number) => `${count} ${count === 1 ? me.photo.one : me.photo.many}`

  return (
    <div className="panel panel--grow">
      <Header page="me" />
      <main id="main" className="section container">
        <header className="section__header enter">
          <div>
            <p className="eyebrow">{me.kicker}</p>
            <h1 className="section__title">{me.title}</h1>
            <p className="section__lead">{me.lead}</p>
          </div>
        </header>

        <section className="me-topics" aria-label={me.topicsLabel}>
          <ul className="me-tags" ref={tagsRef}>
            {topics.map((item, index) => {
              const count = counts.get(item.id) ?? 0
              return (
                <li key={item.id} className="me-tags__item" style={{ '--tag-turn': `${me.turns[index % me.turns.length] ?? 0}deg` } as React.CSSProperties}>
                  <Reveal index={index}>
                    <a
                      className="me-tag"
                      href={`#gallery/${item.id}`}
                      onClick={(event) => {
                        event.preventDefault()
                        choose(item.id)
                      }}
                    >
                      <svg className="me-tag__string" viewBox="0 0 24 30" aria-hidden="true" focusable="false">
                        <path d="M12 29C5 22 3 12 8 6s11-4 10 4-4 13-6 19" />
                      </svg>
                      <span className="me-tag__card">
                        <span className="me-tag__hole" aria-hidden="true" />
                        <TopicArt topic={item.id} />
                        <span className="me-tag__title">{item.title}</span>
                        {/* The line is kept even with no photos yet, so every tag's title sits at the same height. */}
                        <span className="me-tag__count" aria-hidden={count ? undefined : true}>
                          {count ? countLabel(count) : '\u00a0'}
                        </span>
                      </span>
                    </a>
                  </Reveal>
                </li>
              )
            })}
          </ul>
          <a
            className="me-cue"
            href="#gallery"
            onClick={(event) => {
              event.preventDefault()
              choose(null)
            }}
          >
            <span>{me.everyPhoto}</span>
            <Icon name="arrowDown" size={14} />
          </a>
        </section>

        <nav className="me-dock" aria-label={me.gallery.dockLabel} data-shown={docked || undefined}>
          <div className="me-dock__bar">
            <button type="button" className="me-dock__pill" aria-pressed={topic === null} onClick={() => choose(null)} tabIndex={docked ? 0 : -1}>
              {me.gallery.all}
            </button>
            {topics.map((item) => (
              <button
                key={item.id}
                type="button"
                className="me-dock__pill"
                aria-pressed={topic === item.id}
                onClick={() => choose(item.id)}
                tabIndex={docked ? 0 : -1}
              >
                {item.title}
              </button>
            ))}
          </div>
        </nav>

        <section id="gallery" className="me-gallery" ref={galleryRef} aria-labelledby="me-gallery-title">
          <h2 className="visually-hidden" id="me-gallery-title">
            {me.gallery.label}
          </h2>
          <p className="me-gallery__showing" aria-live="polite">
            <span className="me-gallery__name">{current ? current.title : me.everyPhoto}</span>
            <span className="me-gallery__count">{countLabel(shown.length)}</span>
            {current ? (
              <button type="button" className="me-gallery__all" onClick={() => choose(null)}>
                {me.gallery.showAll}
              </button>
            ) : null}
          </p>
          {shown.length ? (
            <Gallery photos={shown} onOpen={setOpened} label={current ? current.title : me.everyPhoto} />
          ) : (
            <p className="me-gallery__empty">{me.gallery.empty}</p>
          )}
        </section>

        {/* Back to the professional side on the left, onward to contact on the right. */}
        <nav className="page-onward" aria-label="Continue">
          {features.experience ? (
            <ActionLink href={hrefTo('experience')} icon="arrowLeft" iconFirst>
              {me.back}
            </ActionLink>
          ) : (
            <span />
          )}
          {features.contact ? (
            <ActionLink href={hrefTo(`#${site.contact.id}`)} icon="arrowRight">
              {me.onward}
            </ActionLink>
          ) : null}
        </nav>
      </main>

      {opened !== null ? <PhotoViewer photos={shown} index={opened} onIndex={setOpened} onClose={() => setOpened(null)} /> : null}
    </div>
  )
}
