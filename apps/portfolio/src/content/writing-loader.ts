/**
 * Reads the writing: one folder per piece in content/writing/, its index.md the post, everything else in the folder
 * its material (pictures, sketches, diagrams). Runs at build time only (the Vite config and its plugin call it).
 * The front matter is strictly typed: anything missing, misspelt or unknown fails the build, naming the file.
 * Markdown becomes HTML here, once, so a post ships no parser and no script of its own.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import matter from 'gray-matter'
import { Marked, type Tokens } from 'marked'
import type { WritingFact, WritingKind, WritingMeta, WritingNumber, WritingPiece, WritingSection } from './types'

export const writingDir = new URL('../../content/writing/', import.meta.url)

const kinds: readonly WritingKind[] = ['essay', 'case-study', 'research']
const mastheads = ['letter', 'torn'] as const
const allowed = new Set(['title', 'summary', 'date', 'kind', 'category', 'tags', 'draft', 'masthead', 'private', 'facts', 'numbers', 'note'])
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** The files a post may use beside its index.md, and how the site serves them. */
export const materialTypes: Readonly<Record<string, string>> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

class WritingError extends Error {}
const fail = (file: string, message: string): never => {
  throw new WritingError(`content/writing/${file}: ${message}`)
}

const text = (file: string, data: Record<string, unknown>, key: string, required: boolean): string | undefined => {
  const value = data[key]
  if (value === undefined || value === null || value === '') return required ? fail(file, `"${key}" is required`) : undefined
  if (typeof value !== 'string') return fail(file, `"${key}" must be text`)
  return value.trim()
}

const pairs = <T>(file: string, data: Record<string, unknown>, key: string, make: (row: Record<string, unknown>) => T): T[] => {
  const value = data[key]
  if (value === undefined) return []
  if (!Array.isArray(value)) return fail(file, `"${key}" must be a list`)
  return value.map((row, index) => {
    if (typeof row !== 'object' || row === null) return fail(file, `"${key}" item ${index + 1} must be { label, value }`)
    return make(row as Record<string, unknown>)
  })
}

/** The front matter, checked field by field. */
function frontMatter(file: string, data: Record<string, unknown>) {
  for (const key of Object.keys(data)) if (!allowed.has(key)) fail(file, `unknown field "${key}"`)

  const rawDate = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date
  if (typeof rawDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate) || Number.isNaN(Date.parse(rawDate)))
    fail(file, '"date" must be YYYY-MM-DD')

  const kind = data.kind
  if (!kinds.includes(kind as WritingKind)) fail(file, `"kind" must be one of ${kinds.join(', ')}`)

  const tags = data.tags ?? []
  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) fail(file, '"tags" must be a list of words')

  if (data.draft !== undefined && typeof data.draft !== 'boolean') fail(file, '"draft" must be true or false')
  if (data.masthead !== undefined && !mastheads.includes(data.masthead as (typeof mastheads)[number]))
    fail(file, `"masthead" must be ${mastheads.join(' or ')}`)

  const field = (row: Record<string, unknown>, key: string, list: string) => {
    const value = row[key]
    if (typeof value !== 'string' && typeof value !== 'number') return fail(file, `every "${list}" item needs a "${key}"`)
    return String(value)
  }

  return {
    title: text(file, data, 'title', true) as string,
    summary: text(file, data, 'summary', true) as string,
    date: rawDate as string,
    kind: kind as WritingKind,
    category: text(file, data, 'category', true) as string,
    tags: tags as string[],
    draft: data.draft === true,
    masthead: (data.masthead as 'letter' | 'torn' | undefined) ?? 'letter',
    private: text(file, data, 'private', false),
    facts: pairs<WritingFact>(file, data, 'facts', (row) => ({ label: field(row, 'label', 'facts'), value: field(row, 'value', 'facts') })),
    numbers: pairs<WritingNumber>(file, data, 'numbers', (row) => ({ value: field(row, 'value', 'numbers'), label: field(row, 'label', 'numbers') })),
    note: text(file, data, 'note', false),
  }
}

/** A picture's pixel size from its own header, so it can load lazily without the page jumping. */
function sizeOf(path: string): { width: number; height: number } | undefined {
  const data = readFileSync(path)
  const ext = extname(path).toLowerCase()
  if (ext === '.png' && data.length > 24) return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) }
  if (ext === '.gif' && data.length > 10) return { width: data.readUInt16LE(6), height: data.readUInt16LE(8) }
  if (ext === '.svg') {
    const svg = data.toString('utf8')
    const width = Number(/<svg[^>]*\swidth="([\d.]+)"/.exec(svg)?.[1])
    const height = Number(/<svg[^>]*\sheight="([\d.]+)"/.exec(svg)?.[1])
    if (width && height) return { width, height }
    const box = /viewBox="[\d.-]+[\s,]+[\d.-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/.exec(svg)
    return box ? { width: Number(box[1]), height: Number(box[2]) } : undefined
  }
  if (ext === '.webp' && data.toString('ascii', 0, 4) === 'RIFF') {
    const chunk = data.toString('ascii', 12, 16)
    if (chunk === 'VP8X') return { width: 1 + data.readUIntLE(24, 3), height: 1 + data.readUIntLE(27, 3) }
    if (chunk === 'VP8 ') return { width: data.readUInt16LE(26) & 0x3fff, height: data.readUInt16LE(28) & 0x3fff }
    if (chunk === 'VP8L') {
      const bits = data.readUInt32LE(21)
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
    }
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    let offset = 2
    while (offset < data.length) {
      const marker = data.readUInt16BE(offset)
      const length = data.readUInt16BE(offset + 2)
      if (marker >= 0xffc0 && marker <= 0xffcf && ![0xffc4, 0xffc8, 0xffcc].includes(marker))
        return { width: data.readUInt16BE(offset + 7), height: data.readUInt16BE(offset + 5) }
      offset += 2 + length
    }
  }
  return undefined
}

