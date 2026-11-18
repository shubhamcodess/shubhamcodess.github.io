import { site } from '../config/site'
import type { RouteId } from '../config/types'
import { builds, type BuildSlug } from '../content/builds'
import type { Build } from '../content/types'

const routeIds = Object.keys(site.routes) as RouteId[]

export function isRouteId(value: string | undefined): value is RouteId {
  return routeIds.some((id) => id === value)
}

/** The address of a route, or of a section on the home page, under whatever base the site is served from. */
export function hrefTo(target: RouteId | `#${string}`): string {
  const base = import.meta.env.BASE_URL
  return target.startsWith('#') ? `${base}${target}` : `${base}${site.routes[target as RouteId].path}`
}

/** The address of a build's own page. */
export function hrefToBuild(slug: BuildSlug | string): string {
  return `${hrefTo('builds')}${slug}/`
}

/** The build a project page is for, read from the last part of the address. */
export function buildFromPath(pathname: string): Build | undefined {
  const slug = pathname.split('/').filter(Boolean).at(-1)
  return builds.find((build) => build.slug === slug)
}

/** One entry in the site index: a page, or the contact section on home. */
export interface SitePage {
  readonly id: RouteId | 'contact'
  readonly label: string
  readonly href: string
}

/**
 * Every page that is switched on, in the site's order, then Contact. The footer and the dock both list these,
 * so a new page joins both by being added here.
 */
export function sitePages(): readonly SitePage[] {
  const { features, routes, contact } = site
  const order: readonly RouteId[] = ['home', 'builds', 'experience', 'credentials', 'me']
  const enabled: Readonly<Record<RouteId, boolean>> = {
    home: true,
    builds: features.buildsPage,
    experience: features.experience,
    credentials: features.credentials,
    me: features.mePage,
  }
  const pages: SitePage[] = order.filter((id) => enabled[id]).map((id) => ({ id, label: routes[id].label, href: hrefTo(id) }))
  if (features.contact) pages.push({ id: 'contact', label: contact.kicker, href: hrefTo(`#${contact.id}`) })
  return pages
}
