/**
 * What search engines, link previews and AI assistants read: each page's head (title, description, canonical,
 * Open Graph, X cards, icons and JSON-LD), robots.txt, the sitemap, llms.txt and llms-full.txt.
 * Everything is made at build time from the site config and the content files, so a page's text and its
 * metadata can never disagree. The Vite config calls these; nothing here runs in the browser.
 */
import { site } from '../config/site'
import type { RouteId } from '../config/types'
import { buildStories } from '../content/build-stories'
import { builds } from '../content/builds'
import { employers, featuredCredentials, recognition } from '../content/experience'
import { toolGroups } from '../content/tools'
import type { Build } from '../content/types'

export type SeoPage = { readonly id: RouteId } | { readonly id: 'project'; readonly build: Build } | { readonly id: 'notFound' }

/** A credential as public/data/credentials.json stores it. */
export interface SeoCredential {
  readonly title: string
  readonly issuer: string
  readonly href?: string
  readonly issued?: string
  readonly expires?: string
}

export interface SeoContext {
  /** The site's absolute address with its base path, ending in "/". */
  readonly root: string
  /** The portrait's absolute address, for the person's structured data. */
  readonly portrait: string
  /** The full credentials list, for the credentials page and llms-full.txt. */
  readonly credentials: readonly SeoCredential[]
}

const { seo, contact, owner } = site
const [givenName = owner, familyName = ''] = owner.split(' ')

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/** The stories' inline marks (see ui/RichText.tsx) are already Markdown, except keys. */
const markdown = (text: string) => text.replace(/\[\[(.+?)\]\]/g, '`$1`')

const yearsAt = (from: number, to?: number) => (to ? `${from} to ${to}` : `${from} to now`)

export function pathOf(page: SeoPage): string {
  if (page.id === 'project') return `${site.routes.builds.path}${page.build.slug}/`
  if (page.id === 'notFound') return '404.html'
  return site.routes[page.id].path
}

export function titleOf(page: SeoPage): string {
  if (page.id === 'project') return seo.projectTitle.replace('{title}', page.build.title).replace('{kind}', page.build.kind)
  if (page.id === 'notFound') return `Page not found | ${owner}`
  return site.routes[page.id].title
}

export function descriptionOf(page: SeoPage): string {
  if (page.id === 'project') return page.build.summary
  if (page.id === 'notFound') return site.routes.home.description
  return site.routes[page.id].description
}

/** The pages search engines should know about: every route that is switched on, and every build. */
export function indexablePages(): SeoPage[] {
  const routes = (Object.keys(site.routes) as RouteId[]).filter((id) => id !== 'me' || site.features.mePage)
  return [...routes.map((id) => ({ id })), ...builds.map((build) => ({ id: 'project' as const, build }))]
}

/* ---------- Structured data ---------- */

const personId = (root: string) => `${root}#person`
const websiteId = (root: string) => `${root}#website`
const profiles = () => [...contact.links.map((link) => link.href), site.credentialsPage.wallet]

function person(context: SeoContext, extra: Record<string, unknown> = {}) {
  const { root, portrait } = context
  return {
    '@type': 'Person',
    '@id': personId(root),
    name: owner,
    givenName,
    familyName,
    alternateName: contact.badge.handle,
    url: root,
    image: { '@type': 'ImageObject', url: portrait, caption: contact.badge.portraitAlt },
    jobTitle: seo.person.jobTitle,
    description: seo.person.description,
    email: `mailto:${contact.email}`,
    worksFor: { '@type': 'Organization', name: seo.person.employer.name, url: seo.person.employer.url },
    address: { '@type': 'PostalAddress', addressLocality: seo.person.locality, addressCountry: seo.person.country },
    knowsAbout: seo.person.knowsAbout,
    award: recognition.map((item) => `${item.title} (${item.when})`),
    sameAs: profiles(),
    ...extra,
  }
}

function website(root: string) {
  return {
    '@type': 'WebSite',
    '@id': websiteId(root),
    url: root,
    name: owner,
    description: site.routes.home.description,
    inLanguage: 'en',
    publisher: { '@id': personId(root) },
  }
}

function breadcrumbs(root: string, trail: readonly (readonly [name: string, path: string])[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map(([name, path], index) => ({ '@type': 'ListItem', position: index + 1, name, item: `${root}${path}` })),
  }
}

function webPage(page: SeoPage, root: string, type = 'WebPage', extra: Record<string, unknown> = {}) {
  const url = `${root}${pathOf(page)}`
  return {
    '@type': type,
    '@id': url,
    url,
    name: titleOf(page),
    description: descriptionOf(page),
    inLanguage: 'en',
    isPartOf: { '@id': websiteId(root) },
    primaryImageOfPage: `${root}${seo.image.path}`,
    ...extra,
  }
}

