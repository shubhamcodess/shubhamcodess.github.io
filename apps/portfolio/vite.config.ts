import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { site } from './src/config/site'
import { builds } from './src/content/builds'

const template = 'project/index.html'
const projectPath = /\/builds\/([a-z0-9-]+)\/?$/

const escapeAttribute = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

/**
 * One real HTML file per build, made from the project template, so every project page loads directly
 * on static hosting with its own title and description. In development the template is served in place.
 */
function projectPages(): Plugin {
  return {
    name: 'portfolio-project-pages',
    // The palette is set on <html> in the file itself, so the first paint already has the right colours.
    transformIndexHtml: (html) =>
      html.replace('<html lang="en"', `<html lang="en" data-palette="${site.theme.palette}" data-buttons="${site.theme.buttons}"`),
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const [path = '', query] = (request.url ?? '').split('?')
        const slug = projectPath.exec(path)?.[1]
        if (slug && builds.some((build) => build.slug === slug)) {
          request.url = `${server.config.base}${template}${query ? `?${query}` : ''}`
        }
        next()
      })
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const page = bundle[template]
        if (page?.type !== 'asset') return
        for (const build of builds) {
          this.emitFile({
            type: 'asset',
            fileName: `builds/${build.slug}/index.html`,
            source: String(page.source)
              .replaceAll('__TITLE__', escapeAttribute(`${build.title} | ${site.owner}`))
              .replaceAll('__DESCRIPTION__', escapeAttribute(build.summary)),
          })
        }
        delete bundle[template]
      },
    },
  }
}

/**
 * Keeps the app script render-blocking in the built pages (Vite rewrites the tag and drops the attribute),
 * so the browser paints each page only once it is fully drawn. See the note in src/main.tsx.
 */
function renderBlocking(): Plugin {
  return {
    name: 'portfolio-render-blocking',
    transformIndexHtml: {
      order: 'post',
      handler: (html) =>
        html.replace(/<script type="module" crossorigin src=/g, '<script type="module" crossorigin blocking="render" src='),
    },
  }
}

// One HTML file per route, so every page loads directly on static hosting with no SPA fallback.
// PORTFOLIO_BASE is the path the site is served from, for example "/shubham-portfolio/".
export default defineConfig({
  base: process.env.PORTFOLIO_BASE ?? '/',
  appType: 'mpa',
  plugins: [react(), projectPages(), renderBlocking()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      input: {
        home: 'index.html',
        builds: 'builds/index.html',
        experience: 'experience/index.html',
        credentials: 'credentials/index.html',
        project: template,
      },
    },
  },
})
