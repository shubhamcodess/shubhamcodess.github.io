import { site } from '../config/site'
import type { RouteId } from '../config/types'

const routeIds = Object.keys(site.routes) as RouteId[]

export function isRouteId(value: string | undefined): value is RouteId {
  return routeIds.some((id) => id === value)
}

/** The address of a route, or of a section on the home page, under whatever base the site is served from. */
export function hrefTo(target: RouteId | `#${string}`): string {
  const base = import.meta.env.BASE_URL
  return target.startsWith('#') ? `${base}${target}` : `${base}${site.routes[target as RouteId].path}`
}
