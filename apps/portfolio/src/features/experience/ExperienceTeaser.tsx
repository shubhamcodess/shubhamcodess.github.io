import { site } from '../../config/site'
import type { CredentialRecord } from '../../content/credentials-source'
import { employers, featuredCredentials } from '../../content/experience'
import { credentialsFile } from '../credentials/CredentialsPage'
import { toolGroups } from '../../content/tools'
import { hrefTo } from '../../lib/routes'
import { useStaticData } from '../../lib/useStaticData'
import { ActionLink } from '../../ui/ActionLink'
import { Icon } from '../../ui/Icon'
import { Reveal } from '../../ui/Reveal'
import './experience.css'

/**
 * The home page's short version. Left: the headline and the way to the full experience, then three
 * featured credentials as patches and the way to all of them.
 * Right: every role as a card on one lane, with its years and one line on what it covered, so the whole span reads at a glance with no gaps.
 * Underneath, inside the same page edge: one lean, quiet strip of the tools the work was done with.
 */
export function ExperienceTeaser() {
  const { experience: copy, credentialsPage, features } = site
  const headingId = `${copy.id}-title`
  const credentials = useStaticData<readonly CredentialRecord[]>(credentialsFile)
  const tools = toolGroups.flatMap((group) => group.tools)

  return (
    <section className="panel section teaser-section" id={copy.id} aria-labelledby={headingId}>
      <div className="container teaser">
        <div className="teaser__side">
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
            </div>
          </Reveal>

          {features.credentials ? (
            <Reveal index={1} className="teaser__creds">
              <h3 className="teaser__creds-title">{credentialsPage.title}</h3>
              <p className="section__lead">{copy.credentialsLead}</p>
              <ul className="patches">
                {featuredCredentials.map((credential) => (
                  <li key={credential.href}>
                    <a
                      className="patch"
                      href={credential.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-tilt=""
                      aria-label={`${credentialsPage.verify}: ${credential.title}, ${credential.level}, ${credential.issuer}`}
                    >
                      <span className="patch__level">{credential.level}</span>
                      <span className="patch__title">{credential.title}</span>
                      <span className="patch__issuer">{credential.issuer}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="teaser__links">
                <ActionLink href={hrefTo('credentials')} icon="arrowRight">
                  {credentialsPage.more}
                  {credentials.state === 'ready' ? ` (${credentials.data.length})` : null}
                </ActionLink>
              </div>
            </Reveal>
          ) : null}
        </div>

        <div className="teaser__spans">
          {employers.map((employer) => (
            <Reveal key={employer.name} index={1}>
              <p className="eyebrow teaser__employer">
                <span>{employer.name}</span>
                <span>
                  {employer.from} to {employer.to ?? copy.labels.now.toLowerCase()}
                </span>
              </p>
              <ol className="teaser__roles">
                {employer.roles.map((role) => (
                  <li key={role.title}>
                    <a className="teaser__role" href={hrefTo('experience')} data-tilt="">
                      <span className="teaser__years">
                        {role.from} to {role.to ?? copy.labels.now.toLowerCase()}
                      </span>
                      <span className="teaser__title">{role.title}</span>
                      <span className="teaser__scope">{role.scope}</span>
                      <Icon name="arrowRight" size={14} />
                    </a>
                  </li>
                ))}
              </ol>
            </Reveal>
          ))}
        </div>

        <div className="tools" role="group" aria-label={copy.toolsLabel}>
          {/* The list runs twice so the drift can loop without a seam. The copy is hidden from screen readers. */}
          {[false, true].map((copyOf) => (
            <ul
              key={String(copyOf)}
              className="tools__track"
              aria-hidden={copyOf}
              style={{ '--tools-count': tools.length } as React.CSSProperties}
            >
              {tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  )
}
