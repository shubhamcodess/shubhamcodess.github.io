/**
 * The site's sound, made in the browser with Web Audio. No files: every voice is synthesised,
 * so it costs a few kilobytes. There are four voices: a tap for presses, a page-turn for scrolling, and a leaf
 * and a cover for the About book's pages and boards,
 * sharing one small, warm room. Nothing plays unless the visitor does something.
 * Loaded only once the visitor turns sound on.
 */

export type Voice = 'tap' | 'swish' | 'leaf' | 'cover'

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

/** Dry paper: grainy noise through a moving band, its level fluttering like fibres catching. */
function paper(at: number, peak: number, attack: number, release: number, from: number, to: number): void {
  if (!context) return
  const source = context.createBufferSource()
  const band = context.createBiquadFilter()
  const body = context.createGain()
  const flutter = context.createOscillator()
  const flutterDepth = context.createGain()
  const grain = context.createGain()
  source.buffer = noise
  band.type = 'bandpass'
  band.Q.value = 0.7
  band.frequency.setValueAtTime(from, at)
  band.frequency.exponentialRampToValueAtTime(to, at + attack + release)
  flutter.type = 'triangle'
  flutter.frequency.value = 19 + Math.random() * 8
  flutterDepth.gain.value = 0.35
  grain.gain.value = 0.65
  flutter.connect(flutterDepth).connect(grain.gain)
  envelope(body, at, peak, attack, release)
  source.connect(band).connect(grain).connect(body)
  route(body, 0.18)
  const end = at + attack + release + 0.05
  source.start(at, Math.random() * 1.2)
  flutter.start(at)
  source.stop(end)
  flutter.stop(end)
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
      // Paper sliding under the hand: a dry, grainy hiss that flutters, rising when scrolling down.
      const [from, to] = direction > 0 ? [1300, 3400] : [3400, 1300]
      paper(now, 0.01 + strength * 0.03, 0.1, 0.34, from, to)
      break
    }
    case 'leaf':
      // A page turning over: the lift (a quick rising rustle), the sweep through the air, and the soft landing.
      paper(now, 0.018 + strength * 0.02, 0.03, 0.16, 2200, 4200)
      paper(now + 0.12, 0.03 + strength * 0.03, 0.12, 0.3, 3600 * (direction > 0 ? 1 : 0.85), 1100)
      breath(now + 0.42, 0.03, 0.004, 0.09, 900, 500, 0.12)
      break
    case 'cover':
      // The hard board: a stiff creak of the hinge, then a low, padded thump as it lands.
      paper(now, 0.02, 0.05, 0.22, 1400, 2600)
      tone(120, 'sine', now + 0.36, 0.09, 0.004, 0.22, 0.2, 70)
      breath(now + 0.36, 0.05, 0.003, 0.12, 700, 300, 0.2)
      break
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
