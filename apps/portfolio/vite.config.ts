import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { extname, join } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { site } from './src/config/site'
import type { RouteId } from './src/config/types'
import { builds } from './src/content/builds'
import { loadWriting, materialTypes, metaOf, writingDir } from './src/content/writing-loader'
import {
  headTags,
  indexablePages,
  llmsFullTxt,
  llmsTxt,
  markdownPathOf,
  pageMarkdown,
  robotsTxt,
  securityTxt,
  sitemapXml,
  webManifest,
  type SeoCredential,
  type SeoPage,
} from './src/seo'

const template = 'project/index.html'
const projectPath = /\/builds\/([a-z0-9-]+)\/?$/

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
            // The head is filled in by seo(), which knows this file by its path.
            source: String(page.source),
          })
        }
        delete bundle[template]
      },
    },
  }
}

const writingTemplate = 'writing/index.html'
const postTemplate = 'post/index.html'
const postPath = /\/writing\/([a-z0-9-]+)\/?$/
const materialPath = /\/writing\/([a-z0-9-]+)\/([^/]+)$/
const virtualIndex = 'virtual:writing'
const virtualPost = 'virtual:writing-post/'

/** Whether the Writing pages are on the site: switched on and at least one published post. */
const writingLive = (posts: readonly unknown[]) => site.features.writing && posts.length > 0

/**
 * The writing (src/content/writing-loader.ts): two virtual modules for the app (every post's front matter, and
 * each post's HTML on its own, loaded only on its page), one real HTML file per post from the post template, and
 * each post's pictures copied beside its page. In development everything is read fresh and served in place.
 */
function writingPages(): Plugin {
  const read = () => loadWriting(base)
  return {
    name: 'portfolio-writing-pages',
    resolveId: (id) => (id === virtualIndex || id.startsWith(virtualPost) ? `\0${id}` : undefined),
    load(id) {
      if (!id.startsWith('\0virtual:writing')) return undefined
      const posts = writingLive(read()) ? read() : []
      if (id === `\0${virtualIndex}`) {
        const bodies = posts.map((post) => `${JSON.stringify(post.slug)}: () => import(${JSON.stringify(virtualPost + post.slug)})`)
        return `export const posts = ${JSON.stringify(posts.map(metaOf))}\nexport const bodies = { ${bodies.join(', ')} }\n`
      }
      const slug = id.slice(`\0${virtualPost}`.length)
      const post = posts.find((item) => item.slug === slug)
      return `export default ${JSON.stringify(post?.html ?? '')}\n`
    },
    configureServer(server) {
      server.watcher.add(writingDir.pathname)
      // A change to any post reloads the page with the new text.
      server.watcher.on('all', (_event, file) => {
        if (!file.startsWith(writingDir.pathname)) return
        for (const module of server.moduleGraph.idToModuleMap.values())
          if (module.id?.startsWith('\0virtual:writing')) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload' })
      })
      server.middlewares.use((request, response, next) => {
        const [path = '', query] = (request.url ?? '').split('?')
        const posts = read()
        if (!writingLive(posts)) return next()
        const material = materialPath.exec(path)
        if (material) {
          const [, slug = '', name = ''] = material
          const file = join(writingDir.pathname, slug, name)
          const type = materialTypes[extname(name).toLowerCase()]
          if (type && posts.some((post) => post.slug === slug) && existsSync(file)) {
            response.setHeader('content-type', type)
            return response.end(readFileSync(file))
          }
        }
        const suffix = query ? `?${query}` : ''
        if (/\/writing\/?$/.test(path)) request.url = `${server.config.base}${writingTemplate}${suffix}`
        const slug = postPath.exec(path)?.[1]
        if (slug && posts.some((post) => post.slug === slug)) request.url = `${server.config.base}${postTemplate}${suffix}`
        next()
      })
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const posts = read()
        const page = bundle[postTemplate]
        if (writingLive(posts) && page?.type === 'asset') {
          for (const post of posts) {
            this.emitFile({ type: 'asset', fileName: `writing/${post.slug}/index.html`, source: String(page.source) })
            for (const name of post.materials)
              this.emitFile({ type: 'asset', fileName: `writing/${post.slug}/${name}`, source: readFileSync(join(writingDir.pathname, post.slug, name)) })
          }
        }
        delete bundle[postTemplate]
        if (!writingLive(posts)) delete bundle[writingTemplate]
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

/** Home's HTML made into the 404 page: the app reads the route and draws the not-found page instead. */
const notFoundHtml = (html: string) => html.replace('data-route="home"', 'data-route="not-found"')

const seoMarker = /\s*<!-- seo:[^>]*-->/
const routeOf = (html: string) => /data-route="([a-z]+)"/.exec(html)?.[1]
const siteRoot = () => `${site.url}${process.env.PORTFOLIO_BASE ?? '/'}`
const readCredentials = (): SeoCredential[] => JSON.parse(readFileSync('public/data/credentials.json', 'utf8'))

/** Which page an HTML file is, from its route and, for a project page, its address. */
function seoPageOf(html: string, path: string): SeoPage | undefined {
  if (path === '404.html') return { id: 'notFound' }
  const route = routeOf(html)
  if (route === 'post') {
    const slug = /writing\/([a-z0-9-]+)\/?/.exec(path)?.[1]
    // Read fresh, so a post added while the dev server runs gets its title too.
    const post = loadWriting(base).find((item) => item.slug === slug)
    return post ? { id: 'post', post: metaOf(post) } : undefined
  }
  if (route === 'project') {
    const slug = /builds\/([a-z0-9-]+)\/?/.exec(path)?.[1]
    const build = builds.find((item) => item.slug === slug)
    return build ? { id: 'project', build } : undefined
  }
  return route && route in site.routes ? { id: route as RouteId } : undefined
}

/** The files each page's text comes from, so its sitemap date is the last commit that changed what it says. */
function sourcesOf(page: SeoPage): string[] {
  switch (page.id) {
    case 'project':
      return ['src/content/builds.ts', 'src/content/build-stories.ts', `src/motion/${page.build.slug}`, `public/motion/${page.build.slug}`]
    case 'post':
      return [`content/writing/${page.post.slug}`]
    case 'writing':
      return ['content/writing', 'src/features/writing']
    case 'builds':
      return ['src/content/builds.ts', 'src/features/builds']
    case 'experience':
      return ['src/content/experience.ts', 'src/content/tools.ts', 'src/features/experience']
    case 'credentials':
      return ['public/data/credentials.json', 'src/features/credentials']
    case 'me':
      return ['src/content/me.ts', 'src/features/me', 'public/me']
    default:
      return ['src/content', 'src/features/home', 'src/features/hero', 'src/features/contact', 'src/features/experience']
  }
}

/** The last commit date of a page's sources, or nothing when git history is not there (a shallow clone). */
function lastCommit(page: SeoPage): string | undefined {
  try {
    const date = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...sourcesOf(page)], { encoding: 'utf8' }).trim()
    return date || undefined
  } catch {
    return undefined
  }
}

/**
 * A Content Security Policy for the built pages. GitHub Pages cannot send headers, so it goes in a meta tag.
 * The one inline script (the theme before first paint) is allowed by its hash; JSON-LD is data and never runs.
 */
function contentSecurityPolicy(html: string): string {
  const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
    ([, code = '']) => `'sha256-${createHash('sha256').update(code).digest('base64')}'`,
  )
  return [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "media-src 'self'",
    "connect-src 'self' https://api.npmjs.org",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    'upgrade-insecure-requests',
  ].join('; ')
}

