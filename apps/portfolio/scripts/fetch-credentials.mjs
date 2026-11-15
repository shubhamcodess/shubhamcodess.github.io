// Reads the owner's Credly wallet and writes public/data/credentials.json for the credentials page.
// Credly doesn't let other sites read it from a browser, so this runs here, at build time.
// The rules (what to leave out, extras, names, order) live in src/content/credentials-source.ts.
import { writeFile } from 'node:fs/promises'
import { credlyUser, exclude, extras, issuerNames, issuerOrder, titleRewrites } from '../src/content/credentials-source.ts'

const root = new URL('..', import.meta.url)
const today = new Date().toISOString().slice(0, 10)

const badges = []
for (let page = 1; page < 20; page++) {
  const response = await fetch(`https://www.credly.com/users/${credlyUser}/badges.json?page=${page}&page_size=48`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`Credly answered ${response.status}`)
  const body = await response.json()
  badges.push(...(body.data ?? []))
  if (!body.metadata || body.metadata.current_page >= body.metadata.total_pages) break
}

const tidy = (title) => titleRewrites.reduce((text, [from, to]) => text.replaceAll(from, to), title).trim()

const fromCredly = badges
  .filter((badge) => badge.state === 'accepted')
  .filter((badge) => !badge.expires_at_date || badge.expires_at_date >= today)
  .map((badge) => {
    const name = badge.badge_template?.name ?? ''
    const issuer = badge.issuer?.entities?.[0]?.entity?.name ?? 'Other'
    return {
      name,
      record: {
        title: tidy(name),
        issuer: issuerNames[issuer] ?? issuer,
        href: `https://www.credly.com/badges/${badge.id}/public_url`,
        issued: badge.issued_at_date ?? undefined,
        expires: badge.expires_at_date ?? undefined,
      },
    }
  })
  .filter(({ name }) => !exclude.some((word) => name.includes(word)))
  .map(({ record }) => record)

// An extra replaces a Credly badge of the same title, for renewals Credly doesn't know about.
const titles = new Set(extras.map((extra) => extra.title))
const all = [
  ...fromCredly.filter((record) => !titles.has(record.title)),
  ...extras.filter((extra) => !extra.expires || extra.expires >= today),
]

const rank = (issuer) => {
  const at = issuerOrder.indexOf(issuer)
  return at === -1 ? issuerOrder.length : at
}
all.sort((a, b) => rank(a.issuer) - rank(b.issuer) || a.issuer.localeCompare(b.issuer) || (b.issued ?? '').localeCompare(a.issued ?? ''))

await writeFile(new URL('public/data/credentials.json', root), `${JSON.stringify(all, null, 2)}\n`)
console.log(`${all.length} credentials (${fromCredly.length} from Credly of ${badges.length} badges)`)
