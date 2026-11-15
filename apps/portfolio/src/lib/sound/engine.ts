/**
 * The site's sound, made in the browser with Web Audio. No files: every voice is synthesised,
 * so it costs a few kilobytes. There are two voices, a tap for presses and a page-turn for scrolling,
 * sharing one small, warm room. Nothing plays unless the visitor does something.
 * Loaded only once the visitor turns sound on.
 */

export type Voice = 'tap' | 'swish'

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
    case 'tap':
      // A small wooden tap: a pitched knock with a breath of air on the front.
      tone(540, 'triangle', now, 0.07, 0.003, 0.09, 0.16, 250)
      breath(now, 0.025, 0.002, 0.03, 2600, 1800, 0)
      break
    case 'swish': {
      // A page turning past: air through a slowly opening filter, rising when scrolling down.
      const [from, to] = direction > 0 ? [500, 2200] : [2200, 500]
      breath(now, 0.012 + strength * 0.035, 0.12, 0.32, from, to, 0.3)
      break
    }
  }
}

/** Starts or resumes sound. Must run from a click, tap or key press, or the browser keeps it silent. */
export function start(next: EngineOptions): Promise<void> {
  options = next
  const audio = setUp()
  master.gain.cancelScheduledValues(audio.currentTime)
  master.gain.setTargetAtTime(options.volume, audio.currentTime, 0.05)
  // Resumed in the same tick as the gesture, which strict browsers (Safari) require.
  return audio.state === 'running' ? Promise.resolve() : audio.resume()
}

/** Fades everything out, then suspends the audio so it costs nothing. */
export function stop(): void {
  if (!context) return
  const audio = context
  master.gain.setTargetAtTime(0.0001, audio.currentTime, 0.25)
  window.setTimeout(() => {
    if (master.gain.value < 0.01) void audio.suspend()
  }, 1400)
}

/** Pauses with the tab, so nothing hums in the background. */
export function pause(hidden: boolean): void {
  if (!context) return
  void (hidden ? context.suspend() : context.resume())
}
