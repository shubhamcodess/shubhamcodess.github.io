/** The options for the header logo. The schema and the component both read this. */
export const LOGO_OPTIONS = {
  /** How SP is set: the site's own font, or drafting lettering built from strokes and arcs of one radius. */
  lettering: ["geist", "drafted"],
  /**
   * The batarang's finish. All but `outline` are a solid plate: a side for its thickness, the face, a pale bevel and a thin edge.
   * suit: the figure's mid grey. rust: the theme's accent. cowl: the figure's dark grey. steel: suit grey with a rust edge.
   * outline: the earlier line drawing, faintly hatched inside.
   */
  blade: ["suit", "rust", "cowl", "steel", "outline"],
} as const;