function software(build: Build, root: string) {
  const page = `${root}${site.routes.builds.path}${build.slug}/`
  const code = build.links.find((link) => link.kind === 'code')?.href
  const live = build.links.find((link) => link.kind === 'live')?.href
  return {
    '@type': 'SoftwareSourceCode',
    '@id': `${page}#software`,
    name: build.title,
    description: build.summary,
    url: live ?? code ?? page,
    ...(code ? { codeRepository: code } : {}),
    programmingLanguage: build.stack,
    keywords: [build.kind, ...build.stack].join(', '),
    dateCreated: String(build.year),
    author: { '@id': personId(root) },
    creator: { '@id': personId(root) },
    mainEntityOfPage: page,
    sameAs: build.links.map((link) => link.href).filter((href) => href !== (live ?? code)),
  }
}

function experienceRoles() {
  return employers.flatMap((employer) =>
    employer.roles.map((role) => ({
      '@type': 'EmployeeRole',
      roleName: role.title,
      startDate: String(role.from),
      ...(role.to ? { endDate: String(role.to) } : {}),
      description: role.scope,
      worksFor: { '@type': 'Organization', name: employer.name, url: seo.person.employer.url },
    })),
  )
}

export function jsonLd(page: SeoPage, context: SeoContext): object {
  const { root } = context
  const home = [site.routes.home.label, ''] as const
  const graph: object[] = [website(root)]

  switch (page.id) {
    case 'home':
    case 'notFound':
      graph.push(
        webPage(page, root, 'ProfilePage', { mainEntity: { '@id': personId(root) } }),
        person(context, {
          hasCredential: featuredCredentials.map((credential) => ({
            '@type': 'EducationalOccupationalCredential',
            name: credential.title,
            credentialCategory: `certification, ${credential.level}`,
            recognizedBy: { '@type': 'Organization', name: credential.issuer },
            url: credential.href,
          })),
        }),
      )
      break
    case 'builds':
      graph.push(
        webPage(page, root, 'CollectionPage', {
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: builds.length,
            itemListElement: builds.map((build, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: `${root}${site.routes.builds.path}${build.slug}/`,
              name: build.title,
            })),
          },
          author: { '@id': personId(root) },
        }),
        breadcrumbs(root, [home, [site.routes.builds.label, site.routes.builds.path]]),
        person(context),
      )
      break
    case 'project':
      graph.push(
        webPage(page, root, 'WebPage', { mainEntity: { '@id': `${root}${pathOf(page)}#software` }, author: { '@id': personId(root) } }),
        software(page.build, root),
        breadcrumbs(root, [home, [site.routes.builds.label, site.routes.builds.path], [page.build.title, pathOf(page)]]),
        person(context),
      )
      break
    case 'experience':
      graph.push(
        webPage(page, root, 'ProfilePage', { mainEntity: { '@id': personId(root) } }),
        breadcrumbs(root, [home, [site.routes.experience.label, site.routes.experience.path]]),
        person(context, { worksFor: experienceRoles() }),
      )
      break
    case 'credentials':
      graph.push(
        webPage(page, root, 'CollectionPage', {
          about: { '@id': personId(root) },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: context.credentials.length,
            itemListElement: context.credentials.map((credential, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'EducationalOccupationalCredential',
                name: credential.title,
                credentialCategory: 'certification',
                recognizedBy: { '@type': 'Organization', name: credential.issuer },
                ...(credential.href ? { url: credential.href } : {}),
                ...(credential.issued ? { dateCreated: credential.issued } : {}),
              },
            })),
          },
        }),
        breadcrumbs(root, [home, [site.routes.credentials.label, site.routes.credentials.path]]),
        person(context),
      )
      break
    case 'me':
      graph.push(
        webPage(page, root, 'ProfilePage', { mainEntity: { '@id': personId(root) } }),
        breadcrumbs(root, [home, [site.routes.me.label, site.routes.me.path]]),
        person(context),
      )
      break
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

/* ---------- The head ---------- */

