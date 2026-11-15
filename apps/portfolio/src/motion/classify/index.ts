import { escapeHtml as esc, part, prefersStill, styles, type Motion } from '../types'
import css from './classify.css?inline'

/*
 * From classify's landing page (github.com/shubhamcodess/classify, src/demo.js): a replay of real output.
 * The rows are the ones that page picks from src/bench-results.json, the measured support-ticket example.
 */
interface Row {
  readonly text: string
  readonly category: string
  readonly decision: string
  readonly decidedBy: string
  readonly needsReview: boolean
  readonly confidence: number
}

const ROWS: readonly Row[] = [
  {
    text: 'I got charged two times for the annual plan',
    category: 'billing',
    decision: 'Refund',
    decidedBy: 'words + meaning',
    needsReview: false,
    confidence: 1,
  },
  {
    text: 'The upload page freezes at 99% and never finishes',
    category: 'bug',
    decision: 'Escalate to a person',
    decidedBy: 'rule',
    needsReview: false,
    confidence: 1,
  },
  {
    text: 'Forgot my password and the reset link is expired',
    category: 'account',
    decision: 'Reply with help article',
    decidedBy: 'words + meaning',
    needsReview: false,
    confidence: 1,
  },
  {
    text: 'Would love a Slack integration for alerts',
    category: 'feature request',
    decision: 'Add to backlog',
    decidedBy: 'words + meaning',
    needsReview: false,
    confidence: 0.96,
  },
  {
    text: "hmm it's kind of weird lately",
    category: 'bug',
    decision: 'Send to engineering',
    decidedBy: 'words + meaning + Laya',
    needsReview: true,
    confidence: 0.47,
  },
  {
    text: 'Requesting a refund, we paid twice for the yearly licence',
    category: 'billing',
    decision: 'Escalate to a person',
    decidedBy: 'rule',
    needsReview: false,
    confidence: 1,
  },
  {
    text: 'Where can I find the invoice for my last payment?',
    category: 'billing',
    decision: 'Reply with help article',
    decidedBy: 'words + meaning',
    needsReview: false,
    confidence: 0.95,
  },
]

const FILE = 'tickets.xlsx'
const ICON = '<svg class="s" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6"/></svg>'
const FIXED_DECISION = 'Send to engineering'
const OPTIONS = ['Reply with help article', 'Send to engineering', 'Add to backlog']

