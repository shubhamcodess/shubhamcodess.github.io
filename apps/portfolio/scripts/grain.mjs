/**
 * Renders the panel grain (theme.texture: 'grain') into two small tiles, src/assets/grain-light.webp and grain-dark.webp.
 * The grain was an SVG feTurbulence filter used as a background: Chrome re-ran that noise filter every time it
 * rastered a new tile of a panel, which dropped frames while scrolling. A ready-made tile costs nothing to repeat.
 * The SVGs below stay the source: change the grain here and run this again.
 *
 *   pnpm --filter @portfolio/app grain
 */
import { execFileSync } from 'node:child_process'
import { unlinkSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

/** One tile, in CSS pixels. It is drawn at twice that, so the grain stays as fine on a retina screen as the SVG was. */
const tile = 128
const density = 2
/** Ink colour (0 to 1) and strength (alpha) of each grain: 0.09 on paper, 0.055 on midnight. */
const grains = {
  light: { rgb: [0.16, 0.13, 0.1], alpha: 0.09 },
  dark: { rgb: [0.85, 0.9, 1], alpha: 0.055 },
}

const svg = ({ rgb: [r, g, b], alpha }) => `<svg xmlns="http://www.w3.org/2000/svg" width="${tile * density}" height="${tile * density}" viewBox="0 0 ${tile} ${tile}">
  <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
  <feColorMatrix values="0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} ${alpha} 0 0 0 0"/></filter>
  <rect width="${tile}" height="${tile}" filter="url(#g)"/>
</svg>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: tile * density, height: tile * density } })
for (const [name, grain] of Object.entries(grains)) {
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block}</style>${svg(grain)}`)
  const png = fileURLToPath(new URL(`../src/assets/grain-${name}.png`, import.meta.url))
  await page.screenshot({ path: png, omitBackground: true, clip: { x: 0, y: 0, width: tile * density, height: tile * density } })
  execFileSync('cwebp', ['-quiet', '-lossless', '-z', '9', png, '-o', png.replace(/\.png$/, '.webp')])
  unlinkSync(png)
}
await browser.close()
console.log('Wrote src/assets/grain-light.webp and grain-dark.webp')
