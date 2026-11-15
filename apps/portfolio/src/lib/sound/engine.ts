/**
 * The site's sound, made in the browser with Web Audio. No files: every voice is synthesised,
 * so it costs a few kilobytes and every voice shares one small, warm room. Sound plays only on actions,
 * apart from one short swell when landing on the home page.
 * Loaded only once the visitor turns sound on.
 */

export type Voice = 'hover' | 'tap' | 'swish' | 'close' | 'galaxy'

export interface EngineOptions {
  /** Master level, 0 to 1. Each voice is already quiet; this scales them all. */
  readonly volume: number
}

let context: AudioContext | undefined
let master: GainNode
let room: ConvolverNode
let noise: AudioBuffer
let options: EngineOptions = { volume: 0.6 }

/** A short, soft room: stereo noise that dies away, used as the reverb's impulse. */
function makeRoom(audio: AudioContext, seconds: number, decay: number): AudioBuffer {
  const length = Math.round(audio.sampleRate * seconds)
  const buffer = audio.createBuffer(2, length, audio.sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decay
  }
  return buffer
}

function makeNoise(audio: AudioContext): AudioBuffer {
  const buffer = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate)
  const data = buffer.getChannelData(0)
  // Pink-ish: each sample leans on the last, which takes the hiss off white noise.
  let last = 0
  for (let i = 0; i < data.length; i++) {
    last = last * 0.86 + (Math.random() * 2 - 1) * 0.14
    data[i] = last * 3.2
  }
  return buffer
}

function setUp(): AudioContext {
  if (context) return context
  const audio = new AudioContext({ latencyHint: 'interactive' })
  const limiter = audio.createDynamicsCompressor()
  limiter.threshold.value = -18
  limiter.ratio.value = 6
  master = audio.createGain()
  master.gain.value = options.volume
  master.connect(limiter).connect(audio.destination)
  room = audio.createConvolver()
  room.buffer = makeRoom(audio, 1.8, 3)
  room.connect(master)
  noise = makeNoise(audio)
  context = audio
  return audio
}

/** Sends a voice to the speakers, with `wet` of it also sent into the room. */
function route(node: AudioNode, wet: number): void {
  node.connect(master)
  if (wet > 0 && context) {
    const send = context.createGain()
    send.gain.value = wet
    node.connect(send).connect(room)
  }
}

/** A soft-edged envelope: rises in `attack`, falls away over `release`. */
function envelope(gain: GainNode, at: number, peak: number, attack: number, release: number): void {
  gain.gain.setValueAtTime(0.0001, at)
  gain.gain.exponentialRampToValueAtTime(peak, at + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, at + attack + release)
}

function tone(
  frequency: number,
  type: OscillatorType,
  at: number,
  peak: number,
  attack: number,
  release: number,
  wet: number,
  glideTo?: number,
): void {
  if (!context) return
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, at)
  if (glideTo) oscillator.frequency.exponentialRampToValueAtTime(glideTo, at + attack + release * 0.6)
  envelope(gain, at, peak, attack, release)
  oscillator.connect(gain)
  route(gain, wet)
  oscillator.start(at)
  oscillator.stop(at + attack + release + 0.05)
}

function breath(at: number, peak: number, attack: number, release: number, from: number, to: number, wet: number): void {
  if (!context) return
  const source = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const gain = context.createGain()
  source.buffer = noise
  filter.type = 'bandpass'
  filter.Q.value = 0.9
  filter.frequency.setValueAtTime(from, at)
  filter.frequency.exponentialRampToValueAtTime(to, at + attack + release)
  envelope(gain, at, peak, attack, release)
  source.connect(filter).connect(gain)
  route(gain, wet)
  source.start(at, Math.random() * 1.2)
  source.stop(at + attack + release + 0.05)
}

/** `strength` is 0 to 1, used by scroll to follow how fast the page moved. `direction` is 1 down, -1 up. */
export function play(voice: Voice, strength = 1, direction = 1): void {
  if (!context || context.state !== 'running') return
  const now = context.currentTime + 0.005
  switch (voice) {
    case 'hover':
      // A felt tick: barely there, high and short.
      tone(2350, 'sine', now, 0.018, 0.004, 0.05, 0.08, 1900)
      break
    case 'tap':
      // A small wooden tap: a pitched knock with a breath of air on the front.
      tone(540, 'triangle', now, 0.07, 0.003, 0.09, 0.16, 250)
      breath(now, 0.025, 0.002, 0.03, 2600, 1800, 0)
      break
    case 'close':
      tone(420, 'triangle', now, 0.05, 0.003, 0.1, 0.16, 210)
      break
    case 'swish': {
      // A page turning past: air through a slowly opening filter, rising when scrolling down.
      const [from, to] = direction > 0 ? [500, 2200] : [2200, 500]
      breath(now, 0.012 + strength * 0.035, 0.12, 0.32, from, to, 0.3)
      break
    }
    case 'galaxy':
      galaxy(now)
      break
  }
}

/**
 * The galaxy: a short swell for landing on the home page, in tone with the light. A low sub rises,
 * high detuned partials shimmer above it, and a thin air drifts through. About seven seconds, then gone.
 */
function galaxy(at: number): void {
  if (!context) return
  const audio = context
  const swell = audio.createGain()
  swell.gain.setValueAtTime(0.0001, at)
  swell.gain.exponentialRampToValueAtTime(1, at + 1.8)
  swell.gain.setValueAtTime(1, at + 3.6)
  swell.gain.exponentialRampToValueAtTime(0.0001, at + 7)
  route(swell, 0.7)
  const end = at + 7.1

  const voices: (readonly [frequency: number, level: number, type: OscillatorType])[] = [
    [55, 0.03, 'sine'],
    [110.4, 0.012, 'sine'],
    [1318.5, 0.006, 'sine'],
    [1321.8, 0.006, 'sine'],
    [1760, 0.004, 'sine'],
    [1975.5, 0.003, 'triangle'],
  ]
  for (const [frequency, level, type] of voices) {
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.value = level
    oscillator.connect(gain).connect(swell)
    oscillator.start(at)
    oscillator.stop(end)
  }

  // Air: noise through a high band that slowly drifts down, like light moving away.
  const air = audio.createBufferSource()
  const filter = audio.createBiquadFilter()
  const airGain = audio.createGain()
  air.buffer = noise
  air.loop = true
  filter.type = 'bandpass'
  filter.Q.value = 1.4
  filter.frequency.setValueAtTime(5200, at)
  filter.frequency.exponentialRampToValueAtTime(1400, end)
  airGain.gain.value = 0.004
  air.connect(filter).connect(airGain).connect(swell)
  air.start(at)
  air.stop(end)
}

/** Starts or resumes sound. Must run from a click, tap or key press, or the browser keeps it silent. */
export async function start(next: EngineOptions): Promise<void> {
  options = next
  const audio = setUp()
  master.gain.setTargetAtTime(options.volume, audio.currentTime, 0.05)
  if (audio.state !== 'running') await audio.resume()
}

/** Fades everything out, then suspends the audio so it costs nothing. */
export function stop(): void {
  if (!context) return
  const audio = context
  master.gain.setTargetAtTime(0.0001, audio.currentTime, 0.25)
  window.setTimeout(() => void audio.suspend(), 1400)
}

/** Pauses with the tab, so nothing hums in the background. */
export function pause(hidden: boolean): void {
  if (!context) return
  void (hidden ? context.suspend() : context.resume())
}
