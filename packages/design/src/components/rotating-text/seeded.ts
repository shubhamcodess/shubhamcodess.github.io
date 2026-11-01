/** A repeatable series of waits between `min` and `max` ms: the same seed always gives the same rhythm, irregular but never jumpy. */
export function seededWaits(seed: number, min: number, max: number) {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let a = Math.imul(state ^ (state >>> 15), 1 | state);
    a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
    return Math.round(min + (((a ^ (a >>> 14)) >>> 0) / 4294967296) * (max - min));
  };
}
