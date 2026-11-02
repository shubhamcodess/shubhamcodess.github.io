/* The drawing beside each chapter of the story: plain plans, in the same thin ink as the icons. Abstract on purpose, so no client's system can be read from them. */

type Pt = [number, number];
export type Stroke = { pts: Pt[]; fine?: boolean; dashed?: boolean };
export type Note = { at: Pt; text: string };
export type Drawing = { strokes: Stroke[]; notes?: Note[] };

const VIEW = { w: 640, h: 520 };
const iso = (ox: number, oy: number, s: number) => (x: number, y: number, z = 0): Pt => [ox + (x - y) * 0.866 * s, oy + (x + y) * 0.5 * s - z * s];

/** An upright box: its three visible faces' edges, far ones left out. */
function box(at: ReturnType<typeof iso>, x: number, y: number, w: number, d: number, z: number, h: number, extra: Partial<Stroke> = {}): Stroke[] {
  const t = z + h;
  return [
    { pts: [at(x, y, t), at(x + w, y, t), at(x + w, y + d, t), at(x, y + d, t), at(x, y, t)], ...extra },
    { pts: [at(x, y + d, t), at(x, y + d, z), at(x + w, y + d, z), at(x + w, y, z), at(x + w, y, t)], ...extra },
    { pts: [at(x + w, y + d, t), at(x + w, y + d, z)], ...extra },
  ];
}
const onFront = (at: ReturnType<typeof iso>, x: number, y: number, d: number, z: number, fine = true): Stroke => ({ pts: [at(x, y, z), at(x, y + d, z)], fine });

/** A system kept alive: a rack, with the signal running through it and out across the sheet. */
function running(): Drawing {
  const a = iso(250, 120, 42);
  const strokes = box(a, 0, 0, 3, 3, 0, 6.4);
  for (let u = 1; u < 6; u++) strokes.push({ pts: [a(3, 0, u * 1.05), a(3, 3, u * 1.05)], fine: true });
  // The little lights on each unit.
  for (let u = 0; u < 6; u++) strokes.push({ pts: [a(3, 0.3, u * 1.05 + 0.5), a(3, 0.62, u * 1.05 + 0.5)] });
  // The signal.
  const y = 430;
  strokes.push({ pts: [[30, y], [150, y], [172, y - 6], [190, y + 6], [214, y], [262, y], [282, y - 58], [304, y + 40], [322, y - 12], [340, y], [430, y], [452, y - 8], [470, y + 6], [488, y], [610, y]] });
  strokes.push({ pts: [[30, y + 34], [610, y + 34]], fine: true, dashed: true });
  return { strokes };
}

/** An old block replaced by clean layers, with the first one proving the way. */
function building(): Drawing {
  const old = iso(150, 170, 34), fresh = iso(430, 210, 36);
  const strokes = box(old, 0, 0, 3, 3, 0, 5.6, { dashed: true });
  for (let u = 1; u < 5; u++) strokes.push({ pts: [old(3, 0, u * 1.1), old(3, 3, u * 1.1)], fine: true, dashed: true });
  strokes.push({ pts: [[248, 262], [276, 256], [302, 260]] }, { pts: [[290, 249], [304, 260], [290, 272]] });
  for (const [i, z] of [0, 1.9, 3.8].entries()) {
    strokes.push(...box(fresh, 0, 0, 3.6, 3.6, z, 0.75));
    if (i === 2) for (let k = 1; k < 4; k++) strokes.push({ pts: [fresh(k * 0.9, 0.5, z + 0.75), fresh(k * 0.9, 3.1, z + 0.75)], fine: true });
  }
  for (const c of [0, 3.6]) strokes.push({ pts: [fresh(c, 3.6, 0.75), fresh(c, 3.6, 1.9)], fine: true }, { pts: [fresh(c, 3.6, 2.65), fresh(c, 3.6, 3.8)], fine: true });
  return { strokes };
}

/** One framework everything runs on: many sources, one way in. */
function leading(): Drawing {
  const a = iso(320, 200, 40);
  const strokes = box(a, 0, 0, 3, 3, 0, 0.9);
  strokes.push({ pts: [a(0.6, 0.6, 0.9), a(2.4, 0.6, 0.9), a(2.4, 2.4, 0.9), a(0.6, 2.4, 0.9), a(0.6, 0.6, 0.9)], fine: true });
  const around: Pt[] = [[-3.4, -0.4], [-1.6, -3.1], [1.4, -3.4], [4.4, -1.6], [4.6, 1.4], [1.4, 4.6]];
  const near: Pt[] = [[0, 1], [1, 0], [2, 0], [3, 1], [3, 2], [2, 3]];
  around.forEach(([x, y], i) => {
    strokes.push(...box(a, x, y, 1, 1, 0, 0.6));
    const n = near[i] as Pt;
    strokes.push({ pts: [a(x + 0.5, y + 0.5, 0.6), a(n[0], n[1], 0.45)], fine: true, dashed: true });
  });
  return { strokes };
}

/** The whole way through: every layer, and agents working on top. */
function whole(): Drawing {
  const a = iso(290, 190, 38);
  const strokes: Stroke[] = [];
  const levels = [0, 1.75, 3.5, 5.25];
  for (const z of levels) strokes.push(...box(a, 0, 0, 4, 4, z, 0.5));
  for (const c of [[0, 4], [4, 4], [4, 0]] as Pt[]) strokes.push({ pts: [a(c[0], c[1], 0.5), a(c[0], c[1], 5.25)], fine: true, dashed: true });
  // An agent above the stack, reaching down.
  const top = a(2, 2, 7.6);
  const spark = (r: number, s: number): Pt[] => [[top[0], top[1] - r], [top[0] + s, top[1] - s], [top[0] + r, top[1]], [top[0] + s, top[1] + s], [top[0], top[1] + r], [top[0] - s, top[1] + s], [top[0] - r, top[1]], [top[0] - s, top[1] - s], [top[0], top[1] - r]];
  strokes.push({ pts: spark(24, 6) }, { pts: [[top[0], top[1] + 24], a(2, 2, 5.75)], fine: true });
  const notes: Note[] = [];
  const names = ["Deployment", "Schema", "Backend", "Frontend"];
  levels.forEach((z, i) => {
    const from = a(4, 0, z + 0.25);
    strokes.push({ pts: [from, [VIEW.w - 150, from[1]]], fine: true });
    notes.push({ at: [VIEW.w - 142, from[1] + 4], text: names[i] as string });
  });
  strokes.push({ pts: [[top[0] + 28, top[1]], [VIEW.w - 150, top[1]]], fine: true });
  notes.push({ at: [VIEW.w - 142, top[1] + 4], text: "AI agents" });
  return { strokes, notes };
}

export const STORY_DRAWINGS = { running, building, leading, whole } as const;
export type StoryDrawingName = keyof typeof STORY_DRAWINGS;
export const STORY_VIEW = VIEW;
