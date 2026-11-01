/** The options for how the header and background meet. The control panel and the config both read this. */
export const SCENE_OPTIONS = {
  fit: ["street", "behind"],
  face: ["clear", "fog", "mist"],
  density: ["sparse", "normal", "dense"],
  reach: ["short", "mid", "tall"],
  strength: ["faint", "soft", "clear"],
  contentFade: ["short", "mid", "long"],
  parallax: ["off", "low", "high"],
} as const;
