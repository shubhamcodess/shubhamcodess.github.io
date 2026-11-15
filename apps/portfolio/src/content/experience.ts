/**
 * The career story, oldest first. Clients stay unnamed. The employer is fine to name.
 * Every claim comes from the owner's own public profile. Don't round anything up.
 */

export interface ExperienceEntry {
  /** A past-tense verb, set apart like a commit type. */
  readonly verb: string
  readonly what: string
}

export interface ExperienceChapter {
  /** The marker on the timeline: a year, or a word such as "Then" where no year is published. */
  readonly stop: string
  readonly title: string
  readonly role: string
  readonly line: string
  readonly log: readonly ExperienceEntry[]
  readonly tools: readonly string[]
}

export const experience = [
  {
    stop: '2020',
    title: 'Keeping it running.',
    role: 'Associate System Engineer, IBM',
    line: 'The global tax engines behind every in-store and online sale of a multinational retailer.',
    log: [
      { verb: 'owned', what: 'production deployments and high-priority incidents' },
      { verb: 'migrated', what: 'the platform twice: OpenShift 3 to 4, then OpenShift to GKE' },
      { verb: 'replaced', what: 'repeated tax-holiday firefighting with an advance-check process' },
      { verb: 'built', what: 'a unit-testing framework for a legacy Spring codebase that had none' },
    ],
    tools: ['Java', 'Spring', 'Angular', 'OpenShift', 'GKE'],
  },
  {
    stop: 'Then',
    title: 'Building it.',
    role: 'Application Developer, IBM',
    line: 'Moving enterprise applications off a legacy stack, starting with the pilot that had to prove it.',
    log: [
      { verb: 'built', what: "the pilot's Angular codebase and team standards from scratch; it got the wider migration approved" },
      { verb: 'made', what: 'a 10,000-item dropdown feel instant' },
      { verb: 'built', what: 'a multi-day calendar view natively, with no library' },
      { verb: 'shipped', what: "the program's first single sign-on" },
      { verb: 'led', what: 'teams of up to 10 engineers' },
    ],
    tools: ['Angular', 'TypeScript', 'Spring', 'Java', 'OpenShift', 'Azure AD'],
  },
  {
    stop: 'Then',
    title: 'Leading it.',
    role: 'Team lead and shadow architect, IBM',
    line: 'A B2B order platform live in production, with its architecture co-designed alongside the solution architect.',
    log: [
      { verb: 'designed', what: 'the shared framework every source-system integration runs on' },
      { verb: 'reworked', what: 'batch processing with bounded concurrency and a tuned thread executor' },
      { verb: 'turned', what: 'a 20-minute data compile into seconds' },
      { verb: 'led', what: 'a team to deliver an inventory valuation app a month ahead of schedule' },
    ],
    tools: ['Java', 'Spring', 'Angular', 'Oracle', 'OpenShift'],
  },
  {
    stop: 'Now',
    title: 'Owning it, end to end.',
    role: 'Cloud Full Stack Developer, IBM',
    line: 'Products from requirement to production: backend, frontend, schema and deployment. And AI agents for enterprise applications.',
    log: [
      { verb: 'designed', what: 'a reusable CI/CD framework, adopted across 10+ repositories' },
      { verb: 'built', what: 'a browser-based Kubernetes fleet control plane, with an MCP server and an AI assistant' },
      { verb: 'built', what: 'a workflow platform with a visual DAG builder and live run monitoring' },
      { verb: 'led', what: 'the team: PR reviews, code standards, architecture decisions' },
    ],
    tools: ['Java', 'Next.js', 'Kubernetes', 'GKE', 'GitHub Actions', 'RabbitMQ', 'MCP'],
  },
] as const satisfies readonly ExperienceChapter[]

/** Numbers lifted straight from the chapters above, for the record view. */
export const highlights = [
  { value: '10+', label: 'repositories on the CI/CD framework I designed' },
  { value: '2', label: 'platform migrations: OpenShift 3 to 4, then to GKE' },
  { value: '10', label: 'engineers in the largest team I led' },
  { value: '20 min', label: 'data compile turned into seconds' },
] as const

export interface Recognition {
  readonly title: string
  readonly by: string
  readonly when: string
}

export const recognition = [
  { title: 'IBMer watsonx Challenge', by: 'IBM', when: '2026' },
  { title: 'Bobathon Innovator', by: 'IBM', when: '2026' },
] as const satisfies readonly Recognition[]

export interface Credential {
  readonly title: string
  readonly issuer: string
  /** The public verification page, when there is one. */
  readonly href?: `https://${string}`
}

export const credentials = [
  { title: 'Claude Certified Architect, Professional', issuer: 'Anthropic', href: 'https://www.credly.com/badges/cc59c5f1-1ddb-4a12-bd7f-8398b7407834/public_url' },
  { title: 'Claude Certified Architect, Foundations', issuer: 'Anthropic', href: 'https://www.credly.com/badges/a2e244ea-f008-415b-a4b1-5473415de90e/public_url' },
  { title: 'Associate Cloud Engineer', issuer: 'Google Cloud', href: 'https://www.credly.com/badges/e5c52470-9f7f-41b7-9ed5-1d300f5e7b5c/public_url' },
  { title: 'Generative AI Leader', issuer: 'Google Cloud', href: 'https://www.credly.com/badges/ca549244-79c2-45a1-9b75-0f972ec11f47/public_url' },
  { title: 'Cloud Digital Leader', issuer: 'Google Cloud', href: 'https://www.credly.com/badges/0c61b0e2-e3b1-4009-8948-52661ba8f284/public_url' },
  { title: 'Azure Developer Associate', issuer: 'Microsoft' },
  { title: 'GitHub Actions', issuer: 'GitHub' },
  { title: 'GitHub Copilot', issuer: 'GitHub' },
  { title: 'Certified Advocate, Cloud v1', issuer: 'IBM' },
] as const satisfies readonly Credential[]
