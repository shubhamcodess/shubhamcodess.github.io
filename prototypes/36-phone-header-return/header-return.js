// Prototype 36: on phones, once the visitor is past the hero (or, on other pages, past the page's top), the
// header comes back as the page's own header when they stop or scroll up, and tucks away while they scroll down.
// It takes the tone of the panel under it: paper over paper, night over the contact section.
(() => {
  const phone = matchMedia('(max-width: 599px)')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  /** How long the page must be still before the header returns, in ms. */
  const settle = 180
  // Holds the header's place in the page while it floats, so nothing below it jumps.
  const spacer = document.createElement('div')
  spacer.className = 'hr-spacer'
  let timer = 0
  let lastY = window.scrollY

  // The page may redraw its header, so it is looked up fresh every time.
  const live = () => document.querySelector('#root:not([data-prerendered]) .site-header')

  const past = (header) => {
    const hero = document.querySelector('#root:not([data-prerendered]) .hero')
    if (hero) return hero.getBoundingClientRect().bottom < 0
    return window.scrollY > header.offsetHeight + 200
  }

  // The panel just under the bar decides its tone. Read where the bar rests, even while it's tucked away.
  const tone = (header) => {
    const y = header.offsetHeight + 4
    const under = document.elementsFromPoint(window.innerWidth / 2, y).find((element) => !header.contains(element))
    header.dataset.tone = under?.closest('.panel--night') ? 'night' : 'paper'
  }

  const float = (header, on) => {
    if (on === header.classList.contains('hr-floating')) return
    if (on) {
      if (spacer.nextElementSibling !== header) header.before(spacer)
      spacer.style.height = `${header.offsetHeight}px`
      header.dataset.dock = 'hidden'
    } else spacer.style.height = '0'
    header.classList.toggle('hr-floating', on)
  }

  const update = () => {
    const header = live()
    if (!header) return
    const y = window.scrollY
    const down = y > lastY
    lastY = y
    clearTimeout(timer)
    if (!phone.matches || !past(header)) return float(header, false)
    float(header, true)
    tone(header)
    // Away while scrolling down; back when scrolling up, or once the page has been still for a moment.
    if (!down) {
      header.dataset.dock = 'shown'
      return
    }
    header.dataset.dock = 'hidden'
    timer = setTimeout(() => {
      const now = live()
      if (!now?.classList.contains('hr-floating')) return
      tone(now)
      now.dataset.dock = 'shown'
    }, reduced.matches ? 0 : settle)
  }

  window.addEventListener('scroll', update, { passive: true })
  phone.addEventListener('change', update)
})()
