import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, type Page } from './app/App'
import { site } from './config/site'
import { buildFromPath, hrefTo, isRouteId } from './lib/routes'
import './styles/tokens.css'
import './styles/base.css'

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

if (page) {
  createRoot(root).render(
    <StrictMode>
      <App page={page} />
    </StrictMode>,
  )
}
