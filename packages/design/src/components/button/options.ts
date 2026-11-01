/** Every way a Button can vary. The component's types, the config and the control panel all read this list. */
export const BUTTON_OPTIONS = {
  variant: ["primary", "secondary", "quiet"],
  size: ["sm", "md", "lg"],
  texture: ["hatch", "dots", "grid", "fade"],
  shadow: ["br", "bl", "tr", "tl"],
  hover: ["keycap", "shadow", "none"],
  press: ["warp", "drop", "none"],
  sway: ["off", "soft", "softer"],
  face: ["clear", "frost"],
} as const;

type Options = typeof BUTTON_OPTIONS;
export type ButtonStyle = { [K in keyof Options]: Options[K][number] };
