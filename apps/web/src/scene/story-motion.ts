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

/** How far the line has drawn. It reaches each stop as that scene starts to arrive, so a chapter plays out along its own stretch of the line. */
export const lineProgress = (progress: number, count: number) => (count < 2 ? 1 : clamp((progress * count) / (count - 1)));

/** How present the figure at the end of the line is: only once the story has got there. */
export const figurePresence = (progress: number, count: number) => ease(clamp((progress * count - (count - 1)) / ENTER));

/** Where to scroll to, 0 to 1, to read a scene: the middle of its hold. */
export const sceneTarget = (index: number, count: number) => (index === 0 ? 0 : index === count - 1 ? 1 : (index + (ENTER + LEAVE) / 2) / count);

/** Which scene is the one being read: it takes over halfway through arriving. */
export const currentScene = (progress: number, count: number) => Math.max(0, Math.min(count - 1, Math.floor(progress * count - ENTER / 2)));
