import { site } from '../config/site'
import { sitePages } from '../lib/routes'
import { Toggles } from './Toggles'
import './footer.css'

/**
 * Sits straight on the backplate, outside the panels. It is the site's index (every page, from every page)
 * and carries the sound and theme switches, so they are in reach from anywhere.
 */
export function Footer() {
  return (
    <footer className="site-footer container">
      <p className="site-footer__owner">
        © {new Date().getFullYear()} {site.owner}
      </p>
      <nav className="site-footer__links" aria-label="Site index">
        {sitePages().map((page) => (
          <a key={page.id} href={page.href}>
            {page.label}
          </a>
        ))}
      </nav>
      <div className="site-footer__toggles">
        <Toggles />
      </div>
    </footer>
  )
}
