// Fetches the social preview (title, description, image) of every outside link on the site,
// and saves it for the hover card. Run it when links change:  pnpm --filter @portfolio/app previews
// A browser can't read another site's preview tags, so this happens at build time, and the
// images are stored here so visitors never contact those sites until they click.
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'

const root = new URL('..', import.meta.url)
const maxImageBytes = 1_500_000
const imageTypes = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' }

const sources = ['src/content/builds.ts', 'src/config/site.ts', 'src/content/experience.ts']
const links = new Set()
for (const file of sources) {
  const text = await readFile(new URL(file, root), 'utf8')
  for (const match of text.matchAll(/href: '(https:\/\/[^']+)'/g)) links.add(match[1])
}

const meta = (html, key) => {
  const tag = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*>`, 'i'))?.[0]
  const value = tag?.match(/content=["']([^"']*)["']/i)?.[1]
  return value?.replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').trim()
}

const previews = {}
await mkdir(new URL('public/previews/', root), { recursive: true })

for (const href of links) {
  try {
    const page = await fetch(href, { headers: { 'user-agent': 'link-preview-fetcher', accept: 'text/html' }, signal: AbortSignal.timeout(12_000) })
    if (!page.ok) throw new Error(`HTTP ${page.status}`)
    const html = await page.text()
    const title = meta(html, 'og:title') ?? html.match(/<title[^>]*>([^<]*)/i)?.[1]?.trim()
    const imageUrl = meta(html, 'og:image') ?? meta(html, 'twitter:image')
    if (!title) throw new Error('no title')
    const preview = { title, description: meta(html, 'og:description') ?? meta(html, 'description') ?? '' }

    if (imageUrl) {
      const image = await fetch(new URL(imageUrl, href), { signal: AbortSignal.timeout(12_000) })
      const extension = imageTypes[image.headers.get('content-type')?.split(';')[0] ?? '']
      const bytes = Buffer.from(await image.arrayBuffer())
      if (image.ok && extension && bytes.length <= maxImageBytes) {
        const name = `${createHash('sha1').update(href).digest('hex').slice(0, 12)}.${extension}`
        await writeFile(new URL(`public/previews/${name}`, root), bytes)
        preview.image = `previews/${name}`
      }
    }
    previews[href] = preview
    console.log('ok  ', href)
  } catch (error) {
    console.log('skip', href, String(error.message ?? error))
  }
}

await writeFile(new URL('src/content/link-previews.json', root), `${JSON.stringify(previews, null, 2)}\n`)
console.log(`${Object.keys(previews).length} of ${links.size} links have a preview`)
