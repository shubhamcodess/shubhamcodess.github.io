// Turns the home page that 404.html draws into the not-found page: the header and the night sky stay,
// the hero says the page is missing and shows the address, and two buttons lead home and to the builds.
(() => {
  const draw = () => {
    const content = document.querySelector(".hero__content");
    const actions = document.querySelector(".hero__actions");
    if (!content || !actions) return false;
    document.documentElement.classList.add("not-found");
    document.querySelectorAll("#main > section").forEach((section) => section.remove());

    const intro = content.querySelector(".hero__intro");
    intro.innerHTML = "";
    const code = document.createElement("p");
    code.className = "not-found__code";
    code.textContent = "404";
    const title = document.createElement("h1");
    title.className = "hero__name not-found__title";
    title.textContent = "Page not found";
    const lead = document.createElement("p");
    lead.className = "hero__statement not-found__lead";
    const path = document.createElement("code");
    path.className = "not-found__path";
    path.textContent = location.pathname;
    lead.append("Nothing lives at ", path, ". It may have moved, or the address has a typo.");
    intro.append(code, title, lead);

    const [first, second] = actions.querySelectorAll("a");
    const arrow = second.querySelector("svg");
    first.href = "/";
    first.querySelector("span").textContent = "Home";
    first.querySelector("svg")?.replaceWith(arrow.cloneNode(true));
    second.href = "/builds/";
    second.querySelector("span").textContent = "Builds";
    actions.setAttribute("aria-label", "Where to go");
    // Home's section tracking can still write a #section into the address; the not-found page has none.
    for (const name of ["replaceState", "pushState"]) {
      const original = history[name].bind(history);
      history[name] = (state, unused, url) => original(state, unused, url && String(url).split("#")[0]);
    }
    if (location.hash) history.replaceState(null, "", location.pathname);
    return true;
  };
  if (draw()) return;
  const watch = new MutationObserver(() => draw() && watch.disconnect());
  watch.observe(document.documentElement, { childList: true, subtree: true });
})();
