/* Where everything in the story stands at a given point of the scroll. A function of the scroll alone, so scrolling back plays it in reverse and a test can freeze any moment. */

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => t * t * (3 - 2 * t);

const ENTER = 0.3, LEAVE = 0.8; // The parts of its slot a scene spends arriving and leaving. Between them it holds, to be read.

export type SceneLook = { opacity: number; blur: number; y: number; scale: number; drift: number };

/** One scene's look. `progress` is 0 to 1 through the whole story. It comes out of the haze from a little further off, holds, and leaves past the camera, and a slow camera push runs through all of it so it's never quite still. The first scene is already there and the last one never leaves. */
export function sceneLook(progress: number, index: number, count: number): SceneLook {
  const t = progress * count - index;
  const arrived = index === 0 ? 1 : ease(clamp(t / ENTER));
  const going = clamp((t - LEAVE) / (1 - LEAVE)), left = index === count - 1 ? 0 : 1 - (1 - going) ** 3; // Leaves easing out: quick to start, soft to settle.
  const through = clamp(index === 0 ? 0.35 + t * 0.65 : t);
  return {
    opacity: arrived * (1 - left),
    blur: (1 - arrived) * 16 + left * 13,
    y: (1 - arrived) * 26 - left * 26,
    scale: 1.006 - through * 0.012 - (1 - arrived) * 0.035 + left * 0.035, // Comes in from slightly further away and leaves past the camera.
    drift: clamp(t) - 0.5, // Slides the title's shadow against its words, for depth.
  };
}

export type FrameLook = { opacity: number; blur: number; y: number; scale: number };

/** The whole frame coming out of the haze as the section arrives, and going back as it leaves. `top` and `bottom` are the section's edges on a screen `height` tall. */
export function frameLook(top: number, bottom: number, height: number): FrameLook {
  const come = ease(clamp(1 - top / (height * 0.75))), go = ease(clamp((height * 0.9 - bottom) / (height * 0.5)));
  return { opacity: come * (1 - go), blur: (1 - come) * 18 + go * 14, y: (1 - come) * 34, scale: 1.03 - come * 0.03 };
}

const PAN_END = 0.65;
/** How far a card taller than its sheet has slid up to show the rest, 0 to 1: it reads from the top once it has arrived, and reaches the bottom before it leaves. */
export function scenePan(progress: number, index: number, count: number) {
  const t = progress * count - index;
  const from = index === 0 ? 0.05 : ENTER + 0.05, to = index === 0 ? 0.6 : PAN_END;
  return ease(clamp((t - from) / (to - from)));
}

/** The most scrolling one card can slide through without moving faster than the finger. */
export const panRoom = (filmPerScene: number) => filmPerScene * (PAN_END - ENTER - 0.05);

/** How far through its slot a card has to be for `needed` px of its slide to have happened: when its figure comes into view. */
export function figureInView(needed: number, spare: number, index: number, count: number) {
  if (needed <= 0 || spare <= 0) return null;
  for (let t = 0; t <= 1; t += 0.01) if (spare * scenePan((index + t) / count, index, count) >= needed) return t;
  return PAN_END;
}

const LOOP_DRAW = 8, LOOP_HOLD = 6, LOOP_REWIND = 1.6;
/** A figure playing by itself instead of with the scroll, 0 to 1: it draws, holds to be looked at, and quickly rewinds, so the loop closes on itself. */
export function figureLoop(seconds: number) {
  const t = seconds % (LOOP_DRAW + LOOP_HOLD + LOOP_REWIND);
  if (t < LOOP_DRAW) return t / LOOP_DRAW;
  return t < LOOP_DRAW + LOOP_HOLD ? 1 : 1 - (t - LOOP_DRAW - LOOP_HOLD) / LOOP_REWIND;
}

/** How far the line has drawn. It reaches each stop as that scene starts to arrive, so a chapter plays out along its own stretch of the line. */
export const lineProgress = (progress: number, count: number) => (count < 2 ? 1 : clamp((progress * count) / (count - 1)));

/** How present the figure at the end of the line is: only once the story has got there. */
export const figurePresence = (progress: number, count: number) => ease(clamp((progress * count - (count - 1)) / ENTER));

/** Where to scroll to, 0 to 1, for a scene: the moment it's fully arrived, so its figure plays from the start as you scroll on. */
export const sceneTarget = (index: number, count: number) => (index === 0 ? 0 : (index + ENTER) / count);

/** Which scene is the one being read: it takes over halfway through arriving. */
export const currentScene = (progress: number, count: number) => Math.max(0, Math.min(count - 1, Math.floor(progress * count - ENTER / 2)));
