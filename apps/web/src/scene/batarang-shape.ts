/* The one batarang shape, traced from the user's reference. Half-width 1, centred, drawn edge by edge so the tips stay sharp. */
type Point = number[];

const curve = (a: Point, c: Point, b: Point, steps = 7) =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps, u = 1 - t;
    return [u * u * a[0]! + 2 * u * t * c[0]! + t * t * b[0]!, u * u * a[1]! + 2 * u * t * c[1]! + t * t * b[1]!];
  });

const RIGHT: Point[][] = [
  [[0, -0.11], [0.035, -0.11]], // head
  [[0.035, -0.11], [0.07, -0.2]], // inside of the ear
  [[0.07, -0.2], [0.1, -0.05]], // outside of the ear
  curve([0.1, -0.05], [0.25, 0.01], [0.36, -0.21]), // the bite out of the top
  [[0.36, -0.21], [1, -0.22]], // top of the wing
  curve([1, -0.22], [0.84, -0.04], [0.74, 0.17]), // under the wing tip
  curve([0.74, 0.17], [0.29, -0.01], [0, 0.49]), // down to the point
];

/** Every edge of the shape, as lines of points. */
export const BATARANG_EDGES: Point[][] = [...RIGHT, ...RIGHT.map((edge) => edge.map(([x, y]) => [-x!, y!]))];

const right = RIGHT.flat(), left = [...right].reverse().map(([x, y]) => [-x!, y!]);
/** The whole outline, once round. */
export const BATARANG_OUTLINE: Point[] = [...right, ...left];

/** How it sits once lodged: its slight tilt, then its angle in degrees. The logo and the site icons share this. */
export const BLADE_TILT = [1, -0.03, -0.1, 0.9] as const;
export const BLADE_ANGLE = -44;
