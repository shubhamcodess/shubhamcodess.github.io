import { useState } from 'react'
import { site } from '../../config/site'
import { hrefTo } from '../../lib/routes'
import { Icon } from '../../ui/Icon'
import { Reveal } from '../../ui/Reveal'
import { Badge } from './Badge'
import './contact.css'

export function ContactSection() {
  const { contact } = site
  const headingId = `${contact.id}-title`
  const [replay, setReplay] = useState(0)

  return (
    <section className="panel panel--night contact" id={contact.id} aria-labelledby={headingId}>
      <div className="contact__grid container">
        <Reveal className="contact__copy">
          <p className="eyebrow">{contact.kicker}</p>
          <h2 className="contact__title" id={headingId}>
            {contact.title}
          </h2>
          <p className="contact__lead">{contact.lead}</p>
          <a className="contact__mail" href={`mailto:${contact.email}`}>
            <Icon name="mail" size={20} />
            <span>{contact.email}</span>
          </a>
          <p className="eyebrow contact__find">{contact.findLabel}</p>
          <ul className="contact__list">
            {contact.links.map((link) => (
              <li key={link.href}>
                <a className="contact__row" href={link.href} target="_blank" rel="noopener noreferrer">
                  <Icon name={link.icon} size={18} />
                  <span className="contact__row-label">{link.label}</span>
                  <span className="contact__row-detail">{link.detail}</span>
                  <Icon name="arrowUpRight" size={14} />
                </a>
              </li>
            ))}
          </ul>
          {site.features.mePage ? (
            <a className="contact__offclock" href={hrefTo('me')}>
              <span>{contact.offClock}</span>
              <Icon name="arrowRight" size={14} />
            </a>
          ) : null}
        </Reveal>
        <div className="contact__badge">
          <Badge replay={replay} />
        </div>
      </div>
      <button
        className="contact__replay"
        type="button"
        onClick={() => setReplay((count) => count + 1)}
        aria-label={contact.badge.replayLabel}
      >
        <Icon name="replay" size={13} />
      </button>
    </section>
  )
}
