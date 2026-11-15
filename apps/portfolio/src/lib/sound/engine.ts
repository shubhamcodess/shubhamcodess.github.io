/**
 * The site's sound, made in the browser with Web Audio. No files: every voice is synthesised,
 * so it costs a few kilobytes and is tuned to one key (A, pentatonic) and one small, warm room.
 * Loaded only once the visitor turns sound on.
 */

export type Voice = 'hover' | 'tap' | 'swish' | 'chime' | 'clink' | 'signature' | 'close'

export interface EngineOptions {
  /** Master level, 0 to 1. Each voice is already quiet; this scales them all. */
  readonly volume: number
  /** A very low room tone under everything while sound is on. */
  readonly ambient: boolean
}

/** Notes of the site's key, A major pentatonic, in Hz. */
const scale = [659.25, 739.99, 880, 987.77, 1108.73, 1318.51]
const signature = [220, 329.63, 493.88, 739.99]

let context: AudioContext | undefined
let master: GainNode
let room: ConvolverNode
let noise: AudioBuffer
let ambientStop: (() => void) | undefined
let chimeStep = 0
let options: EngineOptions = { volume: 0.6, ambient: true }

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
    case 'chime': {
      // Two partials of the next note in the key, left to ring in the room.
      const note = scale[chimeStep++ % scale.length] ?? 880
      tone(note, 'sine', now, 0.03, 0.006, 1.1, 0.5)
      tone(note * 2.005, 'sine', now, 0.008, 0.006, 0.6, 0.5)
      break
    }
    case 'clink':
      // Metal on metal, like the badge's clip: inharmonic partials, quick to fade.
      for (const [frequency, level] of [
        [1840, 0.022],
        [2913, 0.014],
        [4157, 0.008],
      ] as const) {
        tone(frequency, 'sine', now, level, 0.002, 0.35, 0.35)
      }
      break
    case 'signature':
      // The site's motif: four notes of an open chord, rolled upward and left to bloom.
      signature.forEach((frequency, index) => {
        const at = now + index * 0.13
        tone(frequency, 'sine', at, 0.026, 0.2, 2.6, 0.6)
        tone(frequency * 2, 'triangle', at, 0.005, 0.2, 1.6, 0.6)
      })
      break
  }
}

/** A room tone: two low, slowly beating sines on A, and air under a breathing filter. Very quiet. */
function startAmbient(): void {
  if (!context || ambientStop) return
  const audio = context
  const bed = audio.createGain()
  bed.gain.setValueAtTime(0.0001, audio.currentTime)
  bed.gain.exponentialRampToValueAtTime(1, audio.currentTime + 4)
  route(bed, 0.4)

  const sources: AudioScheduledSourceNode[] = []
  for (const [frequency, level] of [
    [55, 0.012],
    [82.6, 0.007],
    [110.3, 0.003],
  ] as const) {
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    oscillator.frequency.value = frequency
    gain.gain.value = level
    oscillator.connect(gain).connect(bed)
    sources.push(oscillator)
  }

  const air = audio.createBufferSource()
  const filter = audio.createBiquadFilter()
  const airGain = audio.createGain()
  air.buffer = noise
  air.loop = true
  filter.type = 'lowpass'
  filter.frequency.value = 380
  airGain.gain.value = 0.005
  air.connect(filter).connect(airGain).connect(bed)
  sources.push(air)

  // The filter opens and closes over about twelve seconds, like slow breathing.
  const drift = audio.createOscillator()
  const depth = audio.createGain()
  drift.frequency.value = 0.08
  depth.gain.value = 160
  drift.connect(depth).connect(filter.frequency)
  sources.push(drift)

  for (const source of sources) source.start()
  ambientStop = () => {
    const end = audio.currentTime + 1.2
    bed.gain.cancelScheduledValues(audio.currentTime)
    bed.gain.setValueAtTime(bed.gain.value, audio.currentTime)
    bed.gain.exponentialRampToValueAtTime(0.0001, end)
    for (const source of sources) source.stop(end + 0.05)
    ambientStop = undefined
  }
}

/** Starts or resumes sound. Must run from a click, tap or key press, or the browser keeps it silent. */
export async function start(next: EngineOptions, greet: boolean): Promise<void> {
  options = next
  const audio = setUp()
  master.gain.setTargetAtTime(options.volume, audio.currentTime, 0.05)
  if (audio.state !== 'running') await audio.resume()
  if (options.ambient) startAmbient()
  if (greet) play('signature')
}

/** Fades everything out, then suspends the audio so it costs nothing. */
export function stop(): void {
  if (!context) return
  const audio = context
  ambientStop?.()
  master.gain.setTargetAtTime(0.0001, audio.currentTime, 0.25)
  window.setTimeout(() => void audio.suspend(), 1400)
}

/** Pauses with the tab, so nothing hums in the background. */
export function pause(hidden: boolean): void {
  if (!context) return
  void (hidden ? context.suspend() : context.resume())
}
