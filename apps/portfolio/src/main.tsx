import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { site } from './config/site'
import { isRouteId } from './lib/routes'
import './styles/tokens.css'
import './styles/base.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root')

// Each HTML entry names its own route, so no page depends on reading the URL.
const route = root.dataset.route
if (!isRouteId(route)) throw new Error(`Unknown route: ${route ?? 'none'}`)

const { light } = site.hero
document.documentElement.style.setProperty('--hero-scroll-rate', String(light.parallax.scrollLight))
document.documentElement.style.setProperty('--hero-content-shift', `${light.parallax.pointerContent}px`)

createRoot(root).render(
  <StrictMode>
    <App route={route} />
  </StrictMode>,
)
