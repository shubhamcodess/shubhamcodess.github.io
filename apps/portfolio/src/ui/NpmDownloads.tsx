import type { SiteConfig } from '../config/types'
import { compactCount, npmPackageOf, useNpmTotal } from '../lib/npmDownloads'
import './npm-downloads.css'

interface NpmDownloadsProps {
  /** The link the numbers belong to. Anything but an npmjs.com package link shows nothing. */
  readonly href: string
  /** `npmDownloads` from the config. */
  readonly settings: SiteConfig['npmDownloads']
}

const arrow = (
  <svg viewBox="0 0 9 9" aria-hidden="true" focusable="false">
    <path d="M4.5 1v6.4M1.6 4.8l2.9 2.8 2.9-2.8" />
  </svg>
)

/**
 * A package link's live download total, set inside its label: "npm ↓1.3k".
 * Nothing at all until there is a number worth showing.
 */
export function NpmDownloads({ href, settings }: NpmDownloadsProps) {
  const total = useNpmTotal(npmPackageOf(href), settings.ttlMinutes * 60_000)
  if (total === null || total < settings.min) return null

  return (
    <span className="npm-downloads">
      <span className="visually-hidden">, {total} downloads in total</span>
      <span className="npm-downloads__row" aria-hidden="true">
        {arrow}
        {compactCount(total)}
      </span>
    </span>
  )
}
