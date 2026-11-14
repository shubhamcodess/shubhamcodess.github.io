import type { Build } from './types'

/**
 * Every public build, in display order for the All builds page.
 * Facts come from each repository's README and its own benchmarks. Don't round numbers up.
 */
export const builds = [
  {
    slug: 'mcp-token-optimizer',
    title: 'MCP Token Optimizer',
    kind: 'AI tooling',
    summary:
      'A self-hosted proxy between your AI agent and its MCP servers. It shrinks every tool response without changing what the agent can do.',
    year: 2026,
    stack: ['TypeScript', 'Node.js', 'MCP', 'Ollama', 'TOON'],
    highlight: { value: '98.4%', label: 'tokens saved on a CI build log' },
    links: [
      { kind: 'code', href: 'https://github.com/shubhamcodess/mcp-token-optimizer' },
      { kind: 'live', href: 'https://shubhamcodess.github.io/mcp-token-optimizer/' },
      { kind: 'package', href: 'https://www.npmjs.com/package/@shubhamcodess/mcp-token-optimizer' },
    ],
    story: {
      overview:
        'Every token an MCP tool returns is paid for and fills the context window, and real tool output is mostly noise: null fields, hypermedia URLs, repeated blocks and progress-bar spam. This proxy sits between the agent and its MCP servers and shrinks each response by pruning, TOON encoding and local summarization. It talks only to your own MCP servers and a local Ollama.',
      facts: [
        { value: '98.4%', label: 'tokens saved on a CI build log' },
        { value: '64.5%', label: 'saved on a list of 40 GitHub issues' },
        { value: '48.7%', label: 'saved on a live Kubernetes run' },
      ],
      features: [
        'Works with any MCP client through a stdio wrapper or a local HTTP proxy: VS Code Copilot, Claude, Cursor, Windsurf, Gemini CLI, Cline and Roo.',
        'Shadow mode measures real savings while still forwarding the originals, so it can roll out with no risk.',
        'Notes name exactly what was pruned, and the agent can fetch the exact original on demand.',
        'A local dashboard shows live traffic, connections, config, eval history and drift warnings, with no CDN.',
      ],
      engineering: [
        'Lossless first: JSON becomes TOON only after a verified round trip, and duplicate blocks become pointers.',
        'Fail-open and never bigger: any error, timeout or Ollama outage forwards the original, and an optimized result is used only when it is strictly cheaper.',
        'Quality gates for CI, a drift watcher and per-client profiles, with hot-reloaded config.',
        'In the live A/B run, the three files the agent wrote from the optimized result were byte-identical to the originals.',
      ],
      limits: ['Token counts are a model-agnostic estimate.', 'Numbers come from the repository benchmark, which anyone can re-run.'],
    },
  },
  {
    slug: 'whatcmd',
    title: 'whatcmd',
    kind: 'Developer tool',
    summary:
      'Type plain English at your shell prompt and get the right command for your OS and installed tools. A local model, no API keys, and nothing runs until you press Enter.',
    year: 2026,
    stack: ['TypeScript', 'Node.js', 'Ollama', 'zsh', 'bash'],
    highlight: { value: '217 ms', label: 'median end to end, on an M4 Pro' },
    links: [
      { kind: 'code', href: 'https://github.com/shubhamcodess/whatcmd' },
      { kind: 'live', href: 'https://shubhamcodess.github.io/whatcmd/' },
      { kind: 'package', href: 'https://www.npmjs.com/package/@shubhamcodess/whatcmd' },
    ],
    story: {
      overview:
        'Type /w followed by what you want, such as "find files bigger than 100MB", and the line is replaced with the right command for your machine. It knows your OS, shell, GNU or BSD flags and installed tools, and it never runs anything until you press Enter.',
      facts: [
        { value: '217 ms', label: 'median end to end, on an M4 Pro' },
        { value: '92.7%', label: 'overall on my 500-case benchmark' },
        { value: '98.8%', label: 'of non-shell requests refused' },
      ],
      features: [
        'Reads the man page or help text of the tools you name, so flags are real and not guessed.',
        'Refine the last command instead of retyping it, and "fix that" knows the exit status.',
        'Warns before damage, such as recursive deletes, dd, piping curl to a shell and force pushes.',
        'Looks things up on the web only when the local answer fails, through tiny-browse.',
      ],
      engineering: [
        'An output gate rejects non-shell text, repeated requests and copied examples, with targeted retry hints for missing programs and GNU-only flags on macOS.',
        'Grounding in local docs lifts made-up-tool cases from 0% to 85%.',
        '100% repeatable on 50 cases run three times.',
        'CI, CodeQL, dependency review, secret scanning and a tag-driven release that ships the tested tarball.',
      ],
      limits: [
        'Small models still pick wrong flags sometimes, so read before you press Enter.',
        'Benchmarked on macOS only, on one machine, with cases I wrote by hand.',
        'No fish or Windows shortcut yet.',
      ],
    },
  },
  {
    slug: 'everything-tech',
    title: 'EverythingTech',
    kind: 'App',
    summary:
      'A daily tech newspaper with no human editor. It reads 45+ sources overnight, merges the duplicates and writes each story from the full article.',
    year: 2026,
    stack: ['Python', 'GitHub Actions', 'GitHub Pages'],
    highlight: { value: '45+', label: 'sources read overnight' },
    links: [
      { kind: 'live', href: 'https://shubhamcodess.github.io/everything-tech-newsletter/' },
      { kind: 'code', href: 'https://github.com/shubhamcodess/everything-tech-newsletter' },
    ],
    story: {
      overview:
        'A newspaper that publishes itself every day at 08:30 IST. Scripts gather articles overnight and collapse coverage of the same story into one, and a scheduled routine picks, ranks and writes from the full text. There is no server, database or API key.',
      facts: [
        { value: '45+', label: 'sources read overnight' },
        { value: '08:30', label: 'published daily, IST' },
        { value: '0', label: 'servers' },
      ],
      features: [
        'One story per event, crediting every outlet that covered it.',
        'Comes out as a site, Markdown, JSON and RSS.',
        'Sources, interests, edition size and theme are all config, so it can be forked.',
        'The archive prunes itself after 30 days.',
      ],
      engineering: [
        'Scripts do everything mechanical. The model only picks, ranks and writes, and never writes HTML.',
        'A validator rejects copied sentences, filler and cut-off prose before an edition can merge.',
        'Each day is kept as Markdown, and one client-side template renders every date, so a design change updates the whole archive.',
        'The context is token-budgeted, so a small model can run the paper reliably.',
      ],
    },
  },
  {
    slug: 'tiny-browse',
    title: 'tiny-browse',
    kind: 'AI tooling',
    summary:
      'An MCP server and Node library that gives any AI agent web search. It uses the Chrome you already have and returns clean Markdown inside a hard token budget.',
    year: 2026,
    stack: ['TypeScript', 'MCP', 'Chrome DevTools Protocol'],
    highlight: { value: '0', label: 'runtime dependencies' },
    links: [
      { kind: 'code', href: 'https://github.com/shubhamcodess/tiny-browse' },
      { kind: 'package', href: 'https://www.npmjs.com/package/@shubhamcodess/tiny-browse' },
    ],
    story: {
      overview:
        'A small MCP server and Node library that searches the web in the Chrome you already have, reads the best results and returns clean Markdown inside a hard token budget. There is no bundled browser, no API key and no LLM inside.',
      facts: [
        { value: '0', label: 'runtime dependencies' },
        { value: '126 kB', label: 'package size' },
        { value: '2', label: 'tools: web_search and web_fetch' },
      ],
      features: [
        'Works with any MCP client over stdio or a shared HTTP server, or as a dependency in code.',
        'Extracts the main content by page layout, keeping headings, code, tables and lists, and dropping menus, ads and cookie banners.',
        'Packs sections into the token budget, keeping the ones most relevant to the query.',
        'Powers the web lookup step in whatcmd.',
      ],
      engineering: [
        'Search results are read three independent ways (layout, accessibility tree and selectors) and merged by vote, so a redesign rarely breaks it.',
        'Rate budgets per search engine are shared across every process on the machine, with longer pauses after a CAPTCHA.',
        'Bot checks are reported as blocked and never bypassed.',
        'No private-network access, and pages are read without your cookies.',
      ],
      limits: ['Search engines may block automated browsers.', 'No PDFs yet, and Windows is untested.'],
    },
  },
  {
    slug: 'fuzzy',
    title: 'fuzzy',
    kind: 'Developer tool',
    summary:
      'Search any GitHub repository by name, typo or meaning. A Rust engine compiled to WebAssembly builds the index in your browser, so the code never leaves it.',
    year: 2026,
    stack: ['Rust', 'WebAssembly', 'TypeScript', 'tree-sitter'],
    highlight: { value: '139 KB', label: 'search engine, gzipped' },
    links: [
      { kind: 'live', href: 'https://shubhamcodess.github.io/fuzzy/' },
      { kind: 'code', href: 'https://github.com/shubhamcodess/fuzzy' },
    ],
    story: {
      overview:
        'Paste a repository such as expressjs/express. It splits the code into functions and builds a search index in your browser. Search by keyword, typo or plain-English meaning. There is no server, and the code never leaves the browser.',
      facts: [
        { value: '139 KB', label: 'search engine, gzipped' },
        { value: '0.8 ms', label: 'typo query, native benchmark on 11,839 chunks' },
        { value: '14', label: 'languages chunked by tree-sitter' },
      ],
      features: [
        'Keyword search that ignores case and word order: "parse config" finds parseConfig.',
        'Typo search: "reponse" finds response.',
        'Meaning search: "stop users who are not logged in".',
        'Results show the matching lines, and a saved index reopens without re-indexing.',
      ],
      engineering: [
        'A Rust engine compiled to WebAssembly: an FST with edit distance 1 for typos, trigram bitmaps for substrings, BM25, HNSW for vectors and reciprocal rank fusion for hybrid results.',
        'tree-sitter keeps whole functions and classes together.',
        'Embeddings build in a worker, so keyword search works while they finish.',
      ],
      limits: [
        '3,000 files per repository and 200 KB per file. Keyword-only above 4,000 chunks.',
        '60 GitHub requests an hour without a token.',
        'The benchmark runs natively and uses random vectors for the semantic part.',
      ],
    },
  },
  {
    slug: 'openvox',
    title: 'openvox',
    kind: 'In-browser AI',
    summary:
      'Talk to GitHub. Name a profile or repository and it introduces it out loud, then answers spoken questions. Speech, retrieval and the model all run in the browser.',
    year: 2026,
    stack: ['React', 'TypeScript', 'WebGPU', 'WebLLM'],
    highlight: { value: '0', label: 'servers. Audio never leaves the browser' },
    links: [
      { kind: 'live', href: 'https://shubhamcodess.github.io/openvox/' },
      { kind: 'code', href: 'https://github.com/shubhamcodess/openvox' },
    ],
    story: {
      overview:
        'Type a GitHub username or repository. It introduces it out loud, then answers spoken questions in a natural voice. There is no backend and no API key, and audio never leaves the browser.',
      facts: [
        { value: '0', label: 'servers. Audio never leaves the browser' },
        { value: '9/10', label: 'on the built-in 10-question eval, single run' },
      ],
      features: [
        'A spoken intro that uses only numbers computed in code, never numbers a model made up.',
        'Voice or text questions, answered from profile facts and READMEs, with the sources shown.',
        'Says plainly when GitHub cannot show something, instead of guessing.',
        'Start talking and it stops. It also waits through thinking pauses.',
      ],
      engineering: [
        'The pipeline runs end to end in the tab: voice detection, speech to text, question routing, BM25 retrieval over README sections, a 1.7B model on WebGPU, then streamed speech.',
        'Speech recognition runs on WASM and the model on WebGPU, in separate workers, so they do not compete for the GPU.',
        'A speech normalizer turns links, commands and acronyms into text that can be spoken.',
        'The built-in eval mixes fact lookups with trap questions, and was used to pick the model.',
      ],
      limits: [
        'Needs a WebGPU browser, such as current Chrome or Edge.',
        'About 1 GB of model to download on first load.',
        'Public data only, and 60 GitHub requests an hour.',
      ],
    },
  },
  {
    slug: 'classify',
    title: 'classify',
    kind: 'In-browser AI',
    summary:
      'Write a playbook of categories and rules, drop in a spreadsheet, and get every row decided. Unsure rows queue for review, and files never leave the tab.',
    year: 2026,
    stack: ['JavaScript', 'transformers.js', 'WebGPU'],
    links: [
      { kind: 'live', href: 'https://shubhamcodess.github.io/classify/' },
      { kind: 'code', href: 'https://github.com/shubhamcodess/classify' },
    ],
    story: {
      overview:
        'Write a playbook of categories, decisions and rules, then drop in Excel, CSV, JSON or logs. It fills in each row, queues the unsure ones for you, and hands back the same file with new columns. Everything runs in the tab.',
      features: [
        'Rules always win. Then a word-based model, then embedding similarity, then an optional second opinion from a larger model on unsure rows.',
        'A review queue with a reason for every row, and your corrections become training examples.',
        'Excel comes back as the same workbook, with other sheets, formatting and formulas kept.',
      ],
      engineering: [
        'Measured on held-out lines: categories 93% of 29, ticket decisions 87% of 45.',
        'Mixing weights were tuned on separate lines before the test set was run.',
        'Models live in the browser\'s private file system and projects in IndexedDB.',
      ],
      limits: ['The test sets are tiny and hand-labelled.', 'The larger model is 847 MB and needs WebGPU.'],
    },
  },
  {
    slug: 'notch-porch',
    title: 'Notch Porch',
    kind: 'App',
    summary:
      "A widget dock that lives in your MacBook's notch, and as a pill at the top of the screen on Windows. It starts with a full YouTube Music player.",
    year: 2026,
    stack: ['JavaScript', 'Electron'],
    links: [
      { kind: 'code', href: 'https://github.com/shubhamcodess/notch-porch' },
      { kind: 'download', href: 'https://github.com/shubhamcodess/notch-porch/releases' },
    ],
    story: {
      overview:
        'The notch is dead space. Notch Porch turns it into a small, quiet dock for the things you want a glance away. Hover and a card drops down. Move away and it folds back.',
      features: [
        'Small live items sit beside the notch, and each widget gets its own page in the card.',
        'When menus or status icons crowd the notch, the items roll behind it, so the menu bar stays yours.',
        'The first widget is a full YouTube Music player, with search and lyrics.',
        'Write your own widget in a single folder.',
      ],
      limits: ['Runs on macOS 12 or later and Windows 10 or 11.'],
    },
  },
  {
    slug: 'focusify-yt',
    title: 'Focusify',
    kind: 'App',
    summary:
      'A Chrome extension that keeps YouTube on your study topic and hides the videos that do not fit. Everything runs on your machine, with no accounts and no tracking.',
    year: 2026,
    stack: ['JavaScript', 'Chrome extension', 'Ollama'],
    links: [{ kind: 'code', href: 'https://github.com/shubhamcodess/focusify-yt' }],
    story: {
      overview:
        'Tell it what you are studying and it hides the YouTube videos that do not fit, so opening YouTube does not cost you an hour. Videos stay hidden until they are checked, so distractions never flash on screen.',
      features: [
        'Two styles: Strict judges every video against your topic, and Discover also lets in related topics from new channels.',
        'Hides Shorts everywhere, and stops loading a feed after 40 off-topic videos in a row.',
        'Pauses an off-topic video behind a prompt before it plays.',
        'One switch blocks streaming sites, following your schedule, pauses and breaks.',
        'Optionally double-checks borderline videos with a local model through Ollama.',
      ],
      limits: ['Chromium browsers only. Firefox and Safari are not supported yet.'],
    },
  },
] as const satisfies readonly Build[]

export type BuildSlug = (typeof builds)[number]['slug']

const bySlug: ReadonlyMap<string, Build> = new Map(builds.map((build) => [build.slug, build]))

export function getBuild(slug: BuildSlug): Build {
  const build = bySlug.get(slug)
  if (!build) throw new Error(`Unknown build: ${slug}`)
  return build
}
