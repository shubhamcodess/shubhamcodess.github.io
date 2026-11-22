/**
 * Development only: measures how smoothly the book turns on whatever device has the page open (a phone on the
 * same Wi-Fi, through the dev server's network address) and posts each turn's numbers to the dev server, which
 * prints them in its log. Never part of a build: AboutPage loads it only when import.meta.env.DEV.
 */

interface TurnReport {
  readonly kind: 'turn'
  readonly label: string
  readonly frames: number
  readonly ms: number
  readonly fps: number
  readonly p50: number
  readonly p95: number
  readonly worst: number
  readonly dropped: number
  readonly longTasks: number
  readonly longTaskMs: number
  readonly firstFrameMs: number
}

const endpoint = '/__about-perf'
const send = (body: object) => {
  try {
    void fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), keepalive: true })
  } catch {
    // The probe never gets in the page's way.
  }
}

function gpu(): string {
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const info = gl?.getExtension('WEBGL_debug_renderer_info')
    return info && gl ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : 'unknown'
  } catch {
    return 'unknown'
  }
}

export function startProbe(): () => void {
  const nav = navigator as Navigator & { deviceMemory?: number }
  send({
    kind: 'device',
    ua: navigator.userAgent,
    dpr: window.devicePixelRatio,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    cores: navigator.hardwareConcurrency,
    memory: nav.deviceMemory ?? 'unknown',
    gpu: gpu(),
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  })

  let longTasks: PerformanceEntry[] = []
  let observer: PerformanceObserver | undefined
  try {
    observer = new PerformanceObserver((list) => {
      longTasks.push(...list.getEntries())
    })
    observer.observe({ type: 'longtask', buffered: false })
  } catch {
    // Not every browser reports long tasks.
  }

  let measuring = false
  const onTurn = (event: Event) => {
    if (measuring) return
    measuring = true
    longTasks = []
    const label = (event as CustomEvent<string>).detail ?? ''
    const start = performance.now()
    const stamps: number[] = [start]
    const tick = (now: number) => {
      stamps.push(now)
      if (now - start < 1100) return void requestAnimationFrame(tick)
      measuring = false
      const deltas = stamps.slice(1).map((stamp, index) => stamp - (stamps[index] ?? stamp))
      const sorted = [...deltas].sort((a, b) => a - b)
      const at = (q: number) => Math.round((sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] ?? 0) * 10) / 10
      const ms = now - start
      const report: TurnReport = {
        kind: 'turn',
        label,
        frames: deltas.length,
        ms: Math.round(ms),
        fps: Math.round((deltas.length / ms) * 1000),
        p50: at(0.5),
        p95: at(0.95),
        worst: Math.round(Math.max(0, ...deltas)),
        dropped: deltas.filter((delta) => delta > 25).length,
        longTasks: longTasks.length,
        longTaskMs: Math.round(longTasks.reduce((sum, task) => sum + task.duration, 0)),
        firstFrameMs: Math.round(deltas[0] ?? 0),
      }
      send(report)
    }
    requestAnimationFrame(tick)
  }
  window.addEventListener('about:turn', onTurn)
  return () => {
    window.removeEventListener('about:turn', onTurn)
    observer?.disconnect()
  }
}
