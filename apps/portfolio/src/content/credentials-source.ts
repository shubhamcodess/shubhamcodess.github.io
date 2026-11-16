/**
 * How the credentials page is filled. `scripts/fetch-credentials.mjs` reads the Credly wallet below,
 * applies these rules, adds the extras, and writes public/data/credentials.json. The page loads that file
 * at runtime, so the list never sits in the JavaScript bundle. Re-run the script to pick up new badges:
 *   pnpm --filter @portfolio/app data
 */

export interface CredentialRecord {
  readonly title: string
  readonly issuer: string
  /** The public verification page, when there is one. */
  readonly href?: string
  /** ISO dates. */
  readonly issued?: string
  readonly expires?: string
}

export const credlyUser = 'shubham-prakash.b983dbb5'

/** Badges whose name contains any of these are left out: onboarding, culture, events, entry-level courses. */
export const exclude: readonly string[] = [
  'The IBM Way',
  'Growth Behaviors',
  'Consulting Way Habits',
  'Agile Explorer',
  'Communicating Value',
  'Jumpstart',
  'Delivery Central',
  'Security Conference',
  'Cloud Essentials',
  'Python for Data Science',
  'Data Science Foundations',
  'Cognitive Practitioner',
  'Think Like a Hacker',
  'Automation: Compass',
  'Sales Foundation',
]

/** Credentials that are real but not on Credly. Listed after the Credly ones of the same issuer. */
/** Microsoft Learn's public page for each of these, from the owner's Microsoft Learn credentials dashboard. */
const learn = (id: string) => `https://learn.microsoft.com/api/credentials/share/en-us/ShubhamPrakash-0907/${id}`

export const extras: readonly CredentialRecord[] = [
  { title: 'Azure Developer Associate', issuer: 'Microsoft', href: learn('A9A4C4AC8AE15190'), issued: '2022-07-11', expires: '2027-07-12' },
  // Also on Credly; Microsoft Learn is the issuer's own record, so it replaces that badge.
  { title: 'Azure Fundamentals', issuer: 'Microsoft', href: learn('A5AA8C0B9FDE08DF'), issued: '2021-04-07' },
  { title: 'GitHub Actions', issuer: 'GitHub', href: learn('31B22DB52FA5AE9B'), issued: '2026-07-06', expires: '2028-07-07' },
  { title: 'GitHub Copilot', issuer: 'GitHub', href: learn('BD28F1B729CDFF64'), issued: '2026-08-10', expires: '2028-08-11' },
]

/** Issuer names as Credly spells them, mapped to how the page shows them. */
export const issuerNames: Readonly<Record<string, string>> = {
  'IBM Professional Certification': 'IBM',
  'Amazon Web Services Training and Certification': 'AWS',
}

/** Order of issuers on the page. Any issuer not named here follows, alphabetically. */
export const issuerOrder: readonly string[] = ['Anthropic', 'Google Cloud', 'Microsoft', 'GitHub', 'Red Hat', 'IBM']

/** Title tidying: Credly's suffixes the page doesn't need. */
export const titleRewrites: readonly (readonly [pattern: string, replacement: string])[] = [
  [' - Ver. 4.6', ''],
  [' - ', ', '],
  [' Certification', ''],
  ['Microsoft Certified: ', ''],
  // The issuer heading already says IBM.
  ['IBM ', ''],
  ['Introduction to Red Hat OpenShift', 'Introduction to OpenShift'],
]
