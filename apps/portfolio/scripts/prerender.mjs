/**
 * Puts each built page's own text into its HTML, so crawlers that do not run JavaScript (GPTBot, ClaudeBot,
 * PerplexityBot and most link unfurlers) read the same words as a visitor. Runs after `vite build`.
 *
 * Each page in dist is opened in a headless browser, its rendered #root is copied (minus scripts, canvases,
 * inline styles and decorative SVG), and written back inside #root with `data-prerendered`. That copy is hidden
 * until the app replaces it (src/main.tsx), and shown to visitors without JavaScript through a noscript style.
 * React does not hydrate it: the app draws the page fresh, exactly as before.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const base = process.env.PORTFOLIO_BASE ?? '/'
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
}

/** Every HTML page in dist, as its address under the base. The 404 page is skipped: it is noindex. */
function pages(dir = dist) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return pages(path)
    if (name !== 'index.html') return []
    return [`${base}${relative(dist, dir).split('\\').join('/')}${dir === dist ? '' : '/'}`.replace(/\/+/g, '/')]
  })
}

const server = createServer((request, response) => {
  let path = decodeURIComponent((request.url ?? '/').split('?')[0]).slice(base.length - 1)
  if (path.endsWith('/')) path += 'index.html'
  try {
    const body = readFileSync(join(dist, path))
    response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' })
    response.end(body)
  } catch {
    response.writeHead(404).end()
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
let failed = false

for (const address of pages()) {
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(`${origin}${address}`, { waitUntil: 'networkidle' })
  await page.waitForSelector('#root main', { timeout: 15000 })

  const snapshot = await page.evaluate(() => {
    const copy = document.getElementById('root').cloneNode(true)
    copy
      .querySelectorAll('script, canvas, noscript, template, video, audio, iframe, dialog, [aria-hidden="true"] svg')
      .forEach((node) => node.remove())
    // Icons and drawings add bytes and no words. Keep an SVG only when it is labelled.
    copy.querySelectorAll('svg:not([aria-label]):not([role="img"])').forEach((node) => node.remove())
    copy.querySelectorAll('*').forEach((node) => {
      for (const name of [...node.getAttributeNames()]) {
        if (name === 'style' || name.startsWith('data-') || name.startsWith('on') || name === 'tabindex') node.removeAttribute(name)
      }
    })
    return copy.innerHTML.replace(/>\s+</g, '><').trim()
  })

  const words = snapshot
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
  if (errors.length || words < 30) {
    console.error(`prerender: ${address} looks wrong (${words} words). ${errors.join(' | ')}`)
    failed = true
  }

  const file = join(dist, address.slice(base.length), 'index.html')
  const html = readFileSync(file, 'utf8')
  const rootTag = /<div id="root" data-route="([a-z]+)"><\/div>/
  if (!rootTag.test(html)) throw new Error(`prerender: no empty #root in ${file}`)
  writeFileSync(
    file,
    html
      .replace(rootTag, `<div id="root" data-route="$1" data-prerendered>${snapshot}</div>`)
      .replace(
        '</head>',
        '  <style>#root[data-prerendered]{visibility:hidden}</style>\n    <noscript><style>#root[data-prerendered]{visibility:visible}</style></noscript>\n  </head>',
      ),
  )
  console.log(`prerender: ${address} ${words} words, ${(snapshot.length / 1024).toFixed(1)} KB`)
  await page.close()
}

await browser.close()
server.close()
if (failed) process.exit(1)
