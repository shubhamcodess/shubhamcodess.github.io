import { site } from '../config/site'
import type { RouteId } from '../config/types'
import { hrefTo } from '../lib/routes'
import { Toggles } from './Toggles'
import './footer.css'

/**
 * Sits straight on the backplate, outside the panels. It is the site's index (every page, from every page)
 * and carries the sound and theme switches, so they are in reach from anywhere.
 */
export function Footer() {
  const { features, routes, contact } = site
  const pages: readonly RouteId[] = ['home', 'builds', 'experience', 'credentials']
  const shown = pages.filter(
    (id) => id === 'home' || (id === 'builds' ? features.buildsPage : id === 'experience' ? features.experience : features.credentials),
  )

  return (
    <footer className="site-footer container">
      <p className="site-footer__owner">
        © {new Date().getFullYear()} {site.owner}
      </p>
      <nav className="site-footer__links" aria-label="Site index">
        {shown.map((id) => (
          <a key={id} href={hrefTo(id)}>
            {routes[id].label}
          </a>
        ))}
        {features.contact ? <a href={hrefTo(`#${contact.id}`)}>{contact.kicker}</a> : null}
      </nav>
      <div className="site-footer__toggles">
        <Toggles />
      </div>
    </footer>
  )
}
