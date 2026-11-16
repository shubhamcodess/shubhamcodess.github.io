// Reads the owner's Credly wallet and writes public/data/credentials.json for the credentials page.
// Credly doesn't let other sites read it from a browser, so this runs here, at build time.
// The rules (what to leave out, extras, names, order) live in src/content/credentials-source.ts.
import { access, writeFile } from 'node:fs/promises'
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
        image: badge.image_url,
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

// Each credential's own badge, from public/badges/<slug>.(webp|svg|png). A Credly badge with no file yet is
// downloaded as a PNG (shrink it to WebP by hand if it is large); the rest show the issuer's mark instead.
const slug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const exists = (path) => access(new URL(path, root)).then(() => true, () => false)
for (const record of all) {
  const image = record.image
  delete record.image
  for (const extension of ['webp', 'svg', 'png']) {
    const path = `badges/${slug(record.title)}.${extension}`
    if (await exists(`public/${path}`)) {
      record.badge = path
      break
    }
  }
  if (!record.badge && image) {
    const response = await fetch(image, { signal: AbortSignal.timeout(15_000) })
    if (response.ok) {
      const path = `badges/${slug(record.title)}.png`
      await writeFile(new URL(`public/${path}`, root), Buffer.from(await response.arrayBuffer()))
      record.badge = path
    }
  }
}

await writeFile(new URL('public/data/credentials.json', root), `${JSON.stringify(all, null, 2)}\n`)
console.log(`${all.length} credentials (${fromCredly.length} from Credly of ${badges.length} badges)`)
