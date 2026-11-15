import { useEffect, useState } from 'react'

/*
 * Live npm download totals, read from npm's public API after the page loads. npm answers at most 18 months
 * per request, so the total adds up 18-month spans back from today until one comes back empty. Each total is
 * kept in localStorage for a while, so moving between pages doesn't ask again. Nothing here throws: when npm
 * can't be reached the number is simply not shown.
 */

interface Stored {
  readonly total: number
  readonly at: number
}

const storagePrefix = 'npm-total:'
const requests = new Map<string, Promise<number | null>>()
const day = 86_400_000
const span = 540 * day
/** npm's download counts begin here. */
const firstDay = Date.UTC(2015, 0, 10)

/** The package name from an npmjs.com link, scoped or not. Null for any other link. */
export function npmPackageOf(href: string): string | null {
  const match = /^https:\/\/www\.npmjs\.com\/package\/((?:@[\w.-]+\/)?[\w.-]+)\/?$/.exec(href)
  return match?.[1] ?? null
}

const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)

function readStored(pkg: string, ttlMs: number): number | null {
  try {
    const raw = localStorage.getItem(storagePrefix + pkg)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null) return null
    const { total, at } = value as Record<string, unknown>
    if (!isCount(total) || !isCount(at) || Date.now() - at > ttlMs) return null
    return total
  } catch {
    return null
  }
}

function store(pkg: string, total: number) {
  try {
    const value: Stored = { total, at: Date.now() }
    localStorage.setItem(storagePrefix + pkg, JSON.stringify(value))
  } catch {
    // Storage can be full or blocked; the number still shows for this page.
  }
}

async function countBetween(pkg: string, from: number, to: number): Promise<number> {
  const response = await fetch(`https://api.npmjs.org/downloads/point/${isoDay(from)}:${isoDay(to)}/${pkg}`)
  if (!response.ok) throw new Error(`npm answered ${response.status}`)
  const body: unknown = await response.json()
  const downloads = typeof body === 'object' && body !== null ? (body as Record<string, unknown>).downloads : undefined
  if (!isCount(downloads)) throw new Error('no download count in the answer')
  return downloads
}

async function countAll(pkg: string): Promise<number> {
  let total = 0
  for (let to = Date.now(); to > firstDay; to -= span + day) {
    const downloads = await countBetween(pkg, Math.max(firstDay, to - span), to)
    total += downloads
    if (downloads === 0) break
  }
  return total
}

/** One request per package per page load, shared by every link that shows it. */
export function loadNpmTotal(pkg: string, ttlMs: number): Promise<number | null> {
  const stored = readStored(pkg, ttlMs)
  if (stored !== null) return Promise.resolve(stored)
  let request = requests.get(pkg)
  if (!request) {
    request = countAll(pkg).then(
      (total) => {
        store(pkg, total)
        return total
      },
      () => null,
    )
    requests.set(pkg, request)
  }
  return request
}

/** The package's downloads since it was published, or null while loading or when npm can't be reached. */
export function useNpmTotal(pkg: string | null, ttlMs: number): number | null {
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!pkg) return
    let live = true
    void loadNpmTotal(pkg, ttlMs).then((value) => {
      if (live) setTotal(value)
    })
    return () => {
      live = false
    }
  }, [pkg, ttlMs])

  return total
}
/** 455, 1.2k, 12k, 1.2M. Rounds down, so it never claims more than the real number. */
export function compactCount(n: number): string {
  if (n < 1000) return String(Math.floor(n))
  const [unit, suffix] = n < 1e6 ? [1e3, 'k'] : [1e6, 'M']
  const value = n / unit
  const shown = value < 10 ? Math.floor(value * 10) / 10 : Math.floor(value)
  return `${shown}${suffix}`
}
