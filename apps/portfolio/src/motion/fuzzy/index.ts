import { escapeHtml as esc, makeClock, part, prefersStill, styles, type Motion } from '../types'
import css from './fuzzy.css?inline'

/*
 * From fuzzy's landing page (github.com/shubhamcodess/fuzzy, src/demo.ts): a scripted replay of a real run.
 * Every number and result was captured from indexing and searching expressjs/express in the real app.
 */
const RUN = {
  repo: 'expressjs/express',
  branch: 'master',
  files: 166,
  chunks: 970,
  indexed: '10.5 s',
  keyword: {
    q: 'res.redirect',
    stats: '40 results in 13 files',
    ms: '1.7 ms',
    path: 'examples/auth/index.js',
    sym: 'restrict',
    range: 'L75–102',
    start: 75,
    lines: [
      'function restrict(req, res, next) {',
      '  if (req.session.user) {',
      '    next();',
      '  } else {',
      "    req.session.error = 'Access denied!';",
      "    res.redirect('/login');",
    ],
  },
  semantic: {
    q: 'stop users who are not logged in',
    stats: '40 results in 23 files',
    ms: '27 ms',
    path: 'examples/auth/index.js',
    sym: 'restrict',
    range: 'L75–102',
    start: 75,
    lines: [
      'function restrict(req, res, next) {',
      '  if (req.session.user) {',
      '    next();',
      '  } else {',
      "    req.session.error = 'Access denied!';",
      "    res.redirect('/login');",
    ],
  },
}

type Result = typeof RUN.keyword

const SEARCH_ICON = `<svg class="s" width="15" height="15" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`

const STAGE = `
  <div class="d-scene d-index">
    <div class="d-repo"><span class="prefix">github.com/</span><span class="d-typed" data-t="repo"></span><i class="d-caret"></i><b class="primary" data-press>Search repo</b></div>
    <div class="progress" data-progress hidden><ol>
      <li data-s="0"><i></i>Find latest commit</li>
      <li data-s="1"><i></i>Download and parse files<small data-files></small></li>
      <li data-s="2"><i></i>Build search index<small data-chunks></small></li>
    </ol><div class="track"><i data-bar style="width:0"></i></div></div>
  </div>
  <div class="d-scene d-search" hidden>
    <div class="search">${SEARCH_ICON}<span class="d-q"><span data-t="q"></span><i class="d-caret"></i></span>
      <div class="modes"><b data-m="keyword" class="on">Keyword</b><b data-m="semantic">Semantic</b><b data-m="hybrid">Hybrid</b></div></div>
    <div class="meta" data-meta hidden><span data-stats></span></div>
    <div class="d-results" data-results></div>
  </div>`

function resultHtml(r: Result, highlight: string) {
  const mark = (l: string) => (highlight ? esc(l).split(highlight).join(`<mark>${highlight}</mark>`) : esc(l))
  return `<div class="file d-in"><div class="file-head static"><span class="path">${esc(r.path)}</span></div>
    <div class="chunk"><div class="chunk-head"><span class="rng"><span class="sym">${esc(r.sym)}</span> · ${esc(r.range)}</span></div>
    <pre>${r.lines.map((l, i) => `<div><span class="n">${r.start + i}</span><span>${mark(l) || ' '}</span></div>`).join('')}</pre></div></div>`
}

