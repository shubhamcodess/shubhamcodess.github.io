/** The writing, made at build time from content/writing/ by the Vite config's writingPages() plugin. Typed in lib/writing.ts. */
declare module 'virtual:writing' {
  /** Every published post, newest first, without its body. */
  export const posts: readonly unknown[]
  /** Each post's body (its HTML), loaded only on that post's page. */
  export const bodies: Readonly<Record<string, () => Promise<{ readonly default: string }>>>
}
