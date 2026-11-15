import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import { StrictMode } from 'react'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { loadPage, type Page } from './app/pages'
import { site } from './config/site'
import { buildFromPath, hrefTo, isRouteId } from './lib/routes'
import './styles/tokens.css'
import './styles/base.css'
import './styles/buttons.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

// Each HTML entry names its own route, so no page depends on reading the URL.
function resolvePage(route: string | undefined): Page | null {
  if (route === 'project') {
    const build = site.features.projectPages ? buildFromPath(window.location.pathname) : undefined
    return build ? { id: 'project', build } : null
  }
  return isRouteId(route) ? { id: route } : null
}

const page = resolvePage(root.dataset.route)
// An address that names no build goes to the index, which is the nearest true answer.
if (!page) window.location.replace(hrefTo('builds'))
if (page?.id === 'project') document.title = `${page.build.title} | ${site.owner}`

const { light } = site.hero
document.documentElement.style.setProperty('--light-scroll-rate', String(light.parallax.scrollLight))
document.documentElement.style.setProperty('--light-content-shift', `${light.parallax.pointerContent}px`)

/*
 * No jitter between pages. The script tag is render-blocking, so the browser shows nothing until this module
 * finishes. Load this page's code and wait briefly for the text fonts (cached after the first visit),
 * then draw the whole page in one synchronous pass. The first frame the visitor sees, and the one the page transition fades to, is complete.
 */
const fontWaitMs = 250
const fonts = Promise.race([
  Promise.all([document.fonts.load('1em "Geist Variable"'), document.fonts.load('1em "Geist Mono Variable"')]),
  new Promise((resolve) => setTimeout(resolve, fontWaitMs)),
]).catch(() => undefined)

if (page) {
  // The page's own code and the fonts load side by side.
  const [content] = await Promise.all([loadPage(page), fonts])
  const app = createRoot(root)
  flushSync(() =>
    app.render(
      <StrictMode>
        <App>{content}</App>
      </StrictMode>,
    ),
  )
}
