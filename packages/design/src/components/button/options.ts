/** Every way a Button can vary. The component's types, the config and the control panel all read this list. */
export const BUTTON_OPTIONS = {
  variant: ["primary", "secondary", "quiet"],
  size: ["sm", "md", "lg"],
  texture: ["hatch", "dots", "grid", "fade"],
  shadow: ["br", "bl", "tr", "tl"],
  hover: ["none", "shadow"],
  press: ["warp", "keycap", "drop", "none"],
  sway: ["off", "soft", "softer"],
  face: ["clear", "frost"],
  /** How the sketched icon responds to hover: redraws only the faint second pen line, or traces the whole icon more visibly. */
  iconHover: ["none", "redraw", "trace"],
  /** How the label responds to hover, on and off: a quick settling glitch, or a soft grow and shrink. */
  textHover: ["none", "glitch", "grow"],
} as const;

type Options = typeof BUTTON_OPTIONS;
export type ButtonStyle = { [K in keyof Options]: Options[K][number] };
