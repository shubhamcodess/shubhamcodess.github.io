/**
 * Makes the raster icons from the logo mark: favicon.ico (48 px, for crawlers and old browsers that ask for it),
 * apple-touch-icon.png (180 px) and the two web app manifest icons (192 and 512 px).
 * favicon.svg stays the icon browsers use; these exist for everything that cannot read SVG.
 *
 *   pnpm --filter @portfolio/app app-icons
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const publicDir = fileURLToPath(new URL('../public/', import.meta.url))
const surface = '#f3ede1'
const step = '#d9cfbc'
const ink = '#1c1915'
const letters =
  'M500 170 213 334 213 435 513 610 513 747 498 754 278 628 277 563 213 525 213 665 500 830 578 785 577 573 278 399 277 372 500 244 722 372 721 394 556 491 621 528 786 430 786 334ZM500 306 379 383 500 460 621 383Z'

/** A full-bleed square: platforms round or mask the corners themselves. `pad` keeps the mark inside the safe zone. */
const square = (pad) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
  <rect width="1000" height="1000" fill="${surface}"/>
  <g transform="translate(500 500) scale(${1 - pad * 2}) translate(-500 -500)">
    <rect x="145" y="145" width="760" height="760" rx="82" fill="${step}"/>
    <rect x="110" y="110" width="760" height="760" rx="82" fill="${surface}"/>
    <path fill="${ink}" fill-rule="evenodd" transform="translate(490 490) scale(.82) translate(-490 -490)" d="${letters}"/>
  </g>
</svg>`

const browser = await chromium.launch()
const page = await browser.newPage()

async function png(svg, size, transparent = false) {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(`<style>html,body{margin:0}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`)
  return page.screenshot({ clip: { x: 0, y: 0, width: size, height: size }, omitBackground: transparent })
}

writeFileSync(`${publicDir}apple-touch-icon.png`, await png(square(0.08), 180))
writeFileSync(`${publicDir}icon-192.png`, await png(square(0.08), 192))
// The 512 icon doubles as the maskable icon, so the mark sits inside the central 80% safe zone.
writeFileSync(`${publicDir}icon-512.png`, await png(square(0.14), 512))

// favicon.ico: one 48 px PNG inside an ICO container (Google asks for a multiple of 48 px).
// The page renders in light mode, so the SVG's own dark-mode colours do not apply here.
const icoPng = await png(readFileSync(`${publicDir}favicon.svg`, 'utf8'), 48, true)
const header = Buffer.alloc(22)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)
header.writeUInt8(48, 6)
header.writeUInt8(48, 7)
header.writeUInt16LE(1, 10)
header.writeUInt16LE(32, 12)
header.writeUInt32LE(icoPng.length, 14)
header.writeUInt32LE(22, 18)
writeFileSync(`${publicDir}favicon.ico`, Buffer.concat([header, icoPng]))

await browser.close()
console.log('Wrote favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png')
