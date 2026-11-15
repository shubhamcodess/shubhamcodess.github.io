import { useEffect, useState } from 'react'

/*
 * Live npm download counts, read from npm's public API after the page loads. Each package's numbers are kept
 * in localStorage for a while, so moving between pages doesn't ask again. Nothing here throws: when npm can't
 * be reached the numbers are simply not shown.
 */

export interface NpmDownloads {
  /** Downloads in the last 7 days. */
  readonly weekly: number
  /** Downloads in the last 30 days. */
  readonly monthly: number
}

interface Stored extends NpmDownloads {
  readonly at: number
}

const storagePrefix = 'npm-downloads:'
const requests = new Map<string, Promise<NpmDownloads | null>>()

/** The package name from an npmjs.com link, scoped or not. Null for any other link. */
export function npmPackageOf(href: string): string | null {
  const match = /^https:\/\/www\.npmjs\.com\/package\/((?:@[\w.-]+\/)?[\w.-]+)\/?$/.exec(href)
  return match?.[1] ?? null
}

const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0

function readStored(pkg: string, ttlMs: number): NpmDownloads | null {
  try {
    const raw = localStorage.getItem(storagePrefix + pkg)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null) return null
    const { weekly, monthly, at } = value as Record<string, unknown>
    if (!isCount(weekly) || !isCount(monthly) || !isCount(at) || Date.now() - at > ttlMs) return null
    return { weekly, monthly }
  } catch {
    return null
  }
}

function store(pkg: string, downloads: NpmDownloads) {
  try {
    const value: Stored = { ...downloads, at: Date.now() }
    localStorage.setItem(storagePrefix + pkg, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked; the numbers still show for this page.
  }
}

async function count(pkg: string, period: 'week' | 'month'): Promise<number> {
  const response = await fetch(`https://api.npmjs.org/downloads/point/last-${period}/${pkg}`)
  if (!response.ok) throw new Error(`npm answered ${response.status}`)
  const body: unknown = await response.json()
  const downloads = typeof body === 'object' && body !== null ? (body as Record<string, unknown>).downloads : undefined
  if (!isCount(downloads)) throw new Error('no download count in the answer')
  return downloads
}

/** One request per package per page load, shared by every link that shows it. */
export function loadNpmDownloads(pkg: string, ttlMs: number): Promise<NpmDownloads | null> {
  const stored = readStored(pkg, ttlMs)
  if (stored) return Promise.resolve(stored)
  let request = requests.get(pkg)
  if (!request) {
    request = Promise.all([count(pkg, 'week'), count(pkg, 'month')]).then(
      ([weekly, monthly]) => {
        const downloads = { weekly, monthly }
        store(pkg, downloads)
        return downloads
      },
      () => null,
    )
    requests.set(pkg, request)
  }
  return request
}

/** The package's download counts, or null while loading or when npm can't be reached. */
export function useNpmDownloads(pkg: string | null, ttlMs: number): NpmDownloads | null {
  const [downloads, setDownloads] = useState<NpmDownloads | null>(null)

  useEffect(() => {
    if (!pkg) return
    let live = true
    void loadNpmDownloads(pkg, ttlMs).then((value) => {
      if (live) setDownloads(value)
    })
    return () => {
      live = false
    }
  }, [pkg, ttlMs])

  return downloads
}

/** 455, 1.2k, 12k, 1.2M. Rounds down, so it never claims more than the real number. */
export function compactCount(n: number): string {
  if (n < 1000) return String(Math.floor(n))
  const [unit, suffix] = n < 1e6 ? [1e3, 'k'] : [1e6, 'M']
  const value = n / unit
  const shown = value < 10 ? Math.floor(value * 10) / 10 : Math.floor(value)
  return `${shown}${suffix}`
}
