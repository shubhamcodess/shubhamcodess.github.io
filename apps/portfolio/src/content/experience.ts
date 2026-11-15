/**
 * The career record. Clients stay unnamed; the employer is fine to name.
 * Every claim comes from the owner's own public profile. Don't round anything up.
 * A new employer is a new object at the top of `employers`; the page stacks them as layers, newest first.
 */

export interface Role {
  readonly title: string
  /** One sentence on what the role covered. */
  readonly scope: string
  /** What was made. Three or four lines, the strongest only. */
  readonly built: readonly string[]
  /** What came of it. Three or four lines, the strongest only. */
  readonly delivered: readonly string[]
  readonly tools: readonly string[]
}

export interface Employer {
  readonly name: string
  readonly from: number
  /** Leave out while this is the current employer. */
  readonly to?: number
  readonly place: string
  /** Newest role first. */
  readonly roles: readonly Role[]
}

export const employers: readonly Employer[] = [
  {
    name: 'IBM',
    from: 2020,
    place: 'Bengaluru',
    roles: [
      {
        title: 'Sr. Cloud Full Stack Developer',
        scope:
          'Products from requirement to production: backend, frontend, schema and deployment. And AI agents for enterprise applications.',
        built: [
          'A browser-based Kubernetes fleet control plane, with an MCP server and an AI assistant',
          'A workflow platform with a visual DAG builder and live run monitoring',
          'The shared framework every source-system integration runs on',
        ],
        delivered: [
          'A reusable CI/CD framework, adopted across 10+ repositories',
          'A B2B order platform live in production, its architecture co-designed with the solution architect',
          'An inventory valuation app, a month ahead of schedule',
          'Leads the team: PR reviews, code standards and architecture decisions',
        ],
        tools: ['Java', 'Next.js', 'Kubernetes', 'GKE', 'GitHub Actions', 'RabbitMQ', 'MCP'],
      },
      {
        title: 'Application Developer',
        scope:
          'The global tax engines behind every in-store and online sale of a multinational retailer: kept them running, then moved them to a modern stack.',
        built: [
          "The pilot's Angular codebase and team standards from scratch; it got the wider migration approved",
          "The program's first single sign-on",
          'A unit-testing framework for a legacy Spring codebase that had none',
        ],
        delivered: [
          'Two platform migrations: OpenShift 3 to 4, then OpenShift to GKE',
          'A 10,000-item dropdown that feels instant',
          'Production deployments and high-priority incidents, owned end to end',
          'Led teams of up to 10 engineers',
        ],
        tools: ['Java', 'Spring', 'Angular', 'TypeScript', 'OpenShift', 'GKE', 'Azure AD'],
      },
    ],
  },
]

export interface Recognition {
  readonly title: string
  readonly when: string
  readonly by?: string
  /**
   * The certificate image, as a path under /public (for example "certificates/delivery-exemplar-2026.webp").
   * When set, the certificate follows the pointer while it is over this recognition.
   */
  readonly certificate?: string
}

export const recognition: readonly Recognition[] = [{ title: 'Delivery Exemplar', when: '2026' }]

export interface Credential {
  readonly title: string
  readonly issuer: string
  /** The public verification page, when there is one. */
  readonly href?: `https://${string}`
}

/** Grouped by issuer on the page, in the order issuers first appear here. */
export const credentials: readonly Credential[] = [
  {
    title: 'Claude Certified Architect, Professional',
    issuer: 'Anthropic',
    href: 'https://www.credly.com/badges/cc59c5f1-1ddb-4a12-bd7f-8398b7407834/public_url',
  },
  {
    title: 'Claude Certified Architect, Foundations',
    issuer: 'Anthropic',
    href: 'https://www.credly.com/badges/a2e244ea-f008-415b-a4b1-5473415de90e/public_url',
  },
  {
    title: 'Associate Cloud Engineer',
    issuer: 'Google Cloud',
    href: 'https://www.credly.com/badges/e5c52470-9f7f-41b7-9ed5-1d300f5e7b5c/public_url',
  },
  {
    title: 'Generative AI Leader',
    issuer: 'Google Cloud',
    href: 'https://www.credly.com/badges/ca549244-79c2-45a1-9b75-0f972ec11f47/public_url',
  },
  {
    title: 'Cloud Digital Leader',
    issuer: 'Google Cloud',
    href: 'https://www.credly.com/badges/0c61b0e2-e3b1-4009-8948-52661ba8f284/public_url',
  },
  { title: 'Azure Developer Associate', issuer: 'Microsoft' },
  { title: 'GitHub Actions', issuer: 'GitHub' },
  { title: 'GitHub Copilot', issuer: 'GitHub' },
  { title: 'Certified Advocate, Cloud v1', issuer: 'IBM' },
  { title: 'IBMer watsonx Challenge 2026', issuer: 'IBM' },
  { title: 'Bobathon Innovator 2026', issuer: 'IBM' },
]