function mount(root: HTMLElement) {
  root.className = 'demo'
  root.innerHTML = `
    <div class="win"><span><i></i><i></i><i></i></span><b data-title></b><em data-status></em></div>
    <div class="d-stage" aria-hidden="true">${STAGE}</div>
    <div class="d-foot"><span>Replay of a real run on ${RUN.repo}. Embedding is sped up here.</span>
      <span class="d-ctl"><button type="button" data-pause class="link">Pause</button><button type="button" data-replay class="link">Replay</button></span></div>`
  const q = (selector: string) => part(root, selector)

  let paused = false
  let visible = false
  const clock = makeClock(() => !paused && visible && !document.hidden)
  const type = async (el: HTMLElement, text: string, me: number) => {
    for (let i = 1; i <= text.length; i++) {
      el.textContent = text.slice(0, i)
      await clock.sleep(45, me)
    }
  }
  const setStep = (n: number) =>
    root.querySelectorAll<HTMLElement>('[data-s]').forEach((li) => {
      const s = Number(li.dataset.s)
      li.className = s < n ? 'done' : s === n ? 'now' : ''
    })
  const setMode = (m: string) => root.querySelectorAll<HTMLElement>('[data-m]').forEach((b) => b.classList.toggle('on', b.dataset.m === m))
  const status = (html: string) => {
    q('[data-status]').innerHTML = html
  }
  const showResults = (r: Result, highlight: string) => {
    q('[data-stats]').innerHTML = `${esc(r.stats)} · <b>${esc(r.ms)}</b>`
    q('[data-meta]').hidden = false
    q('[data-results]').innerHTML = resultHtml(r, highlight)
  }

  function reset() {
    q('.d-index').hidden = false
    q('.d-search').hidden = true
    q('[data-progress]').hidden = true
    q('[data-t="repo"]').textContent = ''
    q('[data-t="q"]').textContent = ''
    q('[data-press]').classList.remove('down')
    q('[data-files]').textContent = ''
    q('[data-chunks]').textContent = ''
    q('[data-bar]').style.width = '0'
    q('[data-meta]').hidden = true
    q('[data-results]').innerHTML = ''
    setStep(-1)
    setMode('keyword')
    status('')
    q('[data-title]').textContent = '[fuzzy]'
  }

  async function play() {
    const me = clock.next()
    try {
      for (;;) {
        reset()
        // 1. paste a repo
        await clock.sleep(500, me)
        await type(q('[data-t="repo"]'), RUN.repo, me)
        await clock.sleep(350, me)
        q('[data-press]').classList.add('down')
        await clock.sleep(180, me)
        // 2. index it
        q('[data-progress]').hidden = false
        q('[data-title]').textContent = `${RUN.repo} · ${RUN.branch}`
        setStep(0)
        await clock.sleep(450, me)
        setStep(1)
        for (let i = 1; i <= 20; i++) {
          const pct = i / 20
          q('[data-files]').textContent = `${Math.round(RUN.files * pct)} / ${RUN.files}`
          q('[data-bar]').style.width = `${pct * 100}%`
          await clock.sleep(70, me)
        }
        setStep(2)
        q('[data-chunks]').textContent = `${RUN.chunks} chunks`
        await clock.sleep(500, me)
        setStep(3)
        status(`indexed in <u>${RUN.indexed}</u>`)
        await clock.sleep(800, me)
        // 3. search by name
        q('.d-index').hidden = true
        q('.d-search').hidden = false
        await clock.sleep(350, me)
        await type(q('[data-t="q"]'), RUN.keyword.q, me)
        showResults(RUN.keyword, RUN.keyword.q)
        await clock.sleep(2400, me)
        // 4. embed in the background, then search by meaning
        for (let i = 1; i <= 16; i++) {
          status(`all-MiniLM-L6-v2 <u>${Math.round((RUN.chunks * i) / 16)} / ${RUN.chunks}</u>`)
          await clock.sleep(50, me)
        }
        status('semantic <u>ready</u>')
        await clock.sleep(400, me)
        setMode('semantic')
        q('[data-meta]').hidden = true
        q('[data-results]').innerHTML = ''
        q('[data-t="q"]').textContent = ''
        await clock.sleep(300, me)
        await type(q('[data-t="q"]'), RUN.semantic.q, me)
        await clock.sleep(200, me)
        showResults(RUN.semantic, '')
        await clock.sleep(4500, me)
      }
    } catch {
      // Replaced by a newer run, or stopped.
    }
  }

  function finalFrame() {
    reset()
    q('.d-index').hidden = true
    q('.d-search').hidden = false
    q('[data-t="q"]').textContent = RUN.semantic.q
    q('[data-title]').textContent = `${RUN.repo} · ${RUN.branch}`
    setMode('semantic')
    status('semantic <u>ready</u>')
    showResults(RUN.semantic, '')
  }

  if (prefersStill()) {
    finalFrame()
    q('.d-ctl').hidden = true
    return () => clock.stop()
  }

  const pauseButton = q('[data-pause]')
  pauseButton.onclick = () => {
    paused = !paused
    pauseButton.textContent = paused ? 'Play' : 'Pause'
    root.classList.toggle('paused', paused)
  }
  q('[data-replay]').onclick = () => {
    paused = false
    pauseButton.textContent = 'Pause'
    root.classList.remove('paused')
    void play()
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false
    },
    { threshold: 0.2 },
  )
  io.observe(root)
  void play()
  return () => {
    clock.stop()
    io.disconnect()
  }
}

export const motion: Motion = {
  css: styles(css),
  mount,
}
