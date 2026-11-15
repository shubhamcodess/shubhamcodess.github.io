import { site } from '../config/site'
import { ActionLink } from '../ui/ActionLink'
import './footer.css'

/** Sits straight on the backplate, outside the panels. */
export function Footer() {
  return (
    <footer className="site-footer container">
      <p className="site-footer__owner">
        © {new Date().getFullYear()} {site.owner}
      </p>
      <ul className="site-footer__links">
        {(site.features.contact ? [] : site.contact.links).map((social) => (
          <li key={social.href}>
            <ActionLink href={social.href} external>
              {social.label}
            </ActionLink>
          </li>
        ))}
      </ul>
    </footer>
  )
}
