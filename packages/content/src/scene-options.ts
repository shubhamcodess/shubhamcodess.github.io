/** The options for the Gotham scene and how the page meets it. The control panel and the config both read this. */
export const SCENE_OPTIONS = {
  face: ["clear", "fog", "mist"],
  contentFade: ["short", "mid", "long"],
  depth: ["off", "low", "full", "big"],
  sway: ["off", "low", "full", "big"],
  haze: ["low", "full", "thick"],
  dust: ["off", "low", "full", "big"],
  density: ["sparse", "normal", "dense"],
  reach: ["short", "mid", "tall"],
  word: ["off", "faint", "soft"],
} as const;
