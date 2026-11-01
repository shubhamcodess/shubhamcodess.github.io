/* Shared by the card pages: theme, the sketched icons and the softened button from 05-button-soft. */
(() => {
  const root = document.documentElement, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICONS = {
    arrow: [[[3, 12.3], [9, 11.8], [15, 12.1], [20.5, 12]], [[14.5, 6], [20.8, 12], [14.8, 18.2]]],
    back: [[[21, 12.3], [15, 11.8], [9, 12.1], [3.5, 12]], [[9.5, 6], [3.2, 12], [9.2, 18.2]]],
    code: [[[8, 5.5], [2.8, 12], [8, 18.5]], [[16, 5.5], [21.2, 12], [16, 18.5]], [[13.8, 3.8], [10.2, 20.2]]],
    link: [[[9.5, 5], [4, 5.2], [4.2, 12], [4, 20], [12, 19.8], [19.2, 20], [19, 14.5]], [[13, 11], [20.5, 3.5]], [[14.5, 3.4], [20.6, 3.4], [20.6, 9.5]]],
    rss: [[[4, 11], [9, 11.6], [13, 15.4], [13.6, 20.4]], [[4, 4.4], [12, 5.2], [19, 12], [20, 20.4]], [[4.6, 18.4], [6.4, 18.6], [6.4, 20.2], [4.6, 20.2], [4.6, 18.4]]],
  };
  const seeded = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  function sketch(points, seed, amp) {
    const r = seeded(seed), pts = [];
    for (let i = 0; i + 1 < points.length; i++) {
      const [a, b] = points.slice(i, i + 2), n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4));
      for (let k = 0; k < n; k++) pts.push([a[0] + (b[0] - a[0]) * k / n + (r() - .5) * amp, a[1] + (b[1] - a[1]) * k / n + (r() - .5) * amp]);
    }
    const e = points[points.length - 1]; pts.push([e[0] + (r() - .5) * amp, e[1] + (r() - .5) * amp]);
    let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
    for (let i = 0; i + 1 < pts.length; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)], k = .16;
      d += ` C${(p1[0] + (p2[0] - p0[0]) * k).toFixed(2)} ${(p1[1] + (p2[1] - p0[1]) * k).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) * k).toFixed(2)} ${(p2[1] - (p3[1] - p1[1]) * k).toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
    }
    return d;
  }
  const iconSVG = (name, s) => `<svg class="bp-icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name].flatMap((pl, i) => [
    `<path pathLength="1" d="${sketch(pl, s + i * 7, .62)}"/>`,
    `<path class="second" pathLength="1" d="${sketch(pl, s + i * 13 + 91, .95)}"/>`,
  ]).join('')}</svg>`;

  let seed = 3;
  document.querySelectorAll('.bp').forEach((el) => {
    const text = el.textContent, icon = el.dataset.icon;
    el.innerHTML = `<span class="bp-body"><span class="bp-ghost"><i class="g-h"></i><i class="g-v"></i></span><i class="bp-link l1"></i><i class="bp-link l2"></i><i class="bp-link l3"></i><span class="bp-tex"></span><span class="bp-frame"></span>${iconSVG(icon, seed += 11)}<span class="bp-label">${text}</span></span>`;
    const body = el.querySelector('.bp-body'), second = el.querySelectorAll('.bp-icon .second');
    let running = null;
    const sway = () => {
      if (reduced || el.disabled) return;
      if (running) running.cancel();
      const frames = Array.from({ length: 19 }, (_, i) => {
        const u = i / 18, k = .7 * Math.exp(-3 * u) * Math.sin(u * Math.PI * 3) * (u / (u + .08)) * (1 - u * u);
        return { transform: `translate(${k.toFixed(3)}px,${(-k * .42).toFixed(3)}px)` };
      });
      running = body.animate(frames, { duration: 900, easing: 'linear' });
      second.forEach((p, i) => p.animate([{ strokeDashoffset: .45, opacity: .12 }, { strokeDashoffset: 0, opacity: .45 }], { duration: 950, delay: i * 18, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' }));
    };
    el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') sway(); });
    el.addEventListener('focusin', () => { if (el.matches(':focus-visible')) sway(); });
  });
})();
