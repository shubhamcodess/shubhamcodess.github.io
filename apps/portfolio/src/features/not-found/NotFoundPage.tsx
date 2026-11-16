import { site } from '../../config/site'
import { Header } from '../../layout/Header'
import { hrefTo } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { LightBackdrop } from '../../ui/light/LightBackdrop'
import '../hero/hero.css'
import './not-found.css'

const enter = (index: number) => ({ '--enter-index': index }) as React.CSSProperties

/** The page at any address with no page. It keeps home's header and night sky, says what went wrong, and leads on. */
export function NotFoundPage() {
  const { notFound, hero, features } = site
  const [before, after] = notFound.lead
  return (
    <main id="main" className="frame__main">
      <div className="panel panel--night not-found">
        <Header page="home" />
        <div className="hero">
          <LightBackdrop config={hero.light} light={features.heroLight} parallax={features.heroParallax} />
          <div className="hero__content container">
            <div className="hero__intro">
              <p className="not-found__code enter" style={enter(0)}>
                {notFound.code}
              </p>
              <h1 className="not-found__title enter" style={enter(1)}>
                {notFound.title}
              </h1>
              <p className="hero__statement not-found__lead enter" style={enter(2)}>
                {before}
                <code className="not-found__path">{window.location.pathname}</code>
                {after}
              </p>
            </div>
            <nav className="hero__actions enter" aria-label="Where to go" style={enter(4)}>
              {notFound.actions.map((action) => (
                <ActionLink key={action.to} href={hrefTo(action.to)} variant="glass" icon="arrowRight">
                  {action.label}
                </ActionLink>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </main>
  )
}
