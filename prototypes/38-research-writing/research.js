// Prototype 38: a "Research & writing" panel on home, right after Featured builds.
// One paper, set as a printed sheet beside its words, and a one-line strip of the latest writing under it.
// Every fact comes from the paper itself (github.com/shubhamcodess/codemode-quiet-faults) and the Substack feed.
(() => {
  const repo = 'https://github.com/shubhamcodess/codemode-quiet-faults'
  const paper = {
    meta: ['Paper', '2026', 'cs.AI'],
    title: 'The Blind Script',
    subtitle: 'Quiet tool faults in code-mode agents, and an injection-safe execution digest',
    summary:
      'Agents that call tools from a script only see what the script prints, so a tool that quietly returns bad data goes unnoticed. I measured how often, across 2,088 runs of four small local models, and tested a fix: a short report the runtime builds from the tools’ own schemas.',
    stat: { from: '3', to: '36', label: 'of 48 quiet faults caught, before and after the digest (qwen3:4b)' },
    pdf: `${repo}/blob/main/paper/main.pdf`,
    code: repo,
    preview: '/__proto/paper-p1.webp',
    alt: 'First page of the paper: its title, author, abstract and the start of the introduction.',
  }
  // The three latest posts in the Substack feed (theshubhamprakash.substack.com/feed), 22 Nov 2026.
  const writing = [
    { title: '20 Real Engineering Problems', where: 'Substack', href: 'https://theshubhamprakash.substack.com/p/20-real-engineering-problems' },
    {
      title: 'Building an Enterprise Workflow Orchestrator',
      where: 'Substack',
      href: 'https://theshubhamprakash.substack.com/p/building-an-enterprise-workflow-orchestrator',
    },
    {
      title: 'Beyond the Hype: Engineering Distributed Systems and Real AI',
      where: 'Substack',
      href: 'https://theshubhamprakash.substack.com/p/beyond-the-hype-engineering-distributed',
    },
  ]
  const allWriting = 'https://theshubhamprakash.substack.com/'

  const arrow = (d = 'M7 7h10v10 M7 17 17 7') =>
    `<svg class="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`
  const link = (href, label, sr, d) =>
    `<a class="action-link action-link--text" href="${href}" target="_blank" rel="noopener noreferrer"${sr ? ` aria-label="${sr}"` : ''}><span class="link-dots">${label}</span>${arrow(d)}</a>`

  const html = `
  <section class="panel section rw" id="research" aria-labelledby="research-title">
    <div class="container">
      <header class="section__header">
        <div>
          <h2 class="section__title" id="research-title">Research &amp; writing</h2>
          <p class="section__lead">A paper on what code-writing agents miss, and notes from the work.</p>
        </div>
      </header>

      <article class="paper" aria-labelledby="paper-title">
        <div class="paper__words">
          <p class="paper__meta">${paper.meta.map((m) => `<span>${m}</span>`).join('')}</p>
          <h3 class="paper__title" id="paper-title">${paper.title}</h3>
          <p class="paper__subtitle">${paper.subtitle}</p>
          <p class="paper__summary">${paper.summary}</p>
          <p class="paper__stat">
            <span class="paper__stat-value">${paper.stat.from}<span class="paper__stat-arrow" aria-label="to"> → </span>${paper.stat.to}</span>
            <span class="paper__stat-label">${paper.stat.label}</span>
          </p>
          <div class="paper__actions">
            ${link(paper.pdf, 'Read the paper', `Read the paper: ${paper.title}`)}
            ${link(paper.code, 'View on GitHub', `${paper.title} on GitHub`)}
            <div class="endorse">
              <button class="endorse__button" type="button" aria-expanded="false" aria-controls="endorse-note">Endorse on arXiv</button>
              <div class="endorse__note" id="endorse-note" role="region" aria-label="arXiv endorsement" hidden>
                <p class="endorse__kicker">arXiv · cs.AI</p>
                <p>I’m an independent researcher submitting this paper to arXiv’s <strong>cs.AI</strong>. A first paper there needs one endorsement from someone who already publishes in the category.</p>
                <p class="endorse__code">Endorsement code: <span>coming with the submission</span></p>
                <p class="endorse__links">${link('https://info.arxiv.org/help/endorsement.html', 'How endorsement works')}</p>
              </div>
            </div>
          </div>
        </div>
        <a class="paper__sheet" href="${paper.pdf}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true">
          <span class="paper__page paper__page--behind"></span>
          <img class="paper__page" src="${paper.preview}" alt="" width="778" height="1100" loading="lazy" decoding="async">
        </a>
      </article>

      <nav class="writing" aria-label="Latest writing">
        <p class="writing__label">Writing</p>
        <ul class="writing__list">
          ${writing
            .map(
              (w) =>
                `<li><a class="writing__item" href="${w.href}" target="_blank" rel="noopener noreferrer"><span class="writing__title link-dots">${w.title}</span><span class="writing__where">${w.where}</span></a></li>`,
            )
            .join('')}
        </ul>
        ${link(allWriting, 'All writing', null, 'M5 12h14 M12 5l7 7-7 7')}
      </nav>
    </div>
  </section>`

  const mount = () => {
    const featured = document.querySelector('#root:not([data-prerendered]) #featured')
    if (!featured) return requestAnimationFrame(mount)
    if (document.getElementById('research')) return
    featured.insertAdjacentHTML('afterend', html)
    const root = document.getElementById('research')
    const button = root.querySelector('.endorse__button')
    const note = root.querySelector('.endorse__note')
    const set = (open) => {
      button.setAttribute('aria-expanded', String(open))
      note.hidden = !open
    }
    button.addEventListener('click', () => set(note.hidden))
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !note.hidden) {
        set(false)
        button.focus()
      }
    })
    document.addEventListener('pointerdown', (e) => {
      if (!note.hidden && !root.querySelector('.endorse').contains(e.target)) set(false)
    })
  }
  mount()
})()
