import { site } from '../../config/site'
import type { CredentialRecord } from '../../content/credentials-source'
import { Header } from '../../layout/Header'
import { hrefTo } from '../../lib/routes'
import { useStaticData } from '../../lib/useStaticData'
import { ActionLink } from '../../ui/ActionLink'
import { Icon } from '../../ui/Icon'
import { Reveal } from '../../ui/Reveal'
import './credentials.css'

const anchor = (issuer: string) => `issuer-${issuer.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`

export const credentialsFile = 'data/credentials.json'

/** Every credential, indexed by who issued it. One with a public record links to it. The list is loaded at runtime. */
export function CredentialsPage() {
  const { credentialsPage: copy, experience, features } = site
  const result = useStaticData<readonly CredentialRecord[]>(credentialsFile)
  const credentials = result.state === 'ready' ? result.data : []
  const issuers = [...new Set(credentials.map((credential) => credential.issuer))].map((name) => ({
    name,
    items: credentials.filter((credential) => credential.issuer === name),
  }))

  return (
    <div className="panel panel--grow">
      <Header page="credentials" />
      <main id="main" className="section container">
        <header className="section__header enter">
          <div>
            <h1 className="section__title">{copy.title}</h1>
            <p className="section__lead">{copy.lead}</p>
          </div>
          {result.state === 'ready' ? <p className="eyebrow">{String(credentials.length).padStart(2, '0')} held</p> : null}
        </header>

        {result.state === 'loading' ? (
          <p className="creds__status" role="status">
            {copy.loading}
          </p>
        ) : null}
        {result.state === 'failed' ? (
          <p className="creds__status" role="status">
            {copy.failed}{' '}
            <a href={copy.wallet} target="_blank" rel="noopener noreferrer">
              {copy.walletLabel}
            </a>
          </p>
        ) : null}

        {result.state === 'ready' ? (
          <div className="creds">
            <nav className="creds__index" aria-label="Issuers">
              {issuers.map((issuer) => (
                <a key={issuer.name} href={`#${anchor(issuer.name)}`}>
                  <span>{issuer.name}</span>
                  <span>{String(issuer.items.length).padStart(2, '0')}</span>
                </a>
              ))}
            </nav>

            <div className="creds__groups">
              {issuers.map((issuer) => (
                <section
                  key={issuer.name}
                  id={anchor(issuer.name)}
                  className="creds__group"
                  aria-labelledby={`${anchor(issuer.name)}-title`}
                >
                  <Reveal>
                    <h2 className="creds__issuer" id={`${anchor(issuer.name)}-title`}>
                      {issuer.name}
                    </h2>
                  </Reveal>
                  <ul className="creds__list">
                    {issuer.items.map((credential, index) => (
                      <li key={credential.title}>
                        <Reveal index={index} className="reveal-fill">
                          <div className="cred" data-tilt="">
                            <Icon name="credential" size={20} />
                            <span className="cred__title">{credential.title}</span>
                            {credential.href ? (
                              <ActionLink href={credential.href} external label={`${copy.verify}: ${credential.title}`}>
                                {copy.verify}
                              </ActionLink>
                            ) : null}
                          </div>
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        ) : null}

        {features.experience ? (
          <p className="page-onward">
            <ActionLink href={hrefTo('experience')} icon="arrowRight">
              {experience.more}
            </ActionLink>
          </p>
        ) : null}
      </main>
    </div>
  )
}
