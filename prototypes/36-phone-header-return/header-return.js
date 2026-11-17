// Prototype 36: on phones, the header comes back once the visitor has scrolled past the hero (or, on other
// pages, past the page's top) and stops scrolling. It tucks away again as soon as they scroll.
(() => {
  const phone = matchMedia('(max-width: 599px)')
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  /** How long the page must be still before the header returns, in ms. */
  const settle = 180

  const start = (header) => {
    const hero = document.querySelector('#root:not([data-prerendered]) .hero')
    // Holds the header's place in the page while it floats, so nothing below it jumps.
    const spacer = document.createElement('div')
    spacer.className = 'hr-spacer'
    header.before(spacer)
    let floating = false
    let timer = 0

    const past = () => {
      if (hero) return hero.getBoundingClientRect().bottom < 0
      return window.scrollY > header.offsetHeight + 200
    }
    const float = (on) => {
      if (on === floating) return
      floating = on
      spacer.style.height = on ? `${header.offsetHeight}px` : '0'
      header.classList.toggle('hr-floating', on)
      header.dataset.dock = 'hidden'
    }
    const update = () => {
      if (!phone.matches || !past()) {
        clearTimeout(timer)
        float(false)
        return
      }
      float(true)
      // Away while moving; back once the page has been still for a moment.
      header.dataset.dock = 'hidden'
      clearTimeout(timer)
      timer = setTimeout(() => (header.dataset.dock = 'shown'), reduced.matches ? 0 : settle)
    }
    window.addEventListener('scroll', update, { passive: true })
    phone.addEventListener('change', update)
    update()
  }

  const wait = () => {
    const header = document.querySelector('#root:not([data-prerendered]) .site-header')
    if (header) start(header)
    else requestAnimationFrame(wait)
  }
  wait()
})()
