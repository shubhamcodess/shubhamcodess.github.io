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
      html.replace(
        '<html lang="en"',
        `<html lang="en" data-palette="${site.theme.palette}" data-buttons="${site.theme.buttons}" data-texture="${site.theme.texture}"`,
      ),
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

/**
 * What static hosting needs beyond the pages: a sitemap of every page, robots.txt pointing at it,
 * and a 404 page (GitHub Pages serves 404.html for any unknown address; it is the home page).
 */
function staticHosting(): Plugin {
  return {
    name: 'portfolio-static-hosting',
    apply: 'build',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const base = `${site.url}${process.env.PORTFOLIO_BASE ?? '/'}`
        const paths = [...Object.values(site.routes).map((route) => route.path), ...builds.map((build) => `builds/${build.slug}/`)]
        const urls = paths.map((path) => `  <url><loc>${base}${path}</loc></url>`).join('\n')
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
        })
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n\nSitemap: ${base}sitemap.xml\n` })
        const home = bundle['index.html']
        if (home?.type === 'asset') this.emitFile({ type: 'asset', fileName: '404.html', source: home.source })
      },
    },
  }
}

// One HTML file per route, so every page loads directly on static hosting with no SPA fallback.
// PORTFOLIO_BASE is the path the site is served from, for example "/shubham-portfolio/".
export default defineConfig({
  base: process.env.PORTFOLIO_BASE ?? '/',
  appType: 'mpa',
  plugins: [react(), projectPages(), renderBlocking(), staticHosting()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      input: {
        home: 'index.html',
        builds: 'builds/index.html',
        experience: 'experience/index.html',
        credentials: 'credentials/index.html',
        me: 'me/index.html',
        project: template,
      },
    },
  },
})
