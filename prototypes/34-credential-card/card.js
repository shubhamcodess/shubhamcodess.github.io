// Redraws every credential card as one card: the patch's stitched edge, the award mark on the left,
// level in mono, then the name, the issuer, and Verify at the foot, with the credential's own badge on the right.
(() => {
  const levels = ['Professional', 'Associate', 'Foundations', 'Fundamentals', 'Practitioner', 'Advanced', 'Essentials', 'Expert', 'Leader', 'Level 1']
  const award = '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/><path d="m8.5 13-1.5 9 5-3 5 3-1.5-9"/></svg>'
  const arrow = '<svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>'
  const esc = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

  // "Claude Certified Architect, Professional" -> level Professional, name Claude Certified Architect.
  // "Azure Developer Associate" -> level Associate, name Azure Developer.
  const split = (title) => {
    const [, head, tail] = /^(.*), ([^,]+)$/.exec(title) ?? []
    if (tail && levels.includes(tail)) return { level: tail, name: head }
    // Keep the whole title when the level is part of its name ("Azure Fundamentals", not "Azure").
    const last = levels.find((level) => title.endsWith(` ${level}`))
    if (last && title.split(' ').length > 2) return { level: last, name: title.slice(0, -last.length - 1) }
    if (last) return { level: last, name: title }
    if (levels.includes(title.split(' ').at(-1))) return { level: title.split(' ').at(-1), name: title }
    return { level: 'Credential', name: title }
  }

  const card = ({ level, name, issuer, href, badge }) => `
    <span class="cc__head">
      <span class="cc__mark">${award}</span>
      ${badge ? `<img class="cc__badge" src="/__proto/${badge}" alt="" loading="lazy" decoding="async">` : ''}
    </span>
    <span class="cc__level">${esc(level)}</span>
    <span class="cc__name">${esc(name)}</span>
    <span class="cc__issuer">${esc(issuer)}</span>
    ${href ? `<span class="cc__verify"><span>Verify</span>${arrow}</span>` : ''}`

  let badges = null
  const ready = fetch('/__proto/badges.json').then((r) => r.json()).then((map) => (badges = map))

  const draw = () => {
    if (!badges) return
    // Home: the three patches. The whole card is the link, as before.
    for (const patch of document.querySelectorAll('.patch:not(.cc)')) {
      const level = patch.querySelector('.patch__level')?.textContent ?? ''
      const name = patch.querySelector('.patch__title')?.textContent ?? ''
      const issuer = patch.querySelector('.patch__issuer')?.textContent ?? ''
      const full = Object.keys(badges).find((title) => title === `${name}, ${level}` || title === `${name} ${level}` || title === `${level} ${name}` || title === name)
      patch.classList.add('cc')
      patch.innerHTML = card({ level, name, issuer, href: patch.href, badge: badges[full] })
    }
    // Credentials page: each card becomes a link, so the whole card verifies, like home.
    for (const cred of document.querySelectorAll('.cred:not(.cc)')) {
      const title = cred.querySelector('.cred__title')?.textContent ?? ''
      const issuer = cred.closest('.creds__group')?.querySelector('.creds__issuer')?.textContent ?? ''
      const href = cred.querySelector('a')?.href
      const link = document.createElement(href ? 'a' : 'div')
      if (href) Object.assign(link, { href, target: '_blank', rel: 'noopener noreferrer' })
      link.className = 'cred cc'
      link.setAttribute('data-tilt', '')
      if (href) link.setAttribute('aria-label', `Verify: ${title}, ${issuer}`)
      link.innerHTML = card({ ...split(title), issuer, href, badge: badges[title] })
      cred.replaceWith(link)
    }
  }
  ready.then(draw)
  new MutationObserver(draw).observe(document.documentElement, { childList: true, subtree: true })
})()
