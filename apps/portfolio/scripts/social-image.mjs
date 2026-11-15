/**
 * Makes the social preview image (public/social.png, 1200 x 630) from the live site itself:
 * the real ID badge from the contact section, the logo mark, the name and the role, on the night panel.
 *
 *   pnpm dev                                   (in another terminal)
 *   pnpm --filter @portfolio/app social-image  [http://localhost:5180]
 *
 * Run it again whenever the badge, the logo or the portrait changes. Platforms cache previews, so
 * re-scrape the home page in the Facebook and LinkedIn debuggers after replacing the file.
 */
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const origin = process.argv[2] ?? 'http://localhost:5180'
const out = fileURLToPath(new URL('../public/social.png', import.meta.url))
const width = 1200
const height = 630
const role = 'AI Engineer'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
await page.goto(`${origin}/`, { waitUntil: 'networkidle' })
await page.locator('#contact').scrollIntoViewIfNeeded()
// The portrait forms from a grid of cells; with reduced motion it settles at once, but give the image time to decode.
await page.waitForTimeout(2500)

await page.evaluate(
  ({ width, height, role }) => {
    const contact = document.querySelector('#contact')
    const badge = document.querySelector('.badge')
    const logo = document.querySelector('.site-header .logo-mark, header .logo-mark')
    if (!contact || !badge || !logo) throw new Error('Missing the contact panel, the badge or the logo')

    const stage = document.createElement('div')
    stage.className = 'panel panel--night'
    Object.assign(stage.style, {
      position: 'fixed',
      inset: '0 auto auto 0',
      width: `${width}px`,
      height: `${height}px`,
      zIndex: '2147483647',
      margin: '0',
      borderRadius: '0',
      display: 'grid',
      gridTemplateColumns: '1fr 470px',
      alignItems: 'center',
      padding: '0 0 0 84px',
      overflow: 'hidden',
      boxSizing: 'border-box',
    })

    // The same night sky as the contact panel, glow included.
    const sky = getComputedStyle(contact)
    stage.style.backgroundColor = sky.backgroundColor
    stage.style.backgroundImage = sky.backgroundImage

    const copy = document.createElement('div')
    Object.assign(copy.style, { display: 'grid', gap: '22px', alignContent: 'center' })

    const mark = logo.cloneNode(true)
    Object.assign(mark.style, { width: '108px', height: '108px', marginBottom: '18px' })

    const name = document.createElement('p')
    name.textContent = 'Shubham Prakash'
    Object.assign(name.style, {
      margin: '0',
      color: 'var(--ink)',
      font: '500 92px/0.98 var(--font-sans)',
      letterSpacing: '-0.035em',
      maxWidth: '8ch',
    })

    const title = document.createElement('p')
    title.textContent = role
    Object.assign(title.style, {
      margin: '0',
      color: 'var(--ink-muted, currentColor)',
      font: '400 30px/1.2 var(--font-mono)',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
    })

    copy.append(mark, name, title)

    // The real badge, hanging from above the top edge, with the Labs card peeking out behind it.
    const hang = document.createElement('div')
    Object.assign(hang.style, {
      alignSelf: 'start',
      marginTop: '-70px',
      '--badge-width': '300px',
      '--badge-strap-length': '150px',
    })
    hang.style.setProperty('--badge-width', '300px')
    hang.style.setProperty('--badge-strap-length', '150px')
    hang.append(badge)

    stage.append(copy, hang)
    document.body.append(stage)
    document.documentElement.style.overflow = 'hidden'
    window.scrollTo(0, 0)
  },
  { width, height, role },
)
await page.waitForTimeout(600)
await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height } })
await browser.close()

// Saved at twice the size for sharpness, then brought down to the 1200 x 630 every platform expects.
execFileSync('sips', ['--resampleWidth', String(width), out], { stdio: 'ignore' })
console.log(`Wrote ${out}`)
