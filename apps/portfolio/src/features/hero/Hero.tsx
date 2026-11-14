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
            <span>{firstName}</span> <span>{lastName}</span>
          </h1>
          <p className="hero__role">
            {hero.role} <span className="hero__at">at</span> {hero.employer}
          </p>
          <p className="hero__statement">{hero.statement}</p>
        </div>

        <nav className="hero__actions" aria-label="Start here">
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
