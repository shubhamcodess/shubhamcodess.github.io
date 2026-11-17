// Prototype 35: /me as small blocks on top and one endless gallery below.
// It swaps the tile grid on the built /me page for this layout. Nothing in apps/portfolio changes.
(() => {
  if (!location.pathname.replace(/\/+$/, '').endsWith('/me')) return

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  // One small block per thing. Add a line here to add a block; its id is the category photos can carry.
  const blocks = [
    { id: 'biking', title: 'Biking', frame: 'sheet', icon: 'bike' },
    { id: 'photography', title: 'Photography', frame: 'print', icon: 'camera' },
    { id: 'filmmaking', title: 'Filmmaking', frame: 'reel', icon: 'reel' },
    { id: 'food', title: 'Food', frame: 'print', icon: 'bowl' },
    { id: 'people', title: 'People', frame: 'sheet', icon: 'people' },
    { id: 'places', title: 'Places', frame: 'sheet', icon: 'pin' },
  ]

  // Each photo: its size (so wide ones hang uncropped on two pegs), a title for the polaroid's foot,
  // a line of description, and one or two categories. The real build reads these from one folder and one list.
  // Only four photos are on the site today, so the prototype repeats them to show a long gallery; their
  // categories are for the demo.
  const real = [
    {
      src: 'me/places/bengaluru-office',
      w: 1600,
      h: 900,
      title: 'The Innovation wall',
      text: 'A living wall of plants at the office, under a perforated ceiling.',
      tags: ['places'],
    },
    {
      src: 'me/places/bengaluru-meal',
      w: 1600,
      h: 900,
      title: 'On a banana leaf',
      text: 'A South Indian meal: rice, sambar, rasam, curries, curd and papad.',
      tags: ['food'],
    },
    {
      src: 'me/places/bengaluru-chaat',
      w: 900,
      h: 1600,
      title: 'Chaat at dusk',
      text: 'Chaat and a glass of tea on a balcony.',
      tags: ['food', 'photography'],
    },
    {
      src: 'me/places/bengaluru-christmas',
      w: 1600,
      h: 901,
      title: 'Christmas lights',
      text: 'A rainbow-lit tree outside Phoenix Mall of Asia at night.',
      tags: ['places', 'photography'],
    },
  ]
  // The owner's own photos, kept beside the prototype and out of the repository (photos/.gitignore).
  real.push(
    { src: '__proto/photos/doughnuts', w: 900, h: 1600, title: 'A box of doughnuts', text: 'Six glazed doughnuts in an open box, one with rainbow sprinkles.', tags: ['food'] },
    { src: '__proto/photos/sandwich', w: 900, h: 1600, title: 'Grilled sandwich', text: 'A grilled sandwich with cucumber and lettuce by a window.', tags: ['food'] },
    { src: '__proto/photos/bike-rain', w: 1600, h: 900, title: 'After the rain', text: 'Rain on the handlebars and dashboard of the bike.', tags: ['biking'] },
    { src: '__proto/photos/figurine', w: 1066, h: 1600, title: 'The figurine', text: 'A figurine in a striped shirt on a desk.', tags: ['people'] },
  )
  const library = Array.from({ length: 40 }, (_, i) => ({ ...real[i % real.length], key: i }))

  const icons = {
    bike: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l3 7M9 6h3"/>',
    camera: '<rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-2.5h5L16 7"/>',
    reel: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="7" r="1.8"/><circle cx="12" cy="17" r="1.8"/><circle cx="7" cy="12" r="1.8"/><circle cx="17" cy="12" r="1.8"/>',
    bowl: '<path d="M3.5 11h17a8.5 8.5 0 0 1-17 0z"/><path d="M9 7c0-1.5 1-1.5 1-3M13 7c0-1.5 1-1.5 1-3"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="16.5" cy="9" r="2.3"/><path d="M15.5 14.2c2.4-.3 4.3 1.2 5 4.3"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  }
  const svg = (name, size = 22) =>
    `<svg class="me35-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`
  const line = (d, size = 18) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`

  const url = (path) => `/${path}`
  const turns = [-3, 2, -1.5, 3, -2.5, 1.5, -2, 2.5]
  const blockTurns = [-2, 1.6, -1.2, 2.2, -1.8, 1.2]
  const isWide = (p) => p.w > p.h * 1.15

  const build = (grid) => {
    const about = document.createElement('section')
    about.id = 'about'
    about.className = 'me35-about'
    about.setAttribute('aria-label', 'What I do')
    about.innerHTML = `
      <ul class="me35-blocks">
        ${blocks
          .map(
            (b, i) => `<li style="--turn:${blockTurns[i % blockTurns.length]}deg">
              <a class="me35-block me35-block--${b.frame}" href="#gallery" data-show="${b.id}" data-tilt>
                ${svg(b.icon)}
                <span class="me35-block__title">${b.title}</span>
              </a>
            </li>`,
          )
          .join('')}
      </ul>
      <a class="me35-cue" href="#gallery" data-show=""><span>Every photo</span>${line('M12 5v14M6 13l6 6 6-6', 14)}</a>`

    // The blocks again, small, kept at the top while the gallery is on screen. "All" clears the choice.
    const dock = document.createElement('nav')
    dock.className = 'me35-dock'
    dock.setAttribute('aria-label', 'Show photos of')
    dock.innerHTML = `<div class="me35-dock__bar">${[{ id: '', title: 'All', icon: 'grid' }, ...blocks]
      .map((b) => `<a class="me35-pill" href="#gallery" data-show="${b.id}">${svg(b.icon, 14)}<span>${b.title}</span></a>`)
      .join('')}</div>`

    const gallery = document.createElement('section')
    gallery.id = 'gallery'
    gallery.className = 'me35-gallery'
    gallery.innerHTML = `<h2 class="visually-hidden">Gallery</h2>
      <p class="me35-showing" aria-live="polite"></p>
      <div class="clothesline" role="group" aria-label="Photos"></div>
      <p class="me35-empty" hidden>No photos here yet.</p>
      <div class="me35-more" aria-hidden="true"></div>`

    grid.replaceWith(about)
    about.after(dock, gallery)

    // ── The gallery: lines of prints, strung as the visitor scrolls. A wide photo takes two places. ──
    const lines = gallery.querySelector('.clothesline')
    const more = gallery.querySelector('.me35-more')
    const showing = gallery.querySelector('.me35-showing')
    const empty = gallery.querySelector('.me35-empty')
    const perLineAt = (w) => (w < 440 ? 2 : w < 760 ? 3 : w < 1100 ? 4 : 5)
    let perLine = perLineAt(lines.clientWidth)
    let photos = library
    let rows = []
    let strung = 0

    // Fill each line in order. When a wide photo won't fit the space left, the next upright one that does
    // steps in, so lines don't end with a gap.
    const pack = () => {
      const queue = photos.map((photo, index) => ({ photo, index, span: isWide(photo) ? Math.min(2, perLine) : 1 }))
      rows = []
      while (queue.length) {
        const row = []
        let used = 0
        while (queue.length && used < perLine) {
          const at = queue.findIndex((item, k) => k < 4 && used + item.span <= perLine)
          if (at === -1) break
          const [item] = queue.splice(at, 1)
          row.push({ ...item, from: used })
          used += item.span
        }
        rows.push(row)
      }
    }

    // A twisted cord: a dark core, then two strands dashed half a twist apart and offset either side of it,
    // which reads as plies wound round each other. Drawn at the line's real width, so the twist keeps its pitch.
    const rope = (width) => {
      const d = `M0 6 Q${width / 2} 34 ${width} 6`
      return `<svg class="clothesline__line me35-rope" viewBox="0 0 ${width} 40" preserveAspectRatio="none" aria-hidden="true">
        <path class="me35-rope__shadow" d="${d}" transform="translate(0 3)"/>
        <path class="me35-rope__core" d="${d}"/>
        <path class="me35-rope__ply me35-rope__ply--dark" d="${d}" transform="translate(0 0.7)"/>
        <path class="me35-rope__ply me35-rope__ply--light" d="${d}" transform="translate(0 -0.7)"/>
      </svg>`
    }

    // A wooden clothes peg, seen from the front: one tapered piece of wood with a little grain, a steel spring
    // wound round its waist, its top over the rope and its jaw biting the print's top edge below.
    const clip = (extra = '') => `<span class="me35-clip${extra}" aria-hidden="true"><svg viewBox="0 0 12 34" width="12" height="34">
        <path class="me35-clip__body" d="M3 0.6h6a1.8 1.8 0 0 1 1.8 1.8L10 31.6a1.8 1.8 0 0 1-1.8 1.8H3.8A1.8 1.8 0 0 1 2 31.6L1.2 2.4A1.8 1.8 0 0 1 3 0.6z"/>
        <path class="me35-clip__shade" d="M8.4 1.2a1.5 1.5 0 0 1 1.8 1.4L9.5 31.4a1.5 1.5 0 0 1-1.3 1.4z"/>
        <path class="me35-clip__grain" d="M4.4 3v10M6.6 20v10M5.6 4v6"/>
        <path class="me35-clip__notch" d="M3.4 8.5h5.2"/>
        <rect class="me35-clip__spring" x="0.6" y="13.6" width="10.8" height="3.8" rx="1.3"/>
        <path class="me35-clip__coil" d="M3 14.2v2.6M5 14.2v2.6M7 14.2v2.6M9 14.2v2.6"/>
      </svg></span>`

    const string = (row) => {
      const element = document.createElement('div')
      element.className = 'clothesline__row me35-row'
      element.style.setProperty('--per-line', perLine)
      element.innerHTML = `${rope(Math.max(1, Math.round(lines.clientWidth)))}
        <ul class="clothesline__prints">${row
          .map(({ photo, index, span, from }, k) => {
            const along = (from + span / 2) / perLine
            const turn = turns[index % turns.length] * (span > 1 ? 0.4 : 1)
            return `<li class="clothesline__print${span > 1 ? ' me35-wide' : ''}" style="--print-turn:${turn}deg;--print-drop:${Math.sin(along * Math.PI).toFixed(3)};--k:${k};--ratio:${photo.w}/${photo.h}">
              ${span > 1 ? clip(' me35-clip--left') + clip(' me35-clip--right') : clip()}
              <button type="button" class="clothesline__open" data-index="${index}" aria-label="Open photo: ${photo.title}">
                <img src="${url(photo.src)}-print.webp" alt="" loading="lazy" decoding="async">
                <span class="clothesline__glass" aria-hidden="true"></span>
              </button>
              <span class="me35-caption">${photo.title}</span>
            </li>`
          })
          .join('')}</ul>`
      lines.append(element)
    }

    const grow = (count) => {
      const target = Math.min(rows.length, strung + count)
      while (strung < target) string(rows[strung++])
      more.hidden = strung >= rows.length
    }

    const restring = (keepRows) => {
      lines.textContent = ''
      strung = 0
      pack()
      grow(keepRows)
    }

    // Show one category, or every photo when `id` is empty.
    const show = (id) => {
      photos = id ? library.filter((p) => p.tags.includes(id)) : library
      const block = blocks.find((b) => b.id === id)
      showing.innerHTML = block
        ? `<span>${block.title}</span><span class="me35-showing__count">${photos.length} photos</span><button type="button" class="me35-showing__all">Show all</button>`
        : `<span>Every photo</span><span class="me35-showing__count">${photos.length}</span>`
      empty.hidden = photos.length > 0
      for (const pill of dock.querySelectorAll('.me35-pill')) pill.setAttribute('aria-pressed', String(pill.dataset.show === id))
      restring(3)
    }

    show('')
    new ResizeObserver(() => {
      const next = perLineAt(lines.clientWidth)
      if (next === perLine) return
      perLine = next
      restring(Math.max(3, strung))
    }).observe(lines)
    new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && grow(2), { rootMargin: '900px 0px' }).observe(more)

    // ── Every block and pill shows its photos, and brings the gallery up. ──
    const choose = (id) => {
      show(id)
      // replaceState, so the page's own hash listener (which opens tiles) never runs.
      history.replaceState(history.state, '', id ? `#gallery/${id}` : '#gallery')
      gallery.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
    const onChoose = (event) => {
      const link = event.target.closest('[data-show]')
      if (!link) return
      event.preventDefault()
      choose(link.dataset.show)
    }
    about.addEventListener('click', onChoose)
    dock.addEventListener('click', onChoose)
    showing.addEventListener('click', (event) => {
      if (event.target.closest('.me35-showing__all')) choose('')
    })

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

    // ── The viewer: a darkroom. The print hangs larger from its own peg on a rope across the top, with the
    // long caption on its foot; the controls sit in one bar at the bottom. ──
    const viewer = document.createElement('dialog')
    viewer.className = 'photo-viewer me35-viewer'
    viewer.innerHTML = `<div class="me35-viewer__rope"></div>
      <figure class="photo-viewer__print">
        <span class="me35-viewer__pegs"></span>
        <span class="photo-viewer__photo"><img alt="" decoding="async"><span class="clothesline__glass" aria-hidden="true"></span></span>
        <figcaption class="me35-viewer__caption"></figcaption>
      </figure>
      <div class="me35-viewer__bar">
        <button type="button" class="me35-viewer__step" data-step="-1" aria-label="Previous photo">${line('M19 12H5M11 6l-6 6 6 6')}</button>
        <span class="me35-viewer__count"></span>
        <button type="button" class="me35-viewer__step" data-step="1" aria-label="Next photo">${line('M5 12h14M13 6l6 6-6 6')}</button>
      </div>
      <button type="button" class="photo-viewer__close" aria-label="Close photo">${line('M6 6l12 12M18 6L6 18')}</button>`
    document.body.append(viewer)
    let at = 0
    let opener = null
    const showPhoto = (index) => {
      at = (index + photos.length) % photos.length
      const p = photos[at]
      const img = viewer.querySelector('img')
      img.src = `${url(p.src)}.webp`
      img.alt = p.text
      viewer.setAttribute('aria-label', p.title)
      viewer.querySelector('.me35-viewer__caption').textContent = p.text
      viewer.querySelector('.me35-viewer__count').textContent = `${at + 1} / ${photos.length}`
      viewer.querySelector('.me35-viewer__pegs').innerHTML = isWide(p) ? clip(' me35-clip--left') + clip(' me35-clip--right') : clip()
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
      viewer.querySelector('.me35-viewer__rope').innerHTML = rope(innerWidth)
      viewer.showModal()
    })
    viewer.querySelector('.photo-viewer__close').onclick = close
    for (const step of viewer.querySelectorAll('[data-step]')) step.onclick = () => showPhoto(at + Number(step.dataset.step))
    viewer.addEventListener('click', (event) => event.target === viewer && close())
    viewer.addEventListener('cancel', (event) => {
      event.preventDefault()
      close()
    })
    viewer.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') showPhoto(at + 1)
      if (event.key === 'ArrowLeft') showPhoto(at - 1)
    })

    // Landing on /me/#gallery or /me/#gallery/food opens straight onto it.
    const landing = location.hash.match(/^#gallery\/?(.*)$/)
    if (landing) {
      show(blocks.some((b) => b.id === landing[1]) ? landing[1] : '')
      gallery.scrollIntoView({ block: 'start' })
    }
  }

  // The page draws after load: wait for its live tile grid (not the hidden prerendered copy), then swap it.
  const wait = () => {
    const grid = document.querySelector('#root:not([data-prerendered]) #main .me-grid')
    if (grid) build(grid)
    else requestAnimationFrame(wait)
  }
  wait()
})()
