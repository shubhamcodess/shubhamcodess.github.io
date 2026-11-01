/* Hand-sketched icons: straight plans, wobbled and drawn twice, like a pen going over a line. Worked out at build time. */
const ICONS = {
  arrow: [[[3, 12.3], [9, 11.8], [15, 12.1], [20.5, 12]], [[14.5, 6], [20.8, 12], [14.8, 18.2]]],
  back: [[[21, 12.3], [15, 11.8], [9, 12.1], [3.5, 12]], [[9.5, 6], [3.2, 12], [9.2, 18.2]]],
  download: [[[12, 3], [12.1, 9], [11.9, 15.4]], [[6.5, 10.4], [12, 15.8], [17.5, 10.2]], [[3.5, 15.5], [3.8, 20.4], [12, 20.6], [20.4, 20.3], [20.5, 15.4]]],
  code: [[[8, 5.5], [2.8, 12], [8, 18.5]], [[16, 5.5], [21.2, 12], [16, 18.5]], [[13.8, 3.8], [10.2, 20.2]]],
  play: [[[6, 3.6], [6.2, 12], [5.9, 20.6], [13, 16.4], [20.6, 12], [13, 7.8], [6, 3.6]]],
  mail: [[[2.8, 5.8], [12, 5.5], [21.2, 5.8], [21, 12], [21.3, 18.4], [12, 18.6], [2.9, 18.3], [3, 12], [2.8, 5.8]], [[3, 6.2], [12, 13], [21, 6.2]]],
  link: [[[9.5, 5], [4, 5.2], [4.2, 12], [4, 20], [12, 19.8], [19.2, 20], [19, 14.5]], [[13, 11], [20.5, 3.5]], [[14.5, 3.4], [20.6, 3.4], [20.6, 9.5]]],
  rss: [[[4, 11], [9, 11.6], [13, 15.4], [13.6, 20.4]], [[4, 4.4], [12, 5.2], [19, 12], [20, 20.4]], [[4.6, 18.4], [6.4, 18.6], [6.4, 20.2], [4.6, 20.2], [4.6, 18.4]]],
} satisfies Record<string, number[][][]>;

export type IconName = keyof typeof ICONS;

const seeded = (start: number) => () => {
  let a = (start = (start + 0x6d2b79f5) | 0);
  a = Math.imul(a ^ (a >>> 15), 1 | a);
  a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
};

function sketch(points: number[][], seed: number, amp: number): string {
  const r = seeded(seed), pts: [number, number][] = [];
  const jitter = () => (r() - 0.5) * amp;
  for (let i = 0; i + 1 < points.length; i++) {
    const [ax, ay] = points[i] as [number, number], [bx, by] = points[i + 1] as [number, number];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / 4));
    for (let k = 0; k < n; k++) pts.push([ax + ((bx - ax) * k) / n + jitter(), ay + ((by - ay) * k) / n + jitter()]);
  }
  const [ex, ey] = points[points.length - 1] as [number, number];
  pts.push([ex + jitter(), ey + jitter()]);
  const f = (v: number) => v.toFixed(2), at = (i: number) => pts[Math.max(0, Math.min(pts.length - 1, i))] as [number, number];
  let d = `M${f(at(0)[0])} ${f(at(0)[1])}`;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)], k = 0.16;
    d += ` C${f(p1[0] + (p2[0] - p0[0]) * k)} ${f(p1[1] + (p2[1] - p0[1]) * k)} ${f(p2[0] - (p3[0] - p1[0]) * k)} ${f(p2[1] - (p3[1] - p1[1]) * k)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/** Each stroke of the icon as a main pen line and a fainter second pass. */
export const iconStrokes = (name: IconName, seed: number) =>
  (ICONS[name] as number[][][]).map((plan, i) => ({ main: sketch(plan, seed + i * 7, 0.62), second: sketch(plan, seed + i * 13 + 91, 0.95) }));
