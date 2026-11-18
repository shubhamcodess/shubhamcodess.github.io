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
import './styles/texture.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

// Each HTML entry names its own route, so no page depends on reading the URL.
function resolvePage(route: string | undefined): Page | null {
  if (route === 'project') {
    const build = site.features.projectPages ? buildFromPath(window.location.pathname) : undefined
    return build ? { id: 'project', build } : null
  }
  if (route === 'not-found') return { id: 'notFound' }
  if (route === 'me' && !site.features.mePage) return null
  return isRouteId(route) ? { id: route } : null
}

const page = resolvePage(root.dataset.route)
// An address that names no build goes to the index, which is the nearest true answer; a page that is switched off goes home.
if (!page) window.location.replace(hrefTo(root.dataset.route === 'project' ? 'builds' : 'home'))

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
  // The built page carries a hidden copy of its own text for crawlers that do not run JavaScript
  // (see scripts/prerender.mjs). React replaces it here, in the same task, so it is never seen.
  delete root.dataset.prerendered
  flushSync(() =>
    app.render(
      <StrictMode>
        <App current={page.id === 'project' ? 'builds' : page.id === 'notFound' ? undefined : page.id}>{content}</App>
      </StrictMode>,
    ),
  )
}
