import { useEffect, useRef } from 'react'
import { site } from '../../config/site'
import { employers, recognition, type Recognition } from '../../content/experience'
import { Header } from '../../layout/Header'
import { hrefTo } from '../../lib/routes'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { ActionLink } from '../../ui/ActionLink'
import { Reveal } from '../../ui/Reveal'
import './experience.css'

function HonourText({ title, when, by }: Recognition) {
  return (
    <span className="honour__text">
      <span className="honour__when">{when}</span>
      <span className="honour__title">{title}</span>
      {by ? <span className="eyebrow">{by}</span> : null}
    </span>
  )
}

/** How far down the viewport the light's head sits, 0 (top) to 1 (bottom). */
const headLine = 0.65

/**
 * The career as layers on one lane of light: the present at the top, each employer a layer beneath it.
 * The lane fills as the page scrolls. A new employer in the content becomes a new layer on top.
 */
export function ExperiencePage() {
  const { experience: copy, credentialsPage, features } = site
  const careerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const career = careerRef.current
    if (!career) return
    if (reducedMotion) {
      career.style.setProperty('--career-progress', '1')
      return
    }
    let frame = 0
    const update = () => {
      frame = 0
      const box = career.getBoundingClientRect()
      const progress = (window.innerHeight * headLine - box.top) / Math.max(1, box.height)
      career.style.setProperty('--career-progress', Math.min(1, Math.max(0, progress)).toFixed(4))
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
    <div className="panel panel--grow">
      <Header page="experience" />
      <main id="main" className="section container">
        <header className="section__header enter">
          <div>
            <h1 className="section__title">{copy.page.title}</h1>
            <p className="section__lead">{copy.page.lead}</p>
          </div>
        </header>

        <div className="career" ref={careerRef}>
          <div className="career__lane" aria-hidden="true">
            <span className="career__run" />
          </div>

          {employers.map((employer) => (
            <section key={employer.name} className="career__layer" aria-label={employer.name}>
              <p className="career__mark">
                <span className="career__node" aria-hidden="true" />
                {employer.to ?? copy.labels.now}
              </p>

              <div className="career__body">
                <Reveal className="career__employer">
                  <h2 className="career__name">{employer.name}</h2>
                  <p className="career__meta">
                    <span>
                      {employer.from} to {employer.to ?? copy.labels.now.toLowerCase()}
                    </span>
                    <span>{employer.place}</span>
                  </p>
                </Reveal>

                {employer.roles.map((role, index) => (
                  <Reveal key={role.title} index={index}>
                    <article className="role">
                      <p className="role__span">
                        {role.from} to {role.to ?? copy.labels.now.toLowerCase()}
                      </p>
                      <h3 className="role__title">{role.title}</h3>
                      <p className="role__scope">{role.scope}</p>
                      <div className="role__columns">
                        <div>
                          <h4 className="eyebrow">{copy.labels.built}</h4>
                          <ul className="role__list">
                            {role.built.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="eyebrow">{copy.labels.delivered}</h4>
                          <ul className="role__list">
                            {role.delivered.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <ul className="build-stack" aria-label="Worked with">
                        {role.tools.map((tool) => (
                          <li key={tool}>{tool}</li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                ))}
              </div>

              <p className="career__mark career__mark--from">
                <span className="career__node" aria-hidden="true" />
                {employer.from}
              </p>
            </section>
          ))}
        </div>

        {recognition.length > 0 ? (
          <section className="honours" aria-labelledby="recognition-title">
            <Reveal>
              <h2 className="honours__title" id="recognition-title">
                {copy.labels.recognition}
              </h2>
              <p className="section__lead">{copy.labels.recognitionLead}</p>
            </Reveal>
            <ul className="honours__list">
              {recognition.map((item, index) => (
                <li key={item.title}>
                  <Reveal index={index} className="reveal-fill">
                    {item.certificate ? (
                      // The framed certificate. Hovering shows it large beside the pointer; a tap or Enter opens it.
                      <a
                        className="honour"
                        data-tilt=""
                        href={`${import.meta.env.BASE_URL}${item.certificate}`}
                        target="_blank"
                        rel="noopener"
                        data-hover-image={item.certificate}
                        data-hover-title={item.title}
                      >
                        <span className="honour__frame">
                          <img
                            src={`${import.meta.env.BASE_URL}${item.certificate}`}
                            alt={`Certificate: ${item.title}`}
                            loading="lazy"
                            decoding="async"
                          />
                        </span>
                        <HonourText {...item} />
                      </a>
                    ) : (
                      <div className="honour" data-tilt="">
                        <HonourText {...item} />
                      </div>
                    )}
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {features.credentials ? (
          <p className="page-onward">
            <ActionLink href={hrefTo('credentials')} icon="arrowRight">
              {credentialsPage.more}
            </ActionLink>
          </p>
        ) : null}
      </main>
    </div>
  )
}
