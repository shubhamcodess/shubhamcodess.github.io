// Prototype 35: /me as small blocks on top and one endless gallery below.
// It swaps the tile grid on the built /me page for this layout. Nothing in apps/portfolio changes.
(() => {
  if (!location.pathname.replace(/\/+$/, '').endsWith('/me')) return

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  // What the visitor sees first: one small block per thing. Add a line here to add a block.
  const blocks = [
    { id: 'biking', title: 'Biking', frame: 'sheet', icon: 'bike' },
    { id: 'photography', title: 'Photography', frame: 'print', icon: 'camera' },
    { id: 'filmmaking', title: 'Filmmaking', frame: 'film', icon: 'film' },
    { id: 'places', title: 'Places', note: 'Bengaluru · Jamshedpur · Bhubaneswar', frame: 'sheet', icon: 'pin' },
  ]

  // The real site would read every photo in one folder. Only four are on the site today, so the prototype
  // repeats them to show how a long gallery scrolls. No labels, no categories: just the photos.
  const real = [
    { src: 'me/places/bengaluru-office', alt: 'The Innovation wall at the office, a living wall of plants under a perforated ceiling' },
    { src: 'me/places/bengaluru-meal', alt: 'A South Indian meal on a banana leaf' },
    { src: 'me/places/bengaluru-chaat', alt: 'Chaat and a glass of tea on a balcony at dusk' },
    { src: 'me/places/bengaluru-christmas', alt: 'A rainbow-lit Christmas tree outside a mall at night' },
  ]
  const photos = Array.from({ length: 40 }, (_, i) => real[i % real.length])

  const icons = {
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l3 7M9 6h3"/>',
    camera: '<rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-2.5h5L16 7"/>',
    film: '<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M8 4v16M16 4v16M4 8h4M4 12h4M4 16h4M16 8h4M16 12h4M16 16h4"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
  }
  const svg = (name, size = 22) =>
    `<svg class="me35-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`

  const url = (path) => `/${path}`
  const turns = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5]
  const blockTurns = [-2, 1.6, -1.2, 2.2, -1.8, 1.2]

  const build = (grid) => {
    const main = grid.closest('main')
    const about = document.createElement('section')
    about.id = 'about'
    about.className = 'me35-about'
    about.setAttribute('aria-label', 'What I do')
    about.innerHTML = `
      <ul class="me35-blocks">
        ${blocks
          .map(
            (b, i) => `<li style="--turn:${blockTurns[i % blockTurns.length]}deg">
              <a class="me35-block me35-block--${b.frame}" href="#gallery" data-tilt>
                ${svg(b.icon)}
                <span class="me35-block__title">${b.title}</span>
                ${b.note ? `<span class="me35-block__note">${b.note}</span>` : ''}
              </a>
            </li>`,
          )
          .join('')}
      </ul>
      <a class="me35-cue" href="#gallery"><span>The gallery</span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6"/></svg></a>`

    // The blocks again, small, kept at the top while the gallery is on screen.
    const dock = document.createElement('nav')
    dock.className = 'me35-dock'
    dock.setAttribute('aria-label', 'What I do')
    dock.innerHTML = `<div class="me35-dock__bar">${blocks
      .map((b) => `<a class="me35-pill" href="#gallery">${svg(b.icon, 14)}<span>${b.title}</span></a>`)
      .join('')}</div>`

    const gallery = document.createElement('section')
    gallery.id = 'gallery'
    gallery.className = 'me35-gallery'
    gallery.innerHTML = `<h2 class="visually-hidden">Gallery</h2><div class="clothesline" role="group" aria-label="Photos"></div><div class="me35-more" aria-hidden="true"></div>`

    grid.replaceWith(about)
    about.after(dock, gallery)

    // ── The gallery: lines of prints, strung as the visitor scrolls. ──
    const lines = gallery.querySelector('.clothesline')
    const more = gallery.querySelector('.me35-more')
    const perLineAt = (w) => (w < 440 ? 2 : w < 760 ? 3 : w < 1100 ? 4 : 5)
    let perLine = perLineAt(lines.clientWidth)
    let shown = 0
    const step = () => perLine * 2

    const addLine = (start) => {
      const line = photos.slice(start, start + perLine)
      const row = document.createElement('div')
      row.className = 'clothesline__row me35-row'
      row.style.setProperty('--per-line', perLine)
      row.innerHTML = `<svg class="clothesline__line" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 6 Q500 34 1000 6"/></svg>
        <ul class="clothesline__prints">${line
          .map((p, k) => {
            const index = start + k
            const along = perLine === 1 ? 0.5 : (k + 0.5) / perLine
            return `<li class="clothesline__print" style="--print-turn:${turns[index % turns.length]}deg;--print-drop:${Math.sin(along * Math.PI).toFixed(3)};--k:${k}">
              <span class="clothesline__peg"></span>
              <button type="button" class="clothesline__open" data-index="${index}" aria-label="Open photo: ${p.alt}">
                <img src="${url(p.src)}-print.webp" alt="" loading="lazy" decoding="async">
                <span class="clothesline__glass" aria-hidden="true"></span>
              </button>
            </li>`
          })
          .join('')}</ul>`
      lines.append(row)
    }

    const grow = (count) => {
      const target = Math.min(photos.length, shown + count)
      while (shown < target) {
        addLine(shown)
        shown = Math.min(photos.length, shown + perLine)
      }
      if (shown >= photos.length) more.hidden = true
    }

    const relayout = () => {
      const next = perLineAt(lines.clientWidth)
      if (next === perLine) return
      perLine = next
      const keep = shown
      lines.textContent = ''
      shown = 0
      grow(keep)
    }

    grow(step() + perLine)
    new ResizeObserver(relayout).observe(lines)
    new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && grow(step()), { rootMargin: '900px 0px' }).observe(more)

    // ── Every block and pill leads to the gallery. ──
    const toGallery = (event) => {
      const link = event.target.closest('a[href="#gallery"]')
      if (!link) return
      event.preventDefault()
      // replaceState, so the page's own hash listener (which opens tiles) never runs.
      history.replaceState(history.state, '', '#gallery')
      gallery.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
    about.addEventListener('click', toGallery)
    dock.addEventListener('click', toGallery)

    // The dock shows once the big blocks have scrolled away and the gallery is on screen.
    let blocksGone = false
    let galleryOn = false
    const sync = () => dock.toggleAttribute('data-shown', blocksGone && galleryOn)
    new IntersectionObserver(([e]) => {
      blocksGone = !e.isIntersecting
      sync()
    }).observe(about.querySelector('.me35-blocks'))
    new IntersectionObserver(([e]) => {
      galleryOn = e.isIntersecting
      sync()
    }).observe(gallery)

    // ── The viewer: the site's own photo viewer, stepping through every photo. ──
    const viewer = document.createElement('dialog')
    viewer.className = 'photo-viewer'
    viewer.innerHTML = `<figure class="photo-viewer__print"><span class="photo-viewer__photo"><img alt="" decoding="async"><span class="clothesline__glass" aria-hidden="true"></span></span>
      <figcaption><span class="me35-caption"></span><span class="photo-viewer__count"></span></figcaption></figure>
      <button type="button" class="photo-viewer__close" aria-label="Close photo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      <button type="button" class="photo-viewer__step photo-viewer__step--back" aria-label="Previous photo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg></button>
      <button type="button" class="photo-viewer__step photo-viewer__step--on" aria-label="Next photo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>`
    document.body.append(viewer)
    let at = 0
    let opener = null
    const showPhoto = (index) => {
      at = (index + photos.length) % photos.length
      const p = photos[at]
      const img = viewer.querySelector('img')
      img.src = `${url(p.src)}.webp`
      img.alt = p.alt
      viewer.setAttribute('aria-label', p.alt)
      viewer.querySelector('.me35-caption').textContent = p.alt
      viewer.querySelector('.photo-viewer__count').textContent = `${at + 1} / ${photos.length}`
    }
    const close = () => {
      viewer.close()
      opener?.focus()
    }
    gallery.addEventListener('click', (event) => {
      const button = event.target.closest('.clothesline__open')
      if (!button) return
      opener = button
      showPhoto(Number(button.dataset.index))
      viewer.showModal()
    })
    viewer.querySelector('.photo-viewer__close').onclick = close
    viewer.querySelector('.photo-viewer__step--back').onclick = () => showPhoto(at - 1)
    viewer.querySelector('.photo-viewer__step--on').onclick = () => showPhoto(at + 1)
    viewer.addEventListener('click', (event) => event.target === viewer && close())
    viewer.addEventListener('cancel', (event) => {
      event.preventDefault()
      close()
    })
    viewer.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') showPhoto(at + 1)
      if (event.key === 'ArrowLeft') showPhoto(at - 1)
    })

    if (location.hash === '#gallery') gallery.scrollIntoView({ block: 'start' })
  }

  // The page draws after load: wait for its tile grid, then swap it.
  const wait = () => {
    const grid = document.querySelector('#root:not([data-prerendered]) #main .me-grid')
    if (grid) build(grid)
    else requestAnimationFrame(wait)
  }
  wait()
})()
