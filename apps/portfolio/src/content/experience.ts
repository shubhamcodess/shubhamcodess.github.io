/**
 * The career record. Clients stay unnamed; the employer is fine to name.
 * Every claim comes from the owner's own public profile. Don't round anything up.
 * A new employer is a new object at the top of `employers`; the page stacks them as layers, newest first.
 */

export interface Role {
  readonly title: string
  readonly from: number
  /** Leave out while this is the current role. */
  readonly to?: number
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
  /** Newest role first. Keep it to three at most. */
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
        from: 2025,
        scope:
          'Products from requirement to production: backend, frontend, schema and deployment. And AI agents for enterprise applications.',
        built: [
          'A browser-based Kubernetes fleet control plane, with an MCP server and an AI assistant',
          'A workflow platform with a visual DAG builder and live run monitoring',
        ],
        delivered: [
          'A reusable CI/CD framework, adopted across 10+ repositories',
          'Leads the team: PR reviews, code standards and architecture decisions',
        ],
        tools: ['Java', 'Next.js', 'Kubernetes', 'GKE', 'GitHub Actions', 'RabbitMQ', 'MCP'],
      },
      {
        title: 'Full Stack Developer',
        from: 2023,
        to: 2024,
        scope: 'Moving enterprise applications off a legacy stack, then leading a B2B order platform into production.',
        built: [
          "The pilot's Angular codebase and team standards from scratch; it got the wider migration approved",
          'The shared framework every source-system integration runs on',
          "The program's first single sign-on",
        ],
        delivered: [
          'A B2B order platform live in production, its architecture co-designed with the solution architect',
          'An inventory valuation app, a month ahead of schedule',
          'Led teams of up to 10 engineers',
        ],
        tools: ['Java', 'Spring', 'Angular', 'TypeScript', 'Oracle', 'OpenShift', 'Azure AD'],
      },
      {
        title: 'Application Developer',
        from: 2020,
        to: 2022,
        scope: 'The global tax engines behind every in-store and online sale of a multinational retailer.',
        built: [
          'A unit-testing framework for a legacy Spring codebase that had none',
          'An advance-check process that replaced repeated tax-holiday firefighting',
        ],
        delivered: [
          'Two platform migrations: OpenShift 3 to 4, then OpenShift to GKE',
          'Production deployments and high-priority incidents, owned end to end',
        ],
        tools: ['Java', 'Spring', 'Angular', 'OpenShift', 'GKE'],
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
  /** A small copy of the certificate for its frame on the page, 640px wide. The full image opens on click. */
  readonly thumbnail?: string
}

export const recognition: readonly Recognition[] = [
  {
    title: 'IBM Delivery Exemplar, Award of Excellence',
    when: '2026',
    by: 'IBM Consulting',
    certificate: 'certificates/ibm-delivery-exemplar-2026.jpg',
    thumbnail: 'certificates/ibm-delivery-exemplar-2026-640.webp',
  },
]

// Credentials are not here: see credentials-source.ts and public/data/credentials.json.

export interface FeaturedCredential {
  /** The level, shown small above the title, such as "Professional". */
  readonly level: string
  readonly title: string
  readonly issuer: string
  readonly href: `https://${string}`
  /** The credential's own badge, as a path under /public. */
  readonly badge?: string
}

/**
 * The three credentials shown as patches on the home page: the highest level from each main issuer.
 * Kept here, not loaded with the full list, so they are there on first paint. Links match public/data/credentials.json.
 */
export const featuredCredentials: readonly FeaturedCredential[] = [
  {
    level: 'Professional',
    title: 'Claude Certified Architect',
    issuer: 'Anthropic',
    href: 'https://www.credly.com/badges/cc59c5f1-1ddb-4a12-bd7f-8398b7407834/public_url',
    badge: 'badges/claude-certified-architect-professional.webp',
  },
  {
    level: 'Foundations',
    title: 'Claude Certified Architect',
    issuer: 'Anthropic',
    href: 'https://www.credly.com/badges/a2e244ea-f008-415b-a4b1-5473415de90e/public_url',
    badge: 'badges/claude-certified-architect-foundations.webp',
  },
  {
    level: 'Associate',
    title: 'Cloud Engineer',
    issuer: 'Google Cloud',
    href: 'https://www.credly.com/badges/e5c52470-9f7f-41b7-9ed5-1d300f5e7b5c/public_url',
    badge: 'badges/associate-cloud-engineer.webp',
  },
]
