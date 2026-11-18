// Prototype 37: a small floating dock at the bottom of the screen, on every page and every screen size.
// It rises while the visitor scrolls (once the header is out of view) and settles away soon after they stop.
// It holds the SP mark (home) and the page you're on; tapping the page name opens every page of the site.
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  /** How long the dock stays after scrolling stops, in ms: long enough to reach it, short enough to stay out of the way. */
  const linger = 1400

  const dock = document.createElement('nav')
  dock.className = 'dock'
  dock.setAttribute('aria-label', 'Pages')
  dock.dataset.state = 'away'
  dock.innerHTML = `
    <div class="dock__sheet" id="dock-sheet" hidden>
      <ul class="dock__list"></ul>
      <div class="dock__switches"></div>
    </div>
    <div class="dock__bar">
      <a class="dock__home" href="/"></a>
      <span class="dock__rule" aria-hidden="true"></span>
      <button class="dock__open" type="button" aria-expanded="false" aria-controls="dock-sheet">
        <span class="dock__here"></span>
        <svg class="dock__glyph" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
          <circle cx="3" cy="3" r="1.25"/><circle cx="9" cy="3" r="1.25"/><circle cx="3" cy="9" r="1.25"/><circle cx="9" cy="9" r="1.25"/>
        </svg>
      </button>
    </div>`

  const sheet = dock.querySelector('.dock__sheet')
  const list = dock.querySelector('.dock__list')
  const open = dock.querySelector('.dock__open')
  const here = dock.querySelector('.dock__here')
  const home = dock.querySelector('.dock__home')
  const switches = dock.querySelector('.dock__switches')

  const live = (selector) => document.querySelector(`#root:not([data-prerendered]) ${selector}`) ?? document.querySelector(selector)

  // Which page a link points at, by its first path part ('' is home, '#contact' stays a hash).
  const pageOf = (url) => {
    const { pathname, hash } = new URL(url, location.href)
    const first = pathname.split('/').filter(Boolean)[0] ?? ''
    return first === '' && hash ? hash : first
  }

  // The site's own index (the footer: every page, in the site's order) fills the list, so names and links stay the real ones.
  const fill = () => {
    const links = [...document.querySelectorAll('.site-footer__links a')]
    if (!links.length) return false
    const now = pageOf(location.href)
    const nowPage = now.startsWith('#') ? '' : now
    list.innerHTML = ''
    let label = 'Home'
    for (const link of links) {
      const target = pageOf(link.href)
      const current = target === nowPage
      if (current) label = link.textContent.trim()
      const item = document.createElement('li')
      item.innerHTML = `<a class="dock__link" href="${link.getAttribute('href')}"${current ? ' aria-current="page"' : ''}><span></span><svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8h10M9 4l4 4-4 4"/></svg></a>`
      item.querySelector('span').textContent = link.textContent.trim()
      list.append(item)
    }
    here.textContent = label
    const logo = live('.site-header__logo')
    if (logo) {
      home.innerHTML = logo.innerHTML
      home.setAttribute('href', logo.getAttribute('href'))
      home.setAttribute('aria-label', logo.getAttribute('aria-label') ?? 'Home')
    }
    copySwitches()
    return true
  }

  // The sound and theme switches: copies that press the footer's real ones, then redraw to show the new state.
  const copySwitches = () => {
    const real = [...document.querySelectorAll('.site-footer__toggles button')]
    switches.innerHTML = ''
    real.forEach((button, index) => {
      const copy = button.cloneNode(true)
      copy.addEventListener('click', () => {
        document.querySelectorAll('.site-footer__toggles button')[index]?.click()
        requestAnimationFrame(() => requestAnimationFrame(() => {
          copySwitches()
          switches.querySelectorAll('button')[index]?.focus()
        }))
      })
      switches.append(copy)
    })
  }

  // The tone of what's under the dock: night over the hero and contact panels, the page's paper elsewhere.
  const tone = () => {
    const rect = dock.querySelector('.dock__bar').getBoundingClientRect()
    const under = document
      .elementsFromPoint(window.innerWidth / 2, rect.top + rect.height / 2)
      .find((element) => !dock.contains(element))
    dock.dataset.tone = under?.closest('.panel--night, .hero, .site-footer') ? 'night' : 'paper'
  }

  const headerGone = () => {
    const header = live('.site-header')
    return !header || header.getBoundingClientRect().bottom < 0
  }

  let timer = 0
  const isOpen = () => open.getAttribute('aria-expanded') === 'true'
  const held = () => isOpen() || dock.matches(':hover') || dock.contains(document.activeElement)

  const settle = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (held()) return settle()
      dock.dataset.state = 'away'
    }, reduced.matches ? linger + 600 : linger)
  }

  const onScroll = () => {
    if (!headerGone()) {
      if (!isOpen()) dock.dataset.state = 'away'
      return
    }
    // The page may have redrawn its header or footer since (hydration, theme, route), so read them again on the way up.
    if (dock.dataset.state === 'away') fill()
    tone()
    dock.dataset.state = 'up'
    settle()
  }

  const setOpen = (on, { focus = false } = {}) => {
    open.setAttribute('aria-expanded', String(on))
    sheet.hidden = !on
    dock.dataset.open = String(on)
    if (on) {
      fill()
      tone()
      dock.dataset.state = 'up'
      list.querySelector('[aria-current]')?.focus({ preventScroll: true })
    } else {
      if (focus) open.focus({ preventScroll: true })
      settle()
    }
  }

  open.addEventListener('click', () => setOpen(!isOpen()))
  list.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false)
  })
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, { focus: true })
  })
  document.addEventListener('pointerdown', (event) => {
    if (isOpen() && !dock.contains(event.target)) setOpen(false)
  })
  // Keyboard: tabbing into the dock keeps it up; leaving lets it settle.
  dock.addEventListener('focusin', () => (dock.dataset.state = 'up'))
  dock.addEventListener('focusout', settle)
  dock.addEventListener('pointerleave', settle)

  const start = () => {
    if (!fill()) return requestAnimationFrame(start)
    document.body.append(dock)
    window.addEventListener('scroll', onScroll, { passive: true })
  }
  start()
})()
