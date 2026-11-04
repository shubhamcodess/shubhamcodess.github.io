/* The batarang: where you are when it's closed, and how to go anywhere when it's open. */
(() => {
  const STOPS = [
    { label: "Home", href: "/", section: "top" },
    { label: "Featured", href: "/#featured", section: "featured" },
    { label: "Experience", href: "/#experience", section: "experience" },
    { label: "Where to find me", href: "/#find-me", section: "find-me" },
  ];
  const SOCIALS = [["GitHub", "shubhamcodess", "https://github.com/shubhamcodess"], ["LinkedIn", "shubham-prakash-dev", "https://www.linkedin.com/in/shubham-prakash-dev/"]];
  const ARROW = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 10 10 2M4 2h6v6"/></svg>';

  /* The last section. Only on the home page, added after the real ones. */
  function placeFindMe(page) {
    const there = document.getElementById("find-me"), home = location.pathname === "/";
    if (there && !home) there.remove();
    if (there || !home) return;
    const sec = document.createElement("section");
    sec.id = "find-me"; sec.className = "sec"; sec.dataset.fit = "screen";
    sec.innerHTML = `<p class="kicker">Where to find me</p><h2 class="sec-title"><span class="mt-line">Where to find me.</span><span class="mt-line dim">GitHub and LinkedIn.</span></h2>
      <ul class="bn-find">${SOCIALS.map(([n, who, h]) => `<li><a href="${h}" target="_blank" rel="noopener"><span class="bn-find-name">${n}</span><span class="bn-find-who">${who}</span>${ARROW}<span class="sr-only"> (opens in a new tab)</span></a></li>`).join("")}</ul>`;
    page.firstElementChild.append(sec);
    // Arriving from another page: the section wasn't there yet when the browser looked for it.
    if (location.hash === "#find-me") setTimeout(() => { page.scrollTop += sec.getBoundingClientRect().top; }, 900);
  }

  function start() {
    const page = document.getElementById("page"), shape = document.querySelector(".scroll-thumb-shape");
    if (!page || !shape) return setTimeout(start, 100);
    placeFindMe(page);

    const nav = document.createElement("nav");
    nav.className = "bn"; nav.setAttribute("aria-label", "Sections");
    nav.innerHTML = `<button class="bn-bat" type="button" aria-expanded="false" aria-controls="bn-panel" aria-label="Sections menu"><span>${shape.innerHTML}</span><b class="bn-now" aria-hidden="true"></b></button>
      <div class="bn-edge"></div>
      <div class="bn-cue">${STOPS.map((_, i) => `<i style="--t:${i / (STOPS.length - 1)}"></i>`).join("")}</div>
      <div class="bn-wash"></div>
      <div class="bn-panel" id="bn-panel"><i class="bn-line"></i>
        ${STOPS.map((s, i) => `<a class="bn-stop" href="${s.href}" data-i="${i}" style="--i:${i};--t:${i / (STOPS.length - 1)}">${s.label}</a>`).join("")}
      </div>`;
    document.body.append(nav);
    const bat = nav.querySelector(".bn-bat"), links = [...nav.querySelectorAll(".bn-stop")], line = nav.querySelector(".bn-line");

    const narrow = matchMedia("(max-width: 860px)");

    const onHome = () => location.pathname === "/";
    const sectionTop = (s) => s.section === "top" ? 0 : page.scrollTop + document.getElementById(s.section).getBoundingClientRect().top;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll → place: straight between marks, so landing on a section puts the batarang exactly on its mark.
    let marks = [], railTop = 0, railH = 0, moved, lastKey = "";
    const yAt = (t) => railTop + railH * t;
    function measure() {
      const h = document.documentElement.clientHeight, header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h"));
      railTop = header + 28; railH = h - railTop - (narrow.matches ? 96 : 44);
      nav.style.setProperty("--rail-h", `${railH}px`);
      const step = 1 / (STOPS.length - 1);
      if (!onHome()) { marks = []; moved?.cancel(); moved = null; lastKey = ""; bat.style.transform = `translateY(${yAt(step)}px)`; current(1); return; } // The projects pages hang off Featured.
      const end = page.scrollHeight - page.clientHeight;
      marks = STOPS.map((s, i) => ({ at: Math.min(end, sectionTop(s)), t: i * step }));
      const key = `${end}|${railH}|${marks.map((m) => m.at).join()}`;
      if (key !== lastKey) { lastKey = key; link(end); }
      sync();
    }
    function link(end) {
      moved?.cancel(); moved = null;
      if (reduced || !("ScrollTimeline" in window) || end <= 0) return;
      bat.style.transform = `translateY(${yAt(marks.at(-1).t).toFixed(1)}px)`; // Chromium can drop a finished scroll animation at the very end of the page, so it rests where the path ends.
      moved = bat.animate(marks.map((m) => ({ transform: `translateY(${yAt(m.t).toFixed(1)}px)`, offset: Math.min(1, m.at / end) })), { timeline: new ScrollTimeline({ source: page }), fill: "both" });
    }
    function placeAt(s) {
      let i = 0;
      while (i < marks.length - 2 && s >= marks[i + 1].at) i++;
      const a = marks[i], b = marks[i + 1];
      return a.t + (b.t - a.t) * Math.min(1, Math.max(0, (s - a.at) / (b.at - a.at || 1)));
    }
    // Crossing into a section, a phone shows its name beside the batarang for a moment.
    const now = nav.querySelector(".bn-now");
    let shown = -1, nameIn = 0, nameOut = 0;
    function sayName(i) {
      clearTimeout(nameIn); clearTimeout(nameOut);
      nameIn = setTimeout(() => {
        if (!narrow.matches || nav.hasAttribute("data-open") || nav.hasAttribute("data-peek")) return;
        now.textContent = STOPS[i].label;
        now.dataset.on = "";
        nameOut = setTimeout(() => { delete now.dataset.on; }, 1500);
      }, 160); // A menu jump flies past sections, so only the one it stays in gets named.
    }
    function current(i) {
      if (i === shown) return;
      if (shown >= 0 && onHome()) sayName(i);
      shown = i;
      links.forEach((l, n) => { if (n === i) l.setAttribute("aria-current", "location"); else l.removeAttribute("aria-current"); });
    }
    function sync() {
      if (!marks.length) return;
      const s = page.scrollTop;
      if (!moved) bat.style.transform = `translateY(${yAt(placeAt(s)).toFixed(1)}px)`;
      let here = 0;
      for (let i = 0; i < marks.length; i++) if (s >= marks[i].at - innerHeight * 0.4) here = i;
      current(here);
    }
    let raf = 0;
    page.addEventListener("scroll", () => { raf ||= requestAnimationFrame(() => { raf = 0; sync(); }); }, { passive: true });

    // Open and close.
    let timer = 0;
    const setOpen = (on) => { clearTimeout(timer); endPeek(); if (on) { clearTimeout(nameIn); clearTimeout(nameOut); delete now.dataset.on; } nav.toggleAttribute("data-open", on); bat.setAttribute("aria-expanded", String(on)); };
    const isOpen = () => nav.hasAttribute("data-open");
    const hovers = matchMedia("(hover: hover) and (pointer: fine)");
    bat.addEventListener("click", () => setOpen(hovers.matches || !isOpen())); // With a pointer, hovering has already opened it, so a click mustn't close it again.
    nav.addEventListener("pointerover", (e) => { if (hovers.matches && (e.target.closest(".bn-bat, .bn-edge") || isOpen())) setOpen(true); });
    nav.addEventListener("pointerleave", () => { if (hovers.matches) timer = setTimeout(() => setOpen(false), 280); });
    document.addEventListener("pointerdown", (e) => { if (isOpen() && !e.target.closest(".bn-bat, .bn-stop, .header-nav > :last-child")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen()) { setOpen(false); bat.focus(); } });

    /* A smooth trip that treats the pinned film as having no length: it steps straight across, so passing Experience doesn't play its cards. */
    let trip = 0;
    const stopTrip = () => { cancelAnimationFrame(trip); trip = 0; };
    ["wheel", "touchstart", "pointerdown"].forEach((name) => page.addEventListener(name, stopTrip, { passive: true }));
    function travel(to) {
      stopTrip();
      if (reduced) { page.scrollTop = to; return; }
      const film = document.querySelector(".story"), a = Number(film?.dataset.holdStart), length = Number(film?.dataset.holdLength) || 0, b = a + length;
      const flat = (s) => (!length || s <= a ? s : s >= b ? s - length : a), full = (v) => (!length || v <= a ? v : v + length);
      const from = flat(page.scrollTop), end = flat(to), began = performance.now(), time = Math.min(1100, 450 + Math.abs(end - from) * 0.35);
      const step = (now) => {
        const k = Math.min(1, (now - began) / time), e = k < 0.5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2;
        page.scrollTop = k === 1 ? to : full(from + (end - from) * e);
        trip = k < 1 ? requestAnimationFrame(step) : 0;
      };
      trip = requestAnimationFrame(step);
    }

    // A stop on this page scrolls there. Anywhere else goes there.
    links.forEach((a, i) => a.addEventListener("click", (e) => {
      setOpen(false);
      const s = STOPS[i];
      if (!onHome()) return;
      e.preventDefault();
      travel(sectionTop(s));
    }));

    /* A first visit on a phone: the menu shows itself once, then pulls back into the batarang. Any touch ends it. */
    let peekOut = 0;
    function endPeek() {
      if (!nav.hasAttribute("data-peek")) return;
      clearTimeout(peekOut);
      nav.removeAttribute("data-peek");
      setTimeout(() => nav.removeAttribute("data-peek-style"), 400);
    }
    const seen = () => { try { return localStorage.getItem("bn-peeked") === "1"; } catch { return false; } };
    const remember = () => { try { localStorage.setItem("bn-peeked", "1"); } catch {} };
    function peek() {
      if (!narrow.matches || reduced || !onHome() || page.scrollTop > 40 || nav.hasAttribute("data-open")) return;
      if (seen() && !location.search.includes("peek")) return;
      remember();
      nav.setAttribute("data-peek-style", "");
      requestAnimationFrame(() => {
        nav.setAttribute("data-peek", "");
        peekOut = setTimeout(endPeek, 2300); // Time to draw, and about a second to read.
      });
      addEventListener("touchstart", endPeek, { once: true, passive: true });
      page.addEventListener("scroll", endPeek, { once: true, passive: true });
    }

    measure();
    setTimeout(peek, 2000); // Once the hero has settled.
    new ResizeObserver(measure).observe(page.firstElementChild);
    let w = innerWidth, h = document.documentElement.clientHeight, path = location.pathname;
    addEventListener("resize", () => { if (innerWidth !== w || document.documentElement.clientHeight !== h) { w = innerWidth; h = document.documentElement.clientHeight; measure(); } });
    document.fonts?.ready.then(measure);
    setInterval(() => { if (location.pathname !== path) { path = location.pathname; shown = -1; placeFindMe(page); measure(); } }, 300);
  }
  addEventListener("load", () => setTimeout(start, 500));
})();
