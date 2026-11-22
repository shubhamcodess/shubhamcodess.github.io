// Prototype 39: the Writing pages. /writing/ lists everything (research, case studies, essays here, posts on
// Substack); /writing/<slug>/ is one piece. In the real build each "here" entry is a Markdown file in
// content/writing/, and this list is made from their front matter. Drawn here inside the credentials page's shell.
(() => {
  const P = '/__proto/'
  const substack = (slug) => `https://theshubhamprakash.substack.com/p/${slug}`

  // What the build would read from content/writing/*.md front matter (plus the Substack feed and the paper).
  const entries = [
    {
      slug: 'sample-post',
      kind: 'essay',
      where: 'here',
      title: 'Sample post: what a writing page can hold',
      summary: 'A demonstration of the page: headings, a pull quote, code, an image, a sketch and a diagram, each loaded only when it scrolls into view.',
      date: '2026-11-22',
      minutes: 4,
      tags: ['Sample', 'Design'],
      sample: true,
    },
    {
      slug: 'sample-case-study',
      kind: 'case-study',
      where: 'here',
      title: 'Sample case study: a private project at IBM',
      summary: 'The shape of a case study for work that can’t be linked: the problem, what I did, what changed, with no code, data or client names.',
      date: '2026-11-21',
      minutes: 6,
      tags: ['Sample', 'IBM'],
      private: 'IBM',
      sample: true,
    },
    {
      slug: 'the-blind-script',
      kind: 'research',
      where: 'pdf',
      title: 'The Blind Script',
      summary: 'Quiet tool faults in code-mode agents, and an injection-safe execution digest.',
      date: '2026-11-01',
      href: 'https://github.com/shubhamcodess/codemode-quiet-faults/blob/main/paper/main.pdf',
    },
    { slug: 'a', kind: 'essay', where: 'substack', title: '20 Real Engineering Problems', date: '2026-10-31', href: substack('20-real-engineering-problems') },
    {
      slug: 'b',
      kind: 'essay',
      where: 'substack',
      title: 'Building an Enterprise Workflow Orchestrator: From Manual Bottlenecks to Event-Sourced DAGs [1/4]',
      date: '2026-10-29',
      href: substack('building-an-enterprise-workflow-orchestrator'),
    },
    {
      slug: 'c',
      kind: 'essay',
      where: 'substack',
      title: 'Beyond the Hype: Engineering Distributed Systems and Real AI',
      date: '2026-10-27',
      href: substack('beyond-the-hype-engineering-distributed'),
    },
  ]
  const kinds = { research: 'Research', 'case-study': 'Case study', essay: 'Essay' }
  const whereLabel = { here: 'Here', substack: 'Substack', pdf: 'PDF' }
  const filters = [
    ['all', 'All'],
    ['research', 'Research'],
    ['case-study', 'Case studies'],
    ['essay', 'Essays'],
  ]

  const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
  const date = (d) => fmt.format(new Date(d))
  const icon = (d) =>
    `<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`
  const UP = 'M7 7h10v10 M7 17 17 7'
  const LEFT = 'M19 12H5 M12 19l-7-7 7-7'
  const hrefOf = (e) => e.href ?? `/writing/${e.slug}/`
  const external = (e) => (e.href ? ' target="_blank" rel="noopener noreferrer"' : '')
  // A drawing in both themes: two lazy images, and the theme shows one (a hidden lazy image never loads).
  const themed = (name, w, h, alt) =>
    `<img class="w-theme w-theme--light" src="${P}${name}-light.svg" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async"><img class="w-theme w-theme--dark" src="${P}${name}-dark.svg" width="${w}" height="${h}" alt="${alt}" loading="lazy" decoding="async">`

  // ——— /writing/ ———
  const index = () => {
    const years = [...new Set(entries.map((e) => e.date.slice(0, 4)))]
    const count = (k) => (k === 'all' ? entries.length : entries.filter((e) => e.kind === k).length)
    const row = (e) => `
      <li data-kind="${e.kind}">
        <a class="w-row" href="${hrefOf(e)}"${external(e)}>
          <span class="w-row__meta">
            <span class="w-row__kind">${kinds[e.kind]}</span>
            ${e.private ? `<span class="w-row__private">${e.private} · Private</span>` : ''}
            ${e.sample ? '<span class="w-row__private">Sample</span>' : ''}
          </span>
          <span class="w-row__title"><span class="link-dots">${e.title}</span></span>
          ${e.summary ? `<span class="w-row__summary">${e.summary}</span>` : ''}
          <span class="w-row__foot">
            <time datetime="${e.date}">${date(e.date)}</time>
            ${e.minutes ? `<span>${e.minutes} min read</span>` : ''}
            <span class="w-row__where">${whereLabel[e.where]}${e.href ? ` ${icon(UP)}` : ''}</span>
          </span>
        </a>
      </li>`
    return `
      <header class="section__header enter">
        <div>
          <h1 class="section__title">Writing</h1>
          <p class="section__lead">Research, case studies from private work, and notes from building things.</p>
        </div>
        <p class="eyebrow">${entries.length} pieces</p>
      </header>
      <div class="build-filter" role="group" aria-label="Filter by kind">
        ${filters
          .filter(([k]) => count(k) > 0)
          .map(([k, label]) => `<button type="button" class="build-filter__chip" data-filter="${k}" aria-pressed="${k === 'all'}">${label} <span>${count(k)}</span></button>`)
          .join('')}
      </div>
      <div class="w-years">
        ${years
          .map(
            (y) => `
          <section class="w-year" aria-label="${y}">
            <h2 class="w-year__label">${y}</h2>
            <ul class="w-list">${entries.filter((e) => e.date.startsWith(y)).map(row).join('')}</ul>
          </section>`,
          )
          .join('')}
      </div>`
  }

  // ——— the article shared by a post and a case study ———
  const article = (e, body, extra = '') => {
    const sections = [...body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)]
    const others = entries.filter((x) => x.where === 'here' && x.slug !== e.slug)
    return `
      <div class="w-article">
        <a class="action-link action-link--text action-link--back w-back" href="/writing/"><span class="link-dots">All writing</span>${icon(LEFT)}</a>
        <header class="w-head enter">
          <p class="w-head__meta">
            <span>${kinds[e.kind]}</span>
            ${e.private ? `<span>${e.private} · Private</span>` : ''}
            <time datetime="${e.date}">${date(e.date)}</time>
            <span>${e.minutes} min read</span>
          </p>
          <h1 class="w-head__title">${e.title}</h1>
          <p class="w-head__dek">${e.summary}</p>
        </header>
        ${extra}
        <div class="w-layout">
          <nav class="w-toc" aria-label="On this page">
            <p class="w-toc__label">On this page</p>
            ${sections.map(([, id, t]) => `<a href="#${id}">${t}</a>`).join('')}
          </nav>
          <div class="w-prose">${body}</div>
        </div>
        <footer class="w-foot">
          <ul class="w-tags" aria-label="Tags">${(e.tags ?? []).map((t) => `<li>${t}</li>`).join('')}</ul>
          ${others.length ? `<nav class="page-onward" aria-label="More writing"><a class="action-link action-link--text" href="/writing/${others[0].slug}/"><span class="link-dots">${others[0].title}</span>${icon('M5 12h14 M12 5l7 7-7 7')}</a></nav>` : ''}
        </footer>
      </div>`
  }

  // ——— /writing/sample-post/ ———
  const post = (e) =>
    article(
      e,
      `
      <p>This is a sample, written to show what a post on this site can hold. In the real build it is one Markdown file, <code>content/writing/sample-post.md</code>, and everything you see comes from that file: the title, the date and reading time from its front matter, the sections on the left from its headings.</p>
      <h2 id="words">Words first</h2>
      <p>The text sits in a narrow column, about 66 characters a line, in the site’s own type. Links look like every other link here, with the dotted line that fills with the theme’s colour.</p>
      <blockquote><p>A pull quote stands out without shouting: a rule on the left and a slightly larger size.</p></blockquote>
      <h2 id="code">Code</h2>
      <p>Inline code like <code>digest()</code> and blocks:</p>
      <pre><code><span class="c">// the digest the runtime appends</span>
const digest = summarise(schema, responses)
print(script.output + digest)</code></pre>
      <h2 id="pictures">Pictures, sketches and diagrams</h2>
      <p>Every picture loads only when it is about to scroll into view, at its true size so nothing jumps.</p>
      <figure class="w-figure">
        <img src="${P}paper-p1.webp" width="778" height="1100" alt="Page one of the paper The Blind Script." loading="lazy" decoding="async" class="w-figure__page">
        <figcaption>An image: a WebP made from whatever was dropped into the post’s folder.</figcaption>
      </figure>
      <figure class="w-figure w-figure--wide">
        ${themed('sketch', 520, 220, 'A hand sketch: the script calls tools, and the model sees only what it prints.')}
        <figcaption>A sketch: an SVG drawn by hand, in a light and a dark version.</figcaption>
      </figure>
      <figure class="w-figure w-figure--wide">
        ${themed('diagram', 720, 260, 'A diagram: the agent writes a script that calls three tools; their output and a digest go back to the agent.')}
        <figcaption>A diagram: written as text in the Markdown, drawn into a still picture when the site is built, so it needs no script to show.</figcaption>
      </figure>
      <h2 id="end">The end of a post</h2>
      <p>Tags, then the next piece. No comments, no share buttons, nothing that loads from elsewhere.</p>`,
    )

  // ——— /writing/sample-case-study/ ———
  const facts = [
    ['Where', 'IBM · Private'],
    ['Role', '[Your role]'],
    ['When', '[Year to year]'],
    ['Team', '[Team size]'],
    ['Stack', '[Main tools]'],
  ]
  const caseStudy = (e) =>
    article(
      e,
      `
      <h2 id="context">Context</h2>
      <p>[One paragraph: the product and the people it served, described without naming the client.]</p>
      <h2 id="problem">The problem</h2>
      <p>[What was broken or slow, and what it cost. Numbers only where they are true and allowed.]</p>
      <h2 id="approach">What I did</h2>
      <p>[The decisions you made and why. A diagram helps here; it is drawn at build time like any other.]</p>
      <figure class="w-figure w-figure--wide">
        ${themed('diagram', 720, 260, 'A sample diagram standing in for the system you built.')}
        <figcaption>A stand-in diagram. A case study draws its own, with names kept generic.</figcaption>
      </figure>
      <h2 id="outcome">What changed</h2>
      <p>[The result, in plain terms.]</p>
      <h2 id="lessons">What I’d do differently</h2>
      <p>[One honest paragraph.]</p>`,
      `
      <aside class="w-facts" aria-label="At a glance">
        <dl>${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <div class="w-facts__numbers">
          <p><span class="w-facts__value">[n]</span><span class="w-facts__label">a result that matters</span></p>
          <p><span class="w-facts__value">[n]</span><span class="w-facts__label">another, if there is one</span></p>
        </div>
        <p class="w-facts__note">A private project: no code, data or client names are shared.</p>
      </aside>`,
    )

  // ——— header: the menu proposal ———
  // "Research" (an anchor on home) becomes "Writing", the page. On writing pages it's the current page.
  const patchHeader = () => {
    const onWriting = location.pathname.startsWith('/writing')
    for (const a of document.querySelectorAll('.site-header__link')) {
      if (a.dataset.wPatched) continue
      if (/#research$/.test(a.getAttribute('href') ?? '')) {
        a.textContent = 'Writing'
        a.setAttribute('href', '/writing/')
        a.dataset.wPatched = '1'
        if (onWriting) a.setAttribute('aria-current', 'page')
      }
    }
    // The shell is the experience page, whose header leaves out its own link; a writing page shows all four.
    const writingLink = document.querySelector('.site-header__link[data-w-patched]')
    if (onWriting && writingLink && !document.querySelector('.site-header__link[href="/experience/"]')) {
      const exp = writingLink.cloneNode(false)
      exp.removeAttribute('aria-current')
      exp.removeAttribute('data-w-patched')
      exp.setAttribute('href', '/experience/')
      exp.textContent = 'Experience'
      writingLink.after(exp)
    }
    if (onWriting) {
      const here = document.querySelector('.dock__open span')
      if (here && here.textContent !== 'Writing') here.textContent = 'Writing'
    }
  }

  const draw = () => {
    patchHeader()
    if (!location.pathname.startsWith('/writing')) return
    const shell = document.querySelector('#root:not([data-prerendered]) #main')
    if (!shell || document.querySelector('.w-page')) return
    // The shell's own content stays (hidden) for its scripts; the writing page is drawn beside it.
    shell.hidden = true
    const main = document.createElement('main')
    main.className = 'section container w-page'
    shell.after(main)
    const slug = location.pathname.split('/').filter(Boolean)[1]
    const entry = entries.find((e) => e.slug === slug && e.where === 'here')
    if (!slug) {
      main.innerHTML = index()
      document.title = 'Writing | Shubham Prakash'
      const chips = main.querySelectorAll('[data-filter]')
      chips.forEach((chip) =>
        chip.addEventListener('click', () => {
          chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)))
          const k = chip.dataset.filter
          main.querySelectorAll('.w-list li').forEach((li) => (li.hidden = k !== 'all' && li.dataset.kind !== k))
          main.querySelectorAll('.w-year').forEach((y) => (y.hidden = ![...y.querySelectorAll('li')].some((li) => !li.hidden)))
        }),
      )
    } else if (entry) {
      main.innerHTML = entry.kind === 'case-study' ? caseStudy(entry) : post(entry)
      document.title = `${entry.title} | Shubham Prakash`
    } else {
      main.innerHTML = '<p class="w-missing">No piece by that name. <a href="/writing/">All writing</a></p>'
    }
  }

  new MutationObserver(draw).observe(document.documentElement, { childList: true, subtree: true })
  draw()
})()
