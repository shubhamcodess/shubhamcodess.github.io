/* Where every scene of the story stands at a given point of the scroll. A function of the scroll alone, so scrolling back plays it in reverse and a test can freeze any moment. */

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const ease = (t: number) => t * t * (3 - 2 * t);

const ENTER = 0.3, LEAVE = 0.72; // The parts of its slot a scene spends arriving and leaving. Between them it holds, to be read.
const INK = 0.62; // The part of its slot a scene's drawing takes to draw.

export type SceneLook = { opacity: number; blur: number; y: number; scale: number; drift: number; ink: number };

/** One scene's look. `progress` is 0 to 1 through the whole story. `approach` is 0 to 1 as the section comes up the screen, which is when the first scene draws. The first scene is already there and the last one never leaves. */
export function sceneLook(progress: number, index: number, count: number, approach = 1): SceneLook {
  const t = progress * count - index;
  const arrived = index === 0 ? 1 : ease(clamp(t / ENTER));
  const left = index === count - 1 ? 0 : ease(clamp((t - LEAVE) / (1 - LEAVE)));
  const opacity = arrived * (1 - left);
  return {
    opacity,
    blur: (1 - arrived) * 14 + left * 10, // Out of the haze and back into it, as the hero does.
    y: (1 - arrived) * 34 - left * 34,
    scale: 1.045 - arrived * 0.045 - left * 0.025, // A slow camera push through each scene.
    drift: clamp(t) - 0.5, // Slides the wireframe shadow against the words, for depth.
    ink: index === 0 ? ease(clamp(approach)) : clamp(t / INK),
  };
}

/** How far the line has drawn. It reaches each batarang just as that scene arrives. */
export const lineProgress = (progress: number, count: number) => (count < 2 ? 1 : clamp((progress * count - ENTER) / (count - 1)));

/** How present the figure at the end of the line is: only once the story has got there. */
export const figurePresence = (progress: number, count: number) => ease(clamp((progress * count - (count - 1)) / ENTER));

/** Where to scroll to, 0 to 1, to read a scene: the middle of its hold. */
export const sceneTarget = (index: number, count: number) => (index === 0 ? 0 : index === count - 1 ? 1 : (index + (ENTER + LEAVE) / 2) / count);

/** Which scene is the one being read: it takes over halfway through arriving. */
export const currentScene = (progress: number, count: number) => Math.max(0, Math.min(count - 1, Math.floor(progress * count - ENTER / 2)));
