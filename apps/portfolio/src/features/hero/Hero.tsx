import { useRef } from 'react'
import { site } from '../../config/site'
import { hrefTo } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { useHeroScene } from './useHeroScene'
import './hero.css'

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { hero, features } = site
  const [firstName, lastName] = hero.name

  useHeroScene(heroRef, canvasRef, { light: features.heroLight, parallax: features.heroParallax, config: hero.light })

  return (
    <div className="hero" ref={heroRef} data-light="off">
      <div className="hero__backdrop" aria-hidden="true">
        <canvas className="hero__light" ref={canvasRef} />
      </div>

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
