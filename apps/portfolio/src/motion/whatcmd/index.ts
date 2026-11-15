import { escapeHtml as esc, makeClock, part, prefersStill, styles, type Motion, type MotionControls } from '../types'
import css from './whatcmd.css?inline'
import fit from './fit.css?inline'

/*
 * From whatcmd's landing page (github.com/shubhamcodess/whatcmd, site/src/main.js): a terminal that installs
 * whatcmd and uses it. Steps:
 *   com      a grey comment          cmd     type a line at the prompt
 *   enter    show the ↵ key          prefill whatcmd replaces the typed line with the command
 *   run      the command runs        out     an output line
 *   clear    Ctrl-U drops the line   gap / wait
 */
type Step =
  | readonly ['com' | 'out', string, string?]
  | readonly ['cmd', string, { readonly fresh: boolean }?]
  | readonly ['prefill', string]
  | readonly ['wait', number]
  | readonly ['enter' | 'run' | 'clear' | 'gap']

const SCRIPT: readonly Step[] = [
  ['com', '# install once'],
  ['cmd', 'npm install -g @shubhamcodess/whatcmd'],
  ['enter'],
  ['run'],
  ['out', 'added 1 package in 2s'],
  ['cmd', 'whatcmd init'],
  ['enter'],
  ['run'],
  ['out', '✔ System: macOS 15.6, arm64, zsh, brew', 't-ok'],
  ['out', '✔ Ollama 0.40.14 is running', 't-ok'],
  ['out', '✔ Model qwen2.5-coder:1.5b is ready', 't-ok'],
  ['out', '✔ Added the /w shortcut to ~/.zshrc', 't-ok'],
  ['gap'],
  ['com', '# ask in plain English; the command replaces your line'],
  ['cmd', '/w find files bigger than 100MB'],
  ['enter'],
  ['prefill', 'find . -type f -size +100M'],
  ['wait', 900],
  ['run'],
  ['out', './videos/launch-demo.mov'],
  ['out', './docs/q3-report.pdf'],
  ['gap'],
  ['com', '# refine the last command with /w+  (v1.1)'],
  ['cmd', '/w+ only pdfs'],
  ['enter'],
  ['prefill', 'find . -type f -size +100M -name "*.pdf"'],
  ['wait', 700],
  ['cmd', '/w+ only in ~/Downloads', { fresh: true }],
  ['enter'],
  ['prefill', 'find ~/Downloads -type f -size +100M -name "*.pdf"'],
  ['wait', 800],
  ['run'],
  ['out', '/Users/you/Downloads/scan-2026.pdf'],
  ['gap'],
  ['cmd', "/w what's using port 8080"],
  ['enter'],
  ['prefill', 'lsof -i :8080'],
  ['wait', 700],
  ['run'],
  ['out', 'node   4127  you  23u  IPv6  TCP *:8080 (LISTEN)'],
  ['gap'],
  ['cmd', '/w tell me a joke'],
  ['enter'],
  ['out', 'whatcmd: not a shell task, nothing generated', 't-warn'],
  ['clear'],
  ['cmd', '/w delete the build folder'],
  ['enter'],
  ['prefill', 'rm -rf build'],
  ['out', '⚠ deletes files recursively. Your call: edit, run, or Ctrl-U', 't-warn'],
  ['wait', 2600],
]


function mount(root: HTMLElement): MotionControls {
  root.innerHTML = `<div class="term mac">
    <div class="term__bar">
      <span class="mac__dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="mac__title">zsh · ~/projects/site</span>
      <span class="mac__hint" aria-hidden="true">demo · loops</span>
    </div>
    <div class="term__body" aria-hidden="true"><div class="term__scroll" data-term></div></div>
  </div>`
  const host = part(root, '[data-term]')
  const body = part(root, '.term__body')
  const still = prefersStill()

  let visible = false
  let paused = false
  const clock = makeClock(() => visible && !paused && !document.hidden)
  const io = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
  })
  io.observe(body)

  const trim = () => {
    while (host.scrollHeight > body.clientHeight - 20 && host.children.length > 1) host.firstElementChild?.remove()
  }
  const line = (cls?: string) => {
    const p = document.createElement('p')
    if (cls) p.className = cls
    host.append(p)
    trim()
    return p
  }
  const prompt = '<span class="t-ps">❯ </span>'
  const caret = '<span class="caret"></span>'
  const wait = (ms: number, me: number) => clock.sleep(still ? 0 : ms, me)

  async function play(me: number) {
    host.innerHTML = ''
    let cur: HTMLElement | null = null
    let curText = ''
    let curAsk = ''
    const note = () => (curAsk && curText !== curAsk ? `<span class="t-com">  ← ${esc(curAsk)}</span>` : '')
    for (const step of SCRIPT) {
      switch (step[0]) {
        case 'com':
          line('t-com appear').textContent = step[1]
          await wait(500, me)
          break
        case 'cmd': {
          if (cur) cur.innerHTML = prompt + esc(curText) + note()
          const text = step[1]
          cur = line('t-cmd')
          curText = ''
          curAsk = text.startsWith('/w') ? text : ''
          if (still) {
            curText = text
            cur.innerHTML = prompt + esc(curText) + caret
            break
          }
          await wait(step[2]?.fresh ? 250 : 400, me)
          for (const ch of text) {
            curText += ch
            cur.innerHTML = prompt + esc(curText) + caret
            await wait(28 + Math.random() * 45, me)
          }
          await wait(300, me)
          break
        }
        case 'enter':
          if (!cur) break
          cur.innerHTML = prompt + esc(curText) + caret + '<span class="enter">↵</span>'
          await wait(450, me)
          break
        case 'prefill':
          if (!cur) break
          await wait(180, me)
          curText = step[1]
          cur.innerHTML = prompt + `<span class="t-new">${esc(curText)}</span>` + caret
          await wait(600, me)
          break
        case 'run':
          if (!cur) break
          cur.innerHTML = prompt + esc(curText) + '<span class="enter">↵</span>' + note()
          cur = null
          await wait(450, me)
          break
        case 'out':
          line(`${step[2] ?? 't-out'} appear`).textContent = step[1]
          await wait(220, me)
          break
        case 'clear':
          await wait(900, me)
          if (cur) cur.innerHTML = prompt + '<span class="t-com">^U</span>'
          cur = null
          break
        case 'gap':
          line()
          break
        case 'wait':
          await wait(step[1], me)
          break
      }
    }
    if (cur) cur.innerHTML = prompt + esc(curText) + caret
  }

  async function start() {
    const me = clock.next()
    try {
      do {
        await play(me)
        if (still) return
        await clock.sleep(1800, me)
      } while (me === clock.current())
    } catch {
      // Replaced by a newer run, or stopped.
    }
  }

  void start()
  return {
    still,
    setPaused: (next) => {
      paused = next
    },
    replay: () => {
      paused = false
      void start()
    },
    stop: () => {
      clock.stop()
      io.disconnect()
    },
  }
}

export const motion: Motion = {
  css: styles(css, fit),
  mount,
}