/**
 * Everything search engines, link previews and AI assistants read (see src/seo/): each page's head, robots.txt,
 * the sitemap, the web app manifest, llms.txt, llms-full.txt and the 404 page. In development the head is filled in too.
 */
function seo(): Plugin {
  let building = false
  return {
    name: 'portfolio-seo',
    configResolved(config) {
      building = config.command === 'build'
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, context) {
        if (building) return html // The build fills the head in generateBundle, once every page and asset exists.
        const page = seoPageOf(html, (context.originalUrl ?? context.path).split('?')[0] ?? '')
        if (!page) return html
        const root = siteRoot()
        const tags = headTags(page, { root, portrait: `${root}src/assets/portrait.webp`, credentials: readCredentials() })
        return html.replace(seoMarker, `\n    ${tags}`)
      },
    },
    // In development the same files are made on request, and an unknown address gets the 404 page, as on GitHub Pages.
    configureServer(server) {
      const base = server.config.base
      const files = (): Record<string, [string, () => string]> => {
        const root = siteRoot()
        const context = { root, portrait: `${root}src/assets/portrait.webp`, credentials: readCredentials() }
        const text = 'text/plain; charset=utf-8'
        return {
          'robots.txt': [text, () => robotsTxt(root)],
          'sitemap.xml': ['application/xml; charset=utf-8', () => sitemapXml(root, lastCommit)],
          'site.webmanifest': ['application/manifest+json', () => webManifest(root)],
          'llms.txt': [text, () => llmsTxt(root)],
          'llms-full.txt': [text, () => llmsFullTxt(context)],
          '.well-known/security.txt': [text, () => securityTxt(root)],
          ...Object.fromEntries(
            indexablePages().map((page) => [markdownPathOf(page), ['text/markdown; charset=utf-8', () => pageMarkdown(page, context)]]),
          ),
        }
      }
      server.middlewares.use((request, response, next) => {
        const path = (request.url ?? '').split('?')[0]?.slice(base.length) ?? ''
        const file = files()[path]
        if (!file) return next()
        response.setHeader('content-type', file[0])
        response.end(file[1]())
      })
      return () =>
        server.middlewares.use(async (request, response, next) => {
          // Known pages have been rewritten to their index.html by now; an address still without a file type names nothing.
          const path = (request.url ?? '').split('?')[0] ?? ''
          if (request.method !== 'GET' || !request.headers.accept?.includes('text/html') || extname(path)) return next()
          const html = await server.transformIndexHtml(`${base}index.html`, notFoundHtml(readFileSync('index.html', 'utf8')), '404.html')
          response.statusCode = 404
          response.setHeader('content-type', 'text/html; charset=utf-8')
          response.end(html)
        })
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const root = siteRoot()
        const portraitFile = Object.keys(bundle).find((name) => /portrait-[\w-]+\.webp$/.test(name))
        if (!portraitFile) this.error('The portrait asset is missing from the bundle')
        const context = { root, portrait: `${root}${portraitFile}`, credentials: readCredentials() }

        const finish = (html: string, page: SeoPage) =>
          html
            .replace(seoMarker, `\n    ${headTags(page, context)}`)
            .replace(
              '<meta charset="UTF-8" />',
              `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${contentSecurityPolicy(html)}" />`,
            )

        // GitHub Pages serves 404.html for any unknown address. It is home's HTML naming its own page, marked noindex.
        const home = bundle['index.html']
        if (home?.type === 'asset')
          this.emitFile({ type: 'asset', fileName: '404.html', source: finish(notFoundHtml(String(home.source)), { id: 'notFound' }) })

        for (const [fileName, asset] of Object.entries(bundle)) {
          if (asset.type !== 'asset' || !fileName.endsWith('.html') || fileName === '404.html') continue
          const html = String(asset.source)
          const page = seoPageOf(html, fileName)
          if (!page) this.error(`No page for ${fileName}`)
          asset.source = finish(html, page)
        }

        const emit = (fileName: string, source: string) => this.emitFile({ type: 'asset', fileName, source })
        emit('robots.txt', robotsTxt(root))
        emit('sitemap.xml', sitemapXml(root, lastCommit))
        emit('site.webmanifest', webManifest(root))
        emit('llms.txt', llmsTxt(root))
        emit('llms-full.txt', llmsFullTxt(context))
        emit('.well-known/security.txt', securityTxt(root))
        // Each page's own text in Markdown, beside its index.html, for models that fetch one page.
        for (const page of indexablePages()) emit(markdownPathOf(page), pageMarkdown(page, context))
      },
    },
  }
}

