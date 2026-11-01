/**
 * The daylight themes. This list is the only place a palette is defined:
 * adding an entry here puts it in the CSS, the config options, the rotation and the contrast tests.
 * Use the blueprint-palette skill to add or adjust one. The order here is the rotation order.
 */
export type Palette = {
  story: string;
  /** The page gradient, lightest first. Text has to stay readable on all four. */
  sky: readonly [string, string, string, string];
  glow: string;
  paper: string;
  ink: string;
  inkSoft: string;
  line: string;
  lineRest: string;
  accent: string;
  grid: string;
  /** Film grain strength, 0 to 1. */
  grain: number;
};

export const palettes = {
  dust: {
    story: "Midday. Hazy sun fading into smoke.",
    sky: ["#ebdfc8", "#dfd0b9", "#d0c0ae", "#c6b6a8"],
    glow: "rgba(250,214,148,.5)",
    paper: "#efe6d4",
    ink: "#221b17",
    inkSoft: "#544539",
    line: "#43352b",
    lineRest: "rgba(67,53,43,.68)",
    accent: "#9c4a1b",
    grid: "rgba(67,53,43,.08)",
    grain: 0.42,
  },
  sodium: {
    story: "Low sun. A softened orange haze.",
    sky: ["#f2dcbd", "#e9caa8", "#ddb697", "#cda489"],
    glow: "rgba(252,214,154,.62)",
    paper: "#f5e6ce",
    ink: "#1f1410",
    inkSoft: "#4c3227",
    line: "#42281c",
    lineRest: "rgba(66,40,28,.7)",
    accent: "#873813",
    grid: "rgba(66,40,28,.085)",
    grain: 0.42,
  },
  smog: {
    story: "Hazy morning. Overcast grey with a little blue settling low.",
    sky: ["#dddcd5", "#cfd1ce", "#bfc4c6", "#aeb6bb"],
    glow: "rgba(238,236,222,.5)",
    paper: "#e5e5e0",
    ink: "#14181b",
    inkSoft: "#3a4347",
    line: "#2a3338",
    lineRest: "rgba(42,51,56,.7)",
    accent: "#7a4a10",
    grid: "rgba(42,51,56,.085)",
    grain: 0.42,
  },
  storm: {
    story: "Weather rolling in. Mauve cloud with a trace of yellow sun.",
    sky: ["#e8ded6", "#dbcec8", "#cbbcb8", "#bbaaaa"],
    glow: "rgba(252,215,148,.34)",
    paper: "#efe7e0",
    ink: "#201a1d",
    inkSoft: "#483b42",
    line: "#3d3138",
    lineRest: "rgba(61,49,56,.7)",
    accent: "#8f3a1f",
    grid: "rgba(61,49,56,.085)",
    grain: 0.42,
  },
  oldGotham: {
    story: "Morning over the old city. A low cream sun, cooling to slate where the haze settles.",
    sky: ["#efe9d6", "#d9d6c6", "#c6c9c3", "#b4bcbf"],
    glow: "rgba(252,226,170,.72)",
    paper: "#f2eddf",
    ink: "#131c1f",
    inkSoft: "#37403f",
    line: "#22292b",
    lineRest: "rgba(34,41,43,.7)",
    accent: "#8a4a22",
    grid: "rgba(34,41,43,.085)",
    grain: 0.42,
  },
} as const satisfies Record<string, Palette>;

export type PaletteId = keyof typeof palettes;
export const PALETTE_IDS = Object.keys(palettes) as [PaletteId, ...PaletteId[]];

/** One CSS rule per palette, written into the page at build time. */
export const paletteCss = (): string =>
  PALETTE_IDS.map((id) => {
    const p: Palette = palettes[id];
    const tokens = {
      "sky-0": p.sky[0], "sky-1": p.sky[1], "sky-2": p.sky[2], "sky-3": p.sky[3],
      base: p.sky[1], glow: p.glow, paper: p.paper, ink: p.ink, "ink-2": p.inkSoft,
      line: p.line, "line-rest": p.lineRest, accent: p.accent, grid: p.grid, grain: p.grain,
    };
    const body = Object.entries(tokens).map(([name, value]) => `--${name}:${value}`).join(";");
    return `[data-theme="light"][data-palette="${id}"]{${body}}`;
  }).join("\n");
