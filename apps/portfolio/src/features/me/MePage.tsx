import { site } from '../../config/site'
import { home, pursuits } from '../../content/me'
import { Header } from '../../layout/Header'
import { hrefTo } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { Reveal } from '../../ui/Reveal'
import { Art } from './Art'
import { KarnatakaMap } from './KarnatakaMap'
import './me.css'

/**
 * Life away from work, a step less formal than the rest of the site: tiles framed for what they hold,
 * set at slight angles on the paper. Every tile shows only what content/me.ts gives it.
 */
export function MePage() {
  const { me, features } = site

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

        <ul className="me-grid">
          {pursuits.map((pursuit, index) => (
            <li
              key={pursuit.id}
              className={`me-tile me-tile--${pursuit.size}`}
              style={{ '--me-turn': `${me.turns[index % me.turns.length] ?? 0}deg` } as React.CSSProperties}
            >
              <Reveal index={index} className="reveal-fill">
                <article className={`me-frame me-frame--${pursuit.frame}`} data-tilt="">
                  <div className="me-frame__inner">
                    {pursuit.art ? <Art src={pursuit.art} label={pursuit.title} /> : null}
                    <div className="me-frame__text">
                      <span className="eyebrow">{String(index + 1).padStart(2, '0')}</span>
                      <h2 className="me-frame__title">{pursuit.title}</h2>
                      {pursuit.line ? <p className="me-frame__line">{pursuit.line}</p> : null}
                      {pursuit.details?.length ? (
                        <dl className="me-frame__details">
                          {pursuit.details.map((detail) => (
                            <div key={detail.label}>
                              <dt>{detail.label}</dt>
                              <dd>{detail.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}

          <li className="me-tile me-tile--home" style={{ '--me-turn': `${me.turns.at(-1) ?? 0}deg` } as React.CSSProperties}>
            <Reveal index={pursuits.length} className="reveal-fill">
              <article className="me-frame me-frame--sheet me-home" data-tilt="">
                <div className="me-frame__inner">
                  {home.map === 'karnataka' ? <KarnatakaMap /> : null}
                  {home.art ? <Art src={home.art} label={`${home.city}, ${home.region}`} /> : null}
                  <div className="me-frame__text">
                    <span className="eyebrow">{home.label}</span>
                    <h2 className="me-home__city">{home.city}</h2>
                    <p className="me-home__region">{home.region}</p>
                    {home.line ? <p className="me-frame__line">{home.line}</p> : null}
                  </div>
                </div>
              </article>
            </Reveal>
          </li>
        </ul>

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
