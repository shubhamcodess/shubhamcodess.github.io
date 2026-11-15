import type { SiteConfig } from '../config/types'
import { compactCount, npmPackageOf, useNpmDownloads } from '../lib/npmDownloads'
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
 * A package link's live downloads, set inside its label: "npm ↓455 w · ↓1.8k m".
 * Nothing at all until there is a number worth showing.
 */
export function NpmDownloads({ href, settings }: NpmDownloadsProps) {
  const { ttlMinutes, min, monthlyWhenSameAsWeekly } = settings
  const pkg = npmPackageOf(href)
  const downloads = useNpmDownloads(pkg, ttlMinutes * 60_000)
  if (!downloads) return null

  const shown = [
    { key: 'weekly', value: downloads.weekly, unit: 'w', words: 'this week' },
    { key: 'monthly', value: downloads.monthly, unit: 'm', words: 'this month' },
  ].filter((count) => count.value >= min && (count.key === 'weekly' || monthlyWhenSameAsWeekly || count.value !== downloads.weekly))
  if (shown.length === 0) return null

  return (
    <span className="npm-downloads">
      <span className="visually-hidden">, {shown.map((count) => `${count.value} downloads ${count.words}`).join(', ')}</span>
      <span className="npm-downloads__row" aria-hidden="true">
        {shown.map((count) => (
          <span key={count.key} className="npm-downloads__count">
            {arrow}
            {compactCount(count.value)}
            <span className="npm-downloads__unit">{count.unit}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
