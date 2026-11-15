import { site } from '../../config/site'
import { credentials, employers } from '../../content/experience'
import { hrefTo } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { Reveal } from '../../ui/Reveal'
import './experience.css'

/** The home page's short version: who, how long, which roles, and the way to the full pages. */
export function ExperienceTeaser() {
  const { experience: copy, credentialsPage, features } = site
  const headingId = `${copy.id}-title`

  return (
    <section className="panel section" id={copy.id} aria-labelledby={headingId}>
      <div className="container teaser">
        <Reveal>
          <p className="eyebrow">{copy.kicker}</p>
          <h2 className="section__title" id={headingId}>
            {copy.title}
          </h2>
          <p className="section__lead">{copy.lead}</p>
          <div className="teaser__links">
            <ActionLink href={hrefTo('experience')} icon="arrowRight">
              {copy.more}
            </ActionLink>
            {features.credentials ? (
              <ActionLink href={hrefTo('credentials')} icon="arrowRight">
                {credentialsPage.more} ({credentials.length})
              </ActionLink>
            ) : null}
          </div>
        </Reveal>
        <ol className="teaser__roles">
          {employers.flatMap((employer) =>
            employer.roles.map((role, index) => (
              <li key={`${employer.name}-${role.title}`}>
                <Reveal index={index}>
                  <a className="teaser__role" href={hrefTo('experience')}>
                    <span className="eyebrow">
                      {employer.name} · {index === 0 && employer.to === undefined ? copy.labels.now : employer.from}
                    </span>
                    <span className="teaser__title">{role.title}</span>
                    <span className="teaser__scope">{role.scope}</span>
                  </a>
                </Reveal>
              </li>
            )),
          )}
        </ol>
      </div>
    </section>
  )
}
