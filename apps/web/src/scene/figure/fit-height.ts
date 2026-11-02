/** How tall the figure can be in the room above its line, leaving `clearance`, within the limits. No room given means it's free to take the largest size. */
export function fitHeight(room: number | undefined, limits: { min: number; max: number; clearance: number }): number {
  return Math.round(Math.min(limits.max, Math.max(limits.min, room === undefined ? limits.max : room - limits.clearance)));
}
