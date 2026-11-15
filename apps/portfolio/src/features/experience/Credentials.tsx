import { site } from '../../config/site'
import { credentials } from '../../content/experience'
import { Icon } from '../../ui/Icon'
import { Reveal } from '../../ui/Reveal'

/** Certifications, grouped by who issued them. A credential with a public record links to it. */
export function Credentials() {
  const copy = site.experience.credentials
  const issuers = [...new Set(credentials.map((credential) => credential.issuer))]

  return (
    <div className="credentials" id={copy.id}>
      <Reveal>
        <h3 className="credentials__title">{copy.title}</h3>
        <p className="section__lead">{copy.lead}</p>
      </Reveal>
      <div className="credentials__groups">
        {issuers.map((issuer, index) => (
          <Reveal key={issuer} index={index} className="credentials__group">
            <h4 className="eyebrow">{issuer}</h4>
            <ul>
              {credentials
                .filter((credential) => credential.issuer === issuer)
                .map((credential) => (
                  <li key={credential.title}>
                    <Icon name="credential" size={16} />
                    {'href' in credential ? (
                      <a href={credential.href} target="_blank" rel="noopener noreferrer" aria-label={`${copy.verify}: ${credential.title}`}>
                        <span>{credential.title}</span>
                        <Icon name="arrowUpRight" size={12} />
                      </a>
                    ) : (
                      <span>{credential.title}</span>
                    )}
                  </li>
                ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
