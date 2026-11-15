import { useEffect, useRef } from 'react'
import { site } from '../../config/site'
import { hrefTo } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { LightBackdrop } from '../../ui/light/LightBackdrop'
import './hero.css'

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { hero, features } = site
  const [firstName, lastName] = hero.name

  // The actions lead into the page, so they bow out once the visitor is on their way.
  useEffect(() => {
    const element = heroRef.current
    if (!element) return
    const onScroll = () => {
      element.dataset.scrolled = String(window.scrollY > hero.actionsHideAfter)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hero.actionsHideAfter])

  return (
    <div className="hero" ref={heroRef}>
      <LightBackdrop config={hero.light} light={features.heroLight} parallax={features.heroParallax} />

      <div className="hero__content container">
        <div className="hero__intro">
          <h1 className="hero__name">
            <span className="enter" style={{ '--enter-index': 0 } as React.CSSProperties}>
              {firstName}
            </span>{' '}
            <span className="enter" style={{ '--enter-index': 1 } as React.CSSProperties}>
              {lastName}
            </span>
          </h1>
          <p className="hero__role enter" style={{ '--enter-index': 3 } as React.CSSProperties}>
            {hero.role} <span className="hero__at">at</span> {hero.employer}
          </p>
          <p className="hero__statement enter" style={{ '--enter-index': 4 } as React.CSSProperties}>
            {hero.statement}
          </p>
        </div>

        <nav className="hero__actions enter" aria-label="Start here" style={{ '--enter-index': 7 } as React.CSSProperties}>
          {hero.actions.map((action) => (
            <ActionLink
              key={action.to}
              href={hrefTo(action.to)}
              variant="glass"
              icon={action.to.startsWith('#') ? 'arrowDown' : 'arrowRight'}
            >
              {action.label}
            </ActionLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
