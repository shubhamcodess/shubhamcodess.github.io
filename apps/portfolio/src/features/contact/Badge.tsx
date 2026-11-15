import { useEffect, useRef, useState } from 'react'
import { site } from '../../config/site'
import { Icon } from '../../ui/Icon'
import { PortraitReveal } from './PortraitReveal'
import { useSwing } from './useSwing'
import './badge.css'

type Face = 'dev' | 'labs'

/**
 * The ID badge on its strap: the developer card in front, and the Labs card behind it,
 * hanging far enough to the side that its name can be read. Pressing the badge swaps the two.
 */
interface BadgeProps {
  /** Raise this number to play the arrival again: the portrait forms afresh and the badge swings. */
  readonly replay: number
}

export function Badge({ replay }: BadgeProps) {
  const { contact, owner, monogram, hero } = site
  const { badge } = contact
  const swingRef = useRef<HTMLSpanElement>(null)
  const [front, setFront] = useState<Face>('dev')
  useSwing(swingRef, badge.swing)

  useEffect(() => {
    if (replay > 0) swingRef.current?.dispatchEvent(new Event('swing:kick'))
  }, [replay])

  const swap = () => {
    setFront((current) => (current === 'dev' ? 'labs' : 'dev'))
    swingRef.current?.dispatchEvent(new Event('swing:kick'))
  }

  return (
    <button className="badge" type="button" onClick={swap} aria-label={badge.swapLabel} aria-pressed={front === 'labs'}>
      <span className="badge__swing" ref={swingRef}>
        <span className="badge__strap">
          <span className="badge__strap-mark">{badge.strap}</span>
        </span>
        <span className="badge__buckle" />
        <span className="badge__swivel">{monogram}</span>
        <span className="badge__ring" />
        <span className="badge__cards" data-front={front}>
          <span className="badge__card badge__card--labs" aria-hidden="true">
            <span className="badge__face">
              <span className="badge__row">
                <span>{badge.labs.status}</span>
              </span>
              <span className="badge__labs-name">{badge.labs.name}</span>
              <span className="badge__labs-by">{badge.labs.by}</span>
            </span>
          </span>
          <span className="badge__card badge__card--dev">
            <span className="badge__face">
              <span className="badge__row" aria-hidden="true">
                <span className="badge__monogram">{monogram}</span>
                <span className="badge__kind">{badge.kind}</span>
              </span>
              <span className="badge__window">
                <PortraitReveal key={replay} />
              </span>
              <span className="badge__id" aria-hidden="true">
                <span className="badge__name">{owner}</span>
                <span className="badge__role">{badge.role}</span>
                <span className="badge__handle">
                  {hero.employer} · {badge.handle}
                </span>
              </span>
              <span className="badge__row badge__row--foot" aria-hidden="true">
                <span>{badge.serial}</span>
                <span className="badge__swap">
                  <Icon name="arrowRight" size={14} />
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </button>
  )
}