/** Every tag a page's head needs beyond charset, viewport and colour scheme. */
export function headTags(page: SeoPage, context: SeoContext): string {
  const { root } = context
  const url = `${root}${pathOf(page)}`
  const title = escapeHtml(titleOf(page))
  const description = escapeHtml(descriptionOf(page))
  const image = `${root}${seo.image.path}`
  // Files on this site are linked by path, so they load from wherever the build is served (preview, staging).
  const local = new URL(root).pathname
  const isProfile = page.id === 'home' || page.id === 'experience'
  const indexable = page.id !== 'notFound'
  const json = JSON.stringify(jsonLd(page, context)).replaceAll('<', '\\u003c')

  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    indexable
      ? `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />`
      : `<meta name="robots" content="noindex, follow" />`,
    indexable ? `<link rel="canonical" href="${url}" />` : '',
    `<meta name="author" content="${escapeHtml(owner)}" />`,
    `<meta name="theme-color" media="(prefers-color-scheme: light)" content="${seo.themeColor.light}" />`,
    `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${seo.themeColor.dark}" />`,
    `<meta property="og:type" content="${isProfile ? 'profile' : 'website'}" />`,
    isProfile ? `<meta property="profile:first_name" content="${escapeHtml(givenName)}" />` : '',
    isProfile ? `<meta property="profile:last_name" content="${escapeHtml(familyName)}" />` : '',
    `<meta property="og:site_name" content="${escapeHtml(owner)}" />`,
    `<meta property="og:locale" content="${seo.locale}" />`,
    indexable ? `<meta property="og:url" content="${url}" />` : '',
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="${seo.image.width}" />`,
    `<meta property="og:image:height" content="${seo.image.height}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(seo.image.alt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<meta name="twitter:image:alt" content="${escapeHtml(seo.image.alt)}" />`,
    `<link rel="icon" href="${local}favicon.ico" sizes="48x48" />`,
    `<link rel="icon" href="${local}favicon.svg" type="image/svg+xml" />`,
    `<link rel="apple-touch-icon" href="${local}apple-touch-icon.png" />`,
    `<link rel="manifest" href="${local}site.webmanifest" />`,
    `<link rel="alternate" type="text/markdown" href="${local}llms.txt" title="${escapeHtml(owner)}, for language models" />`,
    ...(page.id === 'home' ? profiles().map((href) => `<link rel="me" href="${href}" />`) : []),
    `<script type="application/ld+json">${json}</script>`,
  ]
  return tags.filter(Boolean).join('\n    ')
}

/* ---------- Files for crawlers ---------- */

/**
 * Search and AI crawlers are all welcome: the point of the site is to be found and quoted correctly.
 * The AI crawlers are named so the choice is explicit; to stop a model training on the site, give its
 * training crawler (GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot) a `Disallow: /`.
 */
const aiCrawlers = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Amazonbot',
  'Meta-ExternalAgent',
  'DuckAssistBot',
  'MistralAI-User',
  'cohere-ai',
  'CCBot',
]

export function robotsTxt(root: string): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# AI search and assistant crawlers are welcome too.',
    ...aiCrawlers.map((agent) => `User-agent: ${agent}`),
    'Allow: /',
    '',
    `Sitemap: ${root}sitemap.xml`,
    '',
  ].join('\n')
}

export function sitemapXml(root: string, lastModified: (page: SeoPage) => string | undefined): string {
  const urls = indexablePages().map((page) => {
    const modified = lastModified(page)
    return `  <url>\n    <loc>${root}${pathOf(page)}</loc>${modified ? `\n    <lastmod>${modified}</lastmod>` : ''}\n  </url>`
  })
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

export function webManifest(root: string): string {
  return `${JSON.stringify(
    {
      name: owner,
      short_name: site.monogram,
      description: site.routes.home.description,
      start_url: root,
      scope: root,
      display: 'browser',
      background_color: seo.themeColor.light,
      theme_color: seo.themeColor.light,
      icons: [
        { src: `${root}icon-192.png`, sizes: '192x192', type: 'image/png' },
        { src: `${root}icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        { src: `${root}favicon.svg`, sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2,
  )}\n`
}

/** The short version for language models: who this is and where everything lives. See https://llmstxt.org. */
export function llmsTxt(root: string): string {
  const pages = (Object.keys(site.routes) as RouteId[]).filter((id) => id !== 'me' || site.features.mePage)
  return [
    `# ${owner}`,
    '',
    `> ${owner} (${contact.badge.handle}) is a ${seo.person.jobTitle.join(' and ')} at ${seo.person.employer.name} in ${seo.person.locality}. ${site.hero.statement}`,
    '',
    `He builds open source AI and developer tools: MCP tooling, local-model command line tools, in-browser AI and small apps. Every number on the site comes from the project's own README or benchmark.`,
    '',
    '## Pages',
    '',
    ...pages.map((id) => `- [${site.routes[id].label}](${root}${site.routes[id].path}): ${site.routes[id].description}`),
    '',
    '## Builds',
    '',
    ...builds.map((build) => {
      const links = build.links.map((item) => `${item.kind}: ${item.href}`).join('; ')
      return `- [${build.title}](${root}${site.routes.builds.path}${build.slug}/): ${build.summary} (${build.kind}, ${build.year}; ${links})`
    }),
    '',
    '## Profiles',
    '',
    ...contact.links.map((item) => `- [${item.label}](${item.href}): ${item.detail}`),
    `- [Credly](${site.credentialsPage.wallet}): verified certifications`,
    `- Email: ${contact.email}`,
    '',
    '## Optional',
    '',
    `- [Everything on the site in one file](${root}llms-full.txt): every build's full write-up, the career record and the credentials, in Markdown`,
    '',
  ].join('\n')
}

