import { useEffect, useRef } from 'react'
import { site } from '../../config/site'
import { experience } from '../../content/experience'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { Reveal } from '../../ui/Reveal'
import { Credentials } from './Credentials'
import { ExperienceRecord } from './ExperienceRecord'
import './experience.css'

/** How far down the viewport the light's head sits, 0 (top) to 1 (bottom). */
const headLine = 0.6

/**
 * The career as one lane of light. The lane fills as the page scrolls, and each chapter
 * comes up to full strength when the light reaches it. With reduced motion everything is lit.
 */
function ExperienceStory() {
  const listRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const chapters = Array.from(list.querySelectorAll<HTMLElement>('.xp__chapter'))
    if (reducedMotion) {
      list.style.setProperty('--xp-progress', '1')
      for (const chapter of chapters) chapter.dataset.lit = 'true'
      return
    }

    let frame = 0
    const update = () => {
      frame = 0
      const head = window.innerHeight * headLine
      const box = list.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, (head - box.top) / Math.max(1, box.height)))
      list.style.setProperty('--xp-progress', progress.toFixed(4))
      for (const chapter of chapters) {
        chapter.dataset.lit = String(chapter.getBoundingClientRect().top < head)
      }
    }
    const schedule = () => {
      frame ||= requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [reducedMotion])

  return (
        <div className="xp" ref={listRef}>
          <div className="xp__rail" aria-hidden="true">
            <span className="xp__run" />
          </div>
          <ol className="xp__list">
          {experience.map((chapter, index) => (
            <li key={chapter.title} className="xp__chapter" data-lit="false">
              <p className="xp__stop">
                <span className="xp__count">{String(index + 1).padStart(2, '0')}</span>
                {chapter.stop}
              </p>
              <span className="xp__node" aria-hidden="true" />
              <div className="xp__body">
                <h3 className="xp__title">{chapter.title}</h3>
                <p className="xp__role">{chapter.role}</p>
                <p className="xp__line">{chapter.line}</p>
                <ul className="xp__log">
                  {chapter.log.map((entry) => (
                    <li key={entry.what}>
                      <span className="xp__verb">{entry.verb}</span>
                      <span>{entry.what}</span>
                    </li>
                  ))}
                </ul>
                <ul className="build-stack" aria-label="Worked with">
                  {chapter.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              </div>
            </li>
            ))}
          </ol>
        </div>
  )
}

export function ExperienceSection() {
  const { experience: copy, features } = site
  const headingId = `${copy.id}-title`

  return (
    <section className="panel section" id={copy.id} aria-labelledby={headingId}>
      <div className="container">
        <Reveal className="section__header">
          <div>
            <p className="eyebrow">{copy.kicker}</p>
            <h2 className="section__title" id={headingId}>
              {copy.title}
            </h2>
            <p className="section__lead">{copy.lead}</p>
          </div>
        </Reveal>
        {copy.variant === 'record' ? <ExperienceRecord /> : <ExperienceStory />}
        {features.credentials ? <Credentials /> : null}
      </div>
    </section>
  )
}