function mount(root: HTMLElement) {
  const still = prefersStill()
  root.innerHTML = `<figure class="demo" style="margin:0">
    <div class="demo__bar"><span class="demo__dots"><i></i><i></i><i></i></span><span data-title>Support ticket triage</span><span class="demo__stat" data-stat></span></div>
    <div class="demo__stage" aria-hidden="true">
      <div class="demo__drop" data-drop>${ICON}<span>Drop a file</span></div>
      <div class="demo__file" data-file>${ICON}${FILE}</div>
      <div class="demo__table" data-table>
        <table class="tbl"><colgroup><col /><col class="col-cat" style="width:17%" /><col style="width:25%" /><col style="width:15%" /></colgroup>
          <thead><tr><th>message</th><th class="col-cat demo__col">category</th><th class="demo__col">decision</th><th class="demo__col">decided by</th></tr></thead>
          <tbody>${ROWS.map((r, i) => `<tr data-r="${i}"><td>${esc(r.text)}</td><td class="col-cat muted"></td><td class="dec"></td><td class="muted"></td></tr>`).join('')}</tbody>
        </table>
      </div>
      <div class="demo__card" data-card></div>
      <div class="demo__done" data-done>${ICON}<span data-done-text></span></div>
    </div>
    <figcaption class="demo__foot"><span>Replay of real output from the sample tickets, sped up.</span>
      <span class="row"><button type="button" class="btn btn--ghost btn--sm" data-pause>Pause</button><button type="button" class="btn btn--ghost btn--sm" data-replay>Replay</button></span></figcaption>
  </figure>`
  const q = (selector: string) => part(root, selector)
  const rowOf = (i: number) => part<HTMLTableRowElement>(root, `[data-r="${i}"]`)

  let token = 0
  let paused = false
  let visible = false
  let frame = 0

  const wait = (ms: number, me: number) =>
    new Promise<void>((resolve, reject) => {
      let left = ms
      let last = performance.now()
      const tick = (now: number) => {
        if (me !== token) return reject(new Error('replaced'))
        if (!paused && visible && !document.hidden) left -= now - last
        last = now
        if (left <= 0) resolve()
        else frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    })

  const reset = () => {
    q('[data-drop]').className = 'demo__drop'
    q('[data-file]').className = 'demo__file'
    q('[data-table]').className = 'demo__table'
    q('[data-card]').className = 'demo__card'
    q('[data-done]').className = 'demo__done'
    q('[data-stat]').innerHTML = ''
    root.querySelectorAll<HTMLTableRowElement>('[data-r]').forEach((tr) => {
      tr.className = ''
      Array.from(tr.cells)
        .slice(1)
        .forEach((cell) => (cell.textContent = ''))
    })
  }
  const put = (cell: HTMLTableCellElement | undefined, text: string, animate: boolean) => {
    if (cell) cell.innerHTML = `<span class="${animate ? 'demo__new' : ''}">${esc(text)}</span>`
  }
  const fill = (i: number, animate = true) => {
    const r = ROWS[i]
    if (!r) return
    const tr = rowOf(i)
    put(tr.cells[1], r.category, animate)
    put(tr.cells[2], r.decision, animate)
    put(tr.cells[3], r.needsReview ? 'needs review' : r.decidedBy, animate)
    tr.classList.toggle('is-flag', r.needsReview)
  }
  const stat = (done: number, flagged: number) => {
    q('[data-stat]').innerHTML = `<b>${done}</b> of ${ROWS.length} rows${flagged ? ` · <b>${flagged}</b> to review` : ''}`
  }
  const flagIndex = ROWS.findIndex((r) => r.needsReview)
  const cardHtml = (r: Row) => `<dl style="margin:0;display:grid;gap:3px"><dt>message</dt><dd>${esc(r.text)}</dd></dl>
      <div style="color:var(--text-2)">Unsure: ${Math.round(r.confidence * 100)}% confidence, so it asks you.</div>
      <div class="demo__opts">${OPTIONS.map((o) => `<span data-opt="${esc(o)}">${esc(o)}</span>`).join('')}</div>`

  async function play(me: number) {
    for (;;) {
      reset()
      await wait(500, me)
      q('[data-file]').classList.add('is-in')
      await wait(500, me)
      q('[data-drop]').classList.add('is-over')
      await wait(600, me)
      q('[data-file]').classList.add('is-out')
      q('[data-drop]').classList.add('is-gone')
      q('[data-table]').classList.add('is-on')
      await wait(500, me)
      let flagged = 0
      for (let i = 0; i < ROWS.length; i++) {
        const tr = rowOf(i)
        tr.classList.add('is-scan')
        await wait(280, me)
        fill(i)
        if (ROWS[i]?.needsReview) flagged++
        stat(i + 1, flagged)
        await wait(240, me)
        tr.classList.remove('is-scan')
      }
      await wait(900, me)
      const flaggedRow = ROWS[flagIndex]
      if (flaggedRow) {
        const card = q('[data-card]')
        const tr = rowOf(flagIndex)
        card.innerHTML = cardHtml(flaggedRow)
        card.classList.add('is-on')
        tr.classList.add('is-scan')
        await wait(1500, me)
        card.querySelector(`[data-opt="${FIXED_DECISION}"]`)?.classList.add('is-on')
        await wait(800, me)
        put(tr.cells[2], FIXED_DECISION, true)
        put(tr.cells[3], 'reviewer', true)
        tr.classList.remove('is-flag', 'is-scan')
        card.classList.remove('is-on')
        stat(ROWS.length, 0)
        await wait(700, me)
      }
      q('[data-done-text]').textContent = 'tickets-classified.xlsx, same file with new columns'
      q('[data-done]').classList.add('is-on')
      await wait(3200, me)
      q('[data-table]').classList.remove('is-on')
      q('[data-done]').classList.remove('is-on')
      await wait(400, me)
    }
  }

  const pauseButton = q('[data-pause]')
  const start = () => {
    const me = ++token
    paused = false
    pauseButton.textContent = 'Pause'
    play(me).catch(() => {})
  }
  const finalFrame = () => {
    q('[data-drop]').classList.add('is-gone')
    q('[data-table]').classList.add('is-on')
    ROWS.forEach((_, i) => fill(i, false))
    stat(ROWS.length, ROWS.filter((r) => r.needsReview).length)
    pauseButton.hidden = true
    q('[data-replay]').hidden = true
  }

  pauseButton.addEventListener('click', () => {
    paused = !paused
    pauseButton.textContent = paused ? 'Resume' : 'Pause'
  })
  q('[data-replay]').addEventListener('click', start)
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
  })
  io.observe(root)
  if (still) finalFrame()
  else start()
  return () => {
    token++
    cancelAnimationFrame(frame)
    io.disconnect()
  }
}

export const motion: Motion = {
  css: styles(css),
  mount,
}