/** The long version: all of the site's text, in Markdown, for a model that wants everything in one fetch. */
export function llmsFullTxt(context: SeoContext): string {
  const { root, credentials } = context
  const lines: string[] = [
    `# ${owner}`,
    '',
    `> ${seo.person.jobTitle.join(' and ')} at ${seo.person.employer.name}, ${seo.person.locality}. ${site.hero.statement}`,
    '',
    `Site: ${root}`,
    `Handle: ${contact.badge.handle} (GitHub and npm)`,
    '',
    '## About',
    '',
    `${site.experience.title} ${site.experience.lead}`,
    '',
    ...toolGroups.map((group) => `- ${group.label}: ${group.tools.join(', ')}`),
    '',
    '## Builds',
    '',
  ]

  for (const build of builds) {
    const story = buildStories[build.slug as keyof typeof buildStories]
    lines.push(`### ${build.title}`, '', `${build.summary}`, '')
    lines.push(`- Page: ${root}${site.routes.builds.path}${build.slug}/`)
    lines.push(`- Kind: ${build.kind}, ${build.year}`)
    lines.push(`- Stack: ${build.stack.join(', ')}`)
    for (const item of build.links) lines.push(`- ${item.kind}: ${item.href}`)
    lines.push('')
    if (!story) continue
    lines.push(markdown(story.overview), '')
    if (story.facts?.length) {
      lines.push('Measured:', '', ...story.facts.map((fact) => `- ${fact.value}: ${fact.label}`), '')
    }
    lines.push(`${site.projectPage.sections.features}:`, '', ...story.features.map((line) => `- ${markdown(line)}`), '')
    if (story.useCase) lines.push(`${story.useCase.title}:`, '', ...story.useCase.paragraphs.map(markdown).flatMap((p) => [p, '']))
    if (story.engineering?.length) {
      lines.push(`${site.projectPage.sections.engineering}:`, '', ...story.engineering.map((line) => `- ${markdown(line)}`), '')
    }
    if (story.limits?.length) {
      lines.push(`${site.projectPage.sections.limits}:`, '', ...story.limits.map((line) => `- ${markdown(line)}`), '')
    }
  }

  lines.push('## Experience', '')
  for (const employer of employers) {
    lines.push(`### ${employer.name}, ${employer.place} (${yearsAt(employer.from, employer.to)})`, '')
    for (const role of employer.roles) {
      lines.push(`#### ${role.title} (${yearsAt(role.from, role.to)})`, '', role.scope, '')
      lines.push('Built:', '', ...role.built.map((line) => `- ${line}`), '')
      lines.push('Delivered:', '', ...role.delivered.map((line) => `- ${line}`), '')
      lines.push(`Tools: ${role.tools.join(', ')}`, '')
    }
  }

  lines.push('## Recognition', '', ...recognition.map((item) => `- ${item.title}, ${item.when}${item.by ? `, by ${item.by}` : ''}`), '')

  lines.push('## Credentials', '')
  for (const credential of credentials) {
    const verify = credential.href ? ` (verify: ${credential.href})` : ''
    lines.push(`- ${credential.title}, ${credential.issuer}${credential.issued ? `, ${credential.issued}` : ''}${verify}`)
  }
  lines.push('')

  lines.push('## Contact', '', `- Email: ${contact.email}`, ...contact.links.map((item) => `- ${item.label}: ${item.href}`), '')
  return lines.join('\n')
}

/** RFC 9116: where to report a security problem. Valid for a year from each build. */
export function securityTxt(root: string, now = new Date()): string {
  const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
  return [
    `Contact: mailto:${contact.email}`,
    `Expires: ${expires}`,
    'Preferred-Languages: en',
    `Canonical: ${root}.well-known/security.txt`,
    '',
  ].join('\n')
}
