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