/** HTML made plain text again: tags dropped, entities (&#39;, &amp; and the like) turned back into characters. */
const plainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const headingId = (title: string) =>
  title
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z#0-9]+;/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** One post's Markdown as HTML, with its sections (the ## headings) as a typed list. */
function render(file: string, slug: string, folder: string, body: string, base: string): { html: string; sections: WritingSection[] } {
  const sections: WritingSection[] = []
  const ids = new Set<string>()
  const material = (name: string) => `${base}writing/${slug}/${name}`
  const parser = new Marked({ gfm: true })
  parser.use({
    renderer: {
      // Raw HTML in a post is shown as text, never run: posts are Markdown only.
      html: ({ text: raw }: Tokens.HTML | Tokens.Tag) => escape(raw),
      heading({ tokens, depth }: Tokens.Heading) {
        let inner = this.parser.parseInline(tokens)
        if (depth !== 2 && depth !== 3) return `<h${Math.min(depth + 1, 4)}>${inner}</h${Math.min(depth + 1, 4)}>\n`
        const fixed = /\s*\{#([a-z0-9-]+)\}\s*$/.exec(inner)
        if (fixed) inner = inner.slice(0, fixed.index)
        const id = fixed?.[1] ?? headingId(inner)
        if (!id) fail(file, `a heading has no letters to make an address from: "${inner}"`)
        if (ids.has(id)) fail(file, `two headings share the address "#${id}"; give one its own with {#another-id}`)
        ids.add(id)
        if (depth === 2) sections.push({ id, title: plainText(inner) })
        return `<h${depth} id="${id}">${inner}</h${depth}>\n`
      },
      code({ text: code, lang }: Tokens.Code) {
        const language = lang ? ` data-language="${escape(lang.split(/\s/)[0] ?? '')}"` : ''
        return `<pre${language} tabindex="0"><code>${escape(code)}</code></pre>\n`
      },
      link({ href, title, tokens }: Tokens.Link) {
        const inner = this.parser.parseInline(tokens)
        const outside = /^https?:\/\//.test(href)
        return `<a href="${escape(href)}"${title ? ` title="${escape(title)}"` : ''}${outside ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}</a>`
      },
      image({ href, title, text: alt }: Tokens.Image) {
        if (/^[a-z]+:|^\//i.test(href)) fail(file, `pictures must be files in the post's folder, not "${href}"`)
        const path = join(folder, href)
        if (!existsSync(path)) fail(file, `the picture "${href}" is not in the folder`)
        if (!materialTypes[extname(href).toLowerCase()]) fail(file, `"${href}" is not a picture type the site serves`)
        if (!alt) fail(file, `the picture "${href}" needs alt text: ![what it shows](${href})`)
        const size = sizeOf(path)
        const dims = size ? ` width="${size.width}" height="${size.height}"` : ''
        const dark = href.replace(/(\.[a-z]+)$/i, '.dark$1')
        const pair = existsSync(join(folder, dark))
        const img = (src: string, theme?: string) =>
          `<img${theme ? ` class="post-figure__${theme}"` : ''} src="${material(src)}" alt="${escape(alt)}"${dims} loading="lazy" decoding="async" />`
        const pictures = pair ? img(href, 'light') + img(dark, 'dark') : img(href)
        return `<figure class="post-figure"><button type="button" class="post-figure__open" aria-label="Open the picture full size: ${escape(alt)}">${pictures}</button>${title ? `<figcaption>${escape(title)}</figcaption>` : ''}</figure>`
      },
      // A picture alone in a paragraph is a figure, so it shouldn't sit inside a <p>.
      paragraph({ tokens }: Tokens.Paragraph) {
        const inner = this.parser.parseInline(tokens)
        return inner.startsWith('<figure') && inner.endsWith('</figure>') ? `${inner}\n` : `<p>${inner}</p>\n`
      },
    },
  })
  return { html: parser.parse(body, { async: false }) as string, sections }
}

/** Every published post, newest first, with its HTML. Drafts and folders starting with _ are left out. */
export function loadWriting(base = '/'): WritingPiece[] {
  if (!existsSync(writingDir)) return []
  const root = writingDir.pathname
  const posts = readdirSync(root)
    .filter((name) => !name.startsWith('_') && !name.startsWith('.') && statSync(join(root, name)).isDirectory())
    .map((slug): WritingPiece | undefined => {
      const file = `${slug}/index.md`
      if (!slugPattern.test(slug)) fail(file, 'the folder name is the address: use lowercase letters, digits and hyphens')
      const folder = join(root, slug)
      if (!existsSync(join(folder, 'index.md'))) fail(file, 'the folder has no index.md')
      const { data, content } = matter(readFileSync(join(folder, 'index.md'), 'utf8'))
      const meta = frontMatter(file, data)
      if (meta.draft) return undefined
      const { html, sections } = render(file, slug, folder, content, base)
      const words = content.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length
      const materials = readdirSync(folder).filter((name) => name !== 'index.md' && materialTypes[extname(name).toLowerCase()])
      return { ...meta, slug, minutes: Math.max(1, Math.round(words / 220)), sections, html, materials }
    })
    .filter((post): post is WritingPiece => post !== undefined)
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title))
}

/** A post without its HTML: what lists, links and search metadata need. */
export const metaOf = ({ html: _html, materials: _materials, ...meta }: WritingPiece): WritingMeta => meta

export { WritingError }