/** Each route's own page module, which main.tsx loads with a dynamic import. */
const pageModules: Readonly<Record<string, string>> = {
  home: 'src/features/home/HomePage.tsx',
  builds: 'src/features/builds/BuildsPage.tsx',
  experience: 'src/features/experience/ExperiencePage.tsx',
  credentials: 'src/features/credentials/CredentialsPage.tsx',
  me: 'src/features/me/MePage.tsx',
  project: 'src/features/project/ProjectPage.tsx',
  writing: 'src/features/writing/WritingPage.tsx',
  post: 'src/features/writing/PostPage.tsx',
  'not-found': 'src/features/not-found/NotFoundPage.tsx',
}

/**
 * Lets each built page fetch everything it needs to draw at once, instead of in a chain.
 * Without it the browser finds the page's own code, its styles and the text fonts only after the app script runs.
 * Runs after seo(), so 404.html is in the bundle too.
 */
function preloadPage(): Plugin {
  return {
    name: 'portfolio-preload-page',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const chunks = Object.values(bundle).filter((item) => item.type === 'chunk')
        const fonts = Object.keys(bundle).filter((name) => /geist(-mono)?-latin-wght-normal-[\w-]+\.woff2$/.test(name))
        for (const [fileName, asset] of Object.entries(bundle)) {
          if (asset.type !== 'asset' || !fileName.endsWith('.html')) continue
          const html = String(asset.source)
          const module = pageModules[/data-route="([a-z-]+)"/.exec(html)?.[1] ?? '']
          const page = chunks.find((chunk) => module && chunk.facadeModuleId?.endsWith(module))
          if (!page) continue
          const href = (name: string) => `${base}${name}`
          const scripts = [page.fileName, ...page.imports].filter((name) => !html.includes(`/${name}"`))
          const styles = [...(page.viteMetadata?.importedCss ?? [])].filter((name) => !html.includes(`/${name}"`))
          const tags = [
            ...fonts.map((name) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${href(name)}" />`),
            ...styles.map((name) => `<link rel="preload" as="style" href="${href(name)}" />`),
            ...scripts.map((name) => `<link rel="modulepreload" crossorigin href="${href(name)}" />`),
          ]
          asset.source = html.replace('</head>', `  ${tags.join('\n    ')}\n  </head>`)
        }
      },
    },
  }
}

const base = process.env.PORTFOLIO_BASE ?? '/'

// One HTML file per route, so every page loads directly on static hosting with no SPA fallback.
// PORTFOLIO_BASE is the path the site is served from, for example "/shubham-portfolio/".
export default defineConfig({
  base,
  appType: 'mpa',
  plugins: [react(), projectPages(), writingPages(), renderBlocking(), seo(), preloadPage()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      input: {
        home: 'index.html',
        builds: 'builds/index.html',
        experience: 'experience/index.html',
        credentials: 'credentials/index.html',
        ...(site.features.mePage ? { me: 'gallery/index.html' } : {}),
        project: template,
        writing: writingTemplate,
        post: postTemplate,
      },
    },
  },
})
