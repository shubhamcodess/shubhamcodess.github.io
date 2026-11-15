import { site } from '../../config/site'
import { credentials } from '../../content/experience'
import { toolGroups } from '../../content/tools'
import { hrefTo } from '../../lib/routes'
import { ActionLink } from '../../ui/ActionLink'
import { Reveal } from '../../ui/Reveal'
import './experience.css'

/**
 * The home page's short version: the headline, the ways to the full pages, and the tools of the trade
 * drifting past in rows, so a quick scan shows what the work was done with.
 */
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

        <Reveal index={1} className="tools">
          <h3 className="eyebrow">{copy.toolsLabel}</h3>
          {toolGroups.map((group, row) => (
            <div key={group.label} className="tools__row" role="group" aria-label={group.label}>
              {/* The list runs twice so the drift can loop without a seam. The copy is hidden from screen readers. */}
              {[false, true].map((copyOf) => (
                <ul
                  key={String(copyOf)}
                  className="tools__track"
                  aria-hidden={copyOf}
                  style={
                    { '--tools-direction': row % 2 ? 'reverse' : 'normal', '--tools-count': group.tools.length } as React.CSSProperties
                  }
                >
                  {group.tools.map((tool) => (
                    <li key={tool}>{tool}</li>
                  ))}
                </ul>
              ))}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
