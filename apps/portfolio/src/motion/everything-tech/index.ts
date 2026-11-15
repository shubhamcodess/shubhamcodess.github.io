import { prefersStill, styles, type Motion, type MotionControls } from '../types'
import css from './everything-tech.css?inline'

/*
 * A real reading session on EverythingTech's edition of Friday 30 October 2026, recorded from the live site:
 * the front page and cover story, the must-reads, the Wire filtered to AI, a quick hit opened, the foot of the
 * page, the archive, and night then day. One take for wide screens (1280 × 800) and one for phones
 * (390 × 844), each an H.264 file in public/motion/everything-tech, fetched only by this build's page.
 */
const ADDRESS = 'shubhamcodess.github.io/everything-tech-newsletter'
/** Below this width the stage shows the phone take. */
const PHONE_BELOW = 560

const asset = (name: string) => `${import.meta.env.BASE_URL}motion/everything-tech/${name}`

function mount(root: HTMLElement): MotionControls {
  const still = prefersStill()
  root.innerHTML = `<div class="mac">
    <div class="mac__bar">
      <span class="mac__lights" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="mac__address"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4z"/></svg>${ADDRESS}</span>
    </div>
    <div class="mac__screen"><video muted playsinline loop preload="none" disablepictureinpicture aria-hidden="true"></video></div>
  </div>`
  const mac = root.querySelector<HTMLElement>('.mac')
  const video = root.querySelector('video')
  if (!mac || !video) throw new Error('motion: everything-tech markup')

  let take: 'desktop' | 'phone' | null = null
  let paused = false
  let visible = false

  const sync = () => {
    if (still || paused || !visible) video.pause()
    else void video.play().catch(() => {})
  }
  const choose = () => {
    const next = root.clientWidth < PHONE_BELOW ? 'phone' : 'desktop'
    if (next === take) return
    take = next
    mac.dataset.take = next
    video.poster = asset(`${next}.jpg`)
    if (still) return
    video.src = asset(`${next}.mp4`)
    video.load()
    sync()
  }

  const sizes = new ResizeObserver(choose)
  sizes.observe(root)
  const io = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? false
      sync()
    },
    { threshold: 0.2 },
  )
  io.observe(root)
  choose()

  return {
    still,
    setPaused: (next) => {
      paused = next
      sync()
    },
    replay: () => {
      paused = false
      video.currentTime = 0
      sync()
    },
    stop: () => {
      sizes.disconnect()
      io.disconnect()
      video.pause()
      video.removeAttribute('src')
      video.load()
    },
  }
}

export const motion: Motion = { css: styles(css, ''), mount }
