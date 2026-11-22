// Reads the owner's Substack feed and writes src/content/writing.json: the latest posts, newest first, for the
// home page's writing list. Runs with `pnpm data`; the file is committed, so the site builds without the network.
import { writeFile } from 'node:fs/promises'

const feed = 'https://theshubhamprakash.substack.com/feed'
const keep = 5

const response = await fetch(feed, { signal: AbortSignal.timeout(15_000) })
if (!response.ok) throw new Error(`Substack answered ${response.status}`)
const xml = await response.text()

const text = (value) =>
  value
    .replace(/^<!\[CDATA\[|\]\]>$/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .trim()
const field = (item, name) => {
  const match = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))
  return match ? text(match[1]) : ''
}

const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  .map(([, item]) => ({
    title: field(item, 'title'),
    href: field(item, 'link'),
    where: 'substack',
    date: new Date(field(item, 'pubDate')).toISOString().slice(0, 10),
  }))
  .filter((post) => post.title && post.href.startsWith('https://'))
  .slice(0, keep)

await writeFile(new URL('../src/content/writing.json', import.meta.url), `${JSON.stringify(posts, null, 2)}\n`)
console.log(`writing: ${posts.length} posts from Substack`)
