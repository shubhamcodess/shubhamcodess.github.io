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
}

export const recognition: readonly Recognition[] = [
  {
    title: 'IBM Delivery Exemplar, Award of Excellence',
    when: '2026',
    by: 'IBM Consulting',
    certificate: 'certificates/ibm-delivery-exemplar-2026.jpg',
  },
]

export interface Credential {
  readonly title: string
  readonly issuer: string
  /** The public verification page, when there is one. */
  readonly href?: `https://${string}`
}

/**
 * Grouped by issuer on the page, in the order issuers first appear here.
 * Source: the owner's Credly wallet (credly.com/users/shubham-prakash.b983dbb5), read 2026-11-15.
 * Only current, skill-bearing badges. Left out: expired ones, and onboarding, culture and event-attendance badges.
 * GitHub's exams and the Azure Developer renewal are not on Credly, so they carry no link.
 */
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
    title: 'Claude Certified Developer, Foundations',
    issuer: 'Anthropic',
    href: 'https://www.credly.com/badges/e4444fdd-9c6d-40be-b9ad-e8db08c23408/public_url',
  },
  {
    title: 'Claude Certified Associate, Foundations',
    issuer: 'Anthropic',
    href: 'https://www.credly.com/badges/fb521f6f-05ca-4948-82a4-3737c854b6fd/public_url',
  },
  {
    title: 'Claude Partner Badge, Claude Code',
    issuer: 'Anthropic',
    href: 'https://www.credly.com/badges/2e6272cf-76d7-45d7-9ddc-fc288f40a431/public_url',
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
  {
    title: 'Azure Fundamentals',
    issuer: 'Microsoft',
    href: 'https://www.credly.com/badges/c71041ab-b384-4dd3-a31e-c6325d797f56/public_url',
  },
  { title: 'GitHub Actions', issuer: 'GitHub' },
  { title: 'GitHub Copilot', issuer: 'GitHub' },
  {
    title: 'Introduction to OpenShift Applications (DO101)',
    issuer: 'Red Hat',
    href: 'https://www.credly.com/badges/b3f16bf6-86b6-4cdd-a584-096d99b3134b/public_url',
  },
  {
    title: 'Certified Advocate, Cloud v1',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/112650b3-886f-4a75-b086-9e3dcd6b66b0/public_url',
  },
  {
    title: 'Generative and Agentic AI Foundation',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/2dbabb86-8108-4e38-b28a-d00a44c6cfb7/public_url',
  },
  {
    title: 'watsonx.data Practitioner Advanced',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/1c822489-91fe-4962-a67b-6f5e004418ce/public_url',
  },
  {
    title: 'watsonx.ai Technical Essentials',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/3b946cde-d89a-4824-91f0-9433bd40531b/public_url',
  },
  { title: 'watsonx Essentials', issuer: 'IBM', href: 'https://www.credly.com/badges/b929f47c-661c-442a-81f2-8c774f05e844/public_url' },
  {
    title: 'Trustworthy AI and AI Ethics',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/e8c90d40-e57d-44b6-9ed6-905c448f016d/public_url',
  },
  {
    title: 'IBMer watsonx Challenge 2026',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/ca2f59a8-dbef-4743-8435-3c4c9871e6ac/public_url',
  },
  {
    title: 'Bobathon Innovator 2026',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/3e213c21-5384-40b6-aa80-9e9b509bb2d5/public_url',
  },
  {
    title: 'Security and Privacy by Design Foundations',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/c6449496-e563-4a57-81ef-5d1156af4a67/public_url',
  },
  { title: 'DevSecOps Essentials', issuer: 'IBM', href: 'https://www.credly.com/badges/127a2766-a813-42e7-9730-94aa146f72e3/public_url' },
  {
    title: 'Cloud Native Starter, Level 1',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/baec6e41-ffd1-44ec-86b5-453433930701/public_url',
  },
  {
    title: 'Automation Practitioner',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/45f2d19a-9002-4a7e-9a23-0be99113d916/public_url',
  },
  {
    title: 'Enterprise Design Thinking Practitioner',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/40e0afcb-d224-4aa1-ae98-2fa6c16e1b55/public_url',
  },
  {
    title: 'Garage Method for Cloud Advocate',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/9c68c321-8e8d-4c12-b94f-a42709df4628/public_url',
  },
  {
    title: 'Cloud Garage Test-Driven Development',
    issuer: 'IBM',
    href: 'https://www.credly.com/badges/bac811ab-0d96-4908-9f75-dd2e7c9bb01d/public_url',
  },
]
