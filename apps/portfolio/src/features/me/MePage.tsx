import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { site } from '../../config/site'
import { home, pursuits, type Home, type Pursuit } from '../../content/me'
import { Header } from '../../layout/Header'
import { hrefTo } from '../../lib/routes'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { ActionLink } from '../../ui/ActionLink'
import { Icon } from '../../ui/Icon'
import { Reveal } from '../../ui/Reveal'
import { Art } from './Art'
import { Clothesline } from './Clothesline'
import { StateMap } from './StateMap'
import './me.css'

/** Every tile on the page, in order. The home tile is last. */
type Entry = { readonly kind: 'pursuit'; readonly item: Pursuit } | { readonly kind: 'home'; readonly item: Home }

const entries: readonly Entry[] = [...pursuits.map((item) => ({ kind: 'pursuit' as const, item })), { kind: 'home', item: home }]
const ids = new Set(entries.map((entry) => entry.item.id))

const readHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1))
  return ids.has(id) ? id : null
}

/** The face of a tile: its number or label, its name, and whatever content/me.ts gives it. */
function TileFace({ entry, index, open }: { readonly entry: Entry; readonly index: number; readonly open: boolean }) {
  const Title = open ? 'h1' : 'h2'
  if (entry.kind === 'home') {
    const { item } = entry
    return (
      <div className="me-frame__inner">
        {item.map && item.at ? <StateMap state={item.map} at={item.at} /> : null}
        {item.art ? <Art src={item.art} label={`${item.city}, ${item.region}`} /> : null}
        <div className="me-frame__text">
          <span className="eyebrow">{item.label}</span>
          <Title className="me-home__city">{item.city}</Title>
          <p className="me-home__region">{item.region}</p>
          {item.line ? <p className="me-frame__line">{item.line}</p> : null}
        </div>
      </div>
    )
  }
  const { item } = entry
  return (
    <div className="me-frame__inner">
      {item.art ? <Art src={item.art} label={item.title} /> : null}
      <div className="me-frame__text">
        <span className="eyebrow">{String(index + 1).padStart(2, '0')}</span>
        <Title className="me-frame__title">{item.title}</Title>
        {item.line ? <p className="me-frame__line">{item.line}</p> : null}
        {item.details?.length ? (
          <dl className="me-frame__details">
            {item.details.map((detail) => (
              <div key={detail.label}>
                <dt>{detail.label}</dt>
                <dd>{detail.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  )
}

const frameOf = (entry: Entry) => (entry.kind === 'home' ? 'sheet me-home' : entry.item.frame)
const titleOf = (entry: Entry) => (entry.kind === 'home' ? entry.item.city : entry.item.title)

/**
 * Life away from work. The page is a grid of framed tiles; each opens at /me/#<id>. When one is open the
 * others fold into a rail (a column on wide screens, a strip on phones) and the chosen tile grows into the
 * main panel, using a view transition so the tile visibly becomes the panel. Back, Esc or the browser's
 * Back button return to the grid. Every tile shows only what content/me.ts gives it.
 */
export function MePage() {
  const { me, features } = site
  const reducedMotion = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(readHash)

  // Changes the view inside a view transition when the browser has one, so tiles morph rather than jump.
  const show = useCallback(
    (id: string | null) => {
      const apply = () => {
        flushSync(() => setOpenId(id))
        document.getElementById('main')?.scrollIntoView({ block: 'start', behavior: 'instant' })
      }
      if (reducedMotion || !document.startViewTransition) apply()
      else document.startViewTransition(apply)
    },
    [reducedMotion],
  )

  useEffect(() => {
    const onHash = () => show(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [show])

  const close = useCallback(() => {
    history.pushState(history.state, '', `${window.location.pathname}${window.location.search}`)
    show(null)
  }, [show])

  useEffect(() => {
    if (!openId) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, close])

  // On phones the rail is a sideways strip: keep the open tile in view within it.
  useEffect(() => {
    document.querySelector('.me-rail__tile[aria-current]')?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'instant' })
  }, [openId])

  const open = entries.find((entry) => entry.item.id === openId)
  const openIndex = open ? entries.indexOf(open) : -1

  return (
    <div className="panel panel--grow">
      <Header page="me" />
      <main id="main" className="section container">
        <header className="section__header enter">
          <div>
            <p className="eyebrow">{me.kicker}</p>
            {open ? <p className="section__title">{me.title}</p> : <h1 className="section__title">{me.title}</h1>}
            {open ? null : <p className="section__lead">{me.lead}</p>}
          </div>
        </header>

        {open ? (
          <div className="me-open">
            <nav className="me-rail" aria-label={me.kicker}>
              {entries.map((entry, index) => (
                <a
                  key={entry.item.id}
                  className="me-rail__tile"
                  href={`#${entry.item.id}`}
                  {...(entry === open ? { 'aria-current': 'page' as const } : {})}
                  style={{ viewTransitionName: entry === open ? 'none' : `me-${entry.item.id}` }}
                >
                  <span className="eyebrow">{entry.kind === 'home' ? entry.item.label : String(index + 1).padStart(2, '0')}</span>
                  <span className="me-rail__title">{titleOf(entry)}</span>
                </a>
              ))}
            </nav>

            <article className={`me-detail me-frame me-frame--${frameOf(open)}`} style={{ viewTransitionName: `me-${open.item.id}` }}>
              {open.kind === 'home' && open.item.places?.length ? (
                <header className="me-places-head">
                  <p className="eyebrow">{me.placesKicker}</p>
                  <h1 className="me-places-head__title">{me.placesTitle}</h1>
                </header>
              ) : (
                <TileFace entry={open} index={openIndex} open />
              )}
              {open.kind === 'home' && open.item.places?.length ? (
                <ol className="me-places" aria-label={me.placesLabel}>
                  {open.item.places.map((place, index, all) => (
                    <li key={place.city} className="me-place" {...(index === all.length - 1 ? { 'aria-current': 'step' as const } : {})}>
                      <span className="me-place__node" aria-hidden="true" />
                      <div className="me-place__text">
                        <p className="eyebrow">{place.role}</p>
                        <h2 className="me-place__city">{place.city}</h2>
                        <p className="me-place__region">{place.region}</p>
                        {place.line ? <p className="me-place__line">{place.line}</p> : null}
                      </div>
                      <StateMap state={place.map} at={place.at} className="me-place__map" />
                      <Clothesline photos={place.photos ?? []} emptySlots={me.emptyPhotoSlots} />
                    </li>
                  ))}
                </ol>
              ) : null}
              {open.item.story?.length ? (
                <div className="me-detail__story">
                  {open.item.story.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </article>

            <p className="me-open__back">
              <a
                className="action-link action-link--text action-link--back"
                href={hrefTo('me')}
                onClick={(event) => {
                  event.preventDefault()
                  close()
                }}
              >
                <span>{me.backToAll}</span>
                <Icon name="arrowLeft" size={14} />
              </a>
            </p>
          </div>
        ) : (
          <ul className="me-grid">
            {entries.map((entry, index) => (
              <li
                key={entry.item.id}
                className={`me-tile me-tile--${entry.kind === 'home' ? 'home' : entry.item.size}`}
                style={{ '--me-turn': `${me.turns[index % me.turns.length] ?? 0}deg` } as React.CSSProperties}
              >
                <Reveal index={index} className="reveal-fill">
                  <a
                    className={`me-frame me-frame--${frameOf(entry)}`}
                    href={`#${entry.item.id}`}
                    data-tilt=""
                    style={{ viewTransitionName: `me-${entry.item.id}` }}
                  >
                    <TileFace entry={entry} index={index} open={false} />
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        )}

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
    </div>
  )
}
