/**
 * When the page has finished arriving. Moving between pages, the browser plays a view transition (see
 * base.css); work that is heavy on the GPU or main thread at start-up (compiling the hero light's shaders,
 * starting animation loops) waits until it is over, so the transition itself never stutters.
 *
 * `pagereveal` fires before the page's first frame, carrying the transition if there is one. It must be heard
 * early, so main.tsx imports this module first. With no transition (a first visit, a reload, reduced motion)
 * it resolves at once; a backstop resolves it regardless after a second.
 */
let arrive: () => void = () => undefined
const arrived = new Promise<void>((resolve) => {
  arrive = resolve
})

type RevealEvent = Event & { readonly viewTransition?: { readonly finished: Promise<void> } | null }

window.addEventListener(
  'pagereveal',
  (event) => {
    const transition = (event as RevealEvent).viewTransition
    if (transition) void transition.finished.then(arrive, arrive)
    else arrive()
  },
  { once: true },
)
window.setTimeout(arrive, 1000)

/** Resolves once the page has fully arrived. */
export const afterPageArrives = (): Promise<void> => arrived
