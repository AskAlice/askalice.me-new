/** easeOutCubic on [0, 1]. */
export function easeOutCubic(t: number): number {
  const c = Math.min(1, Math.max(0, t))
  return 1 - (1 - c) ** 3
}

/**
 * Value shown by a count-up animation at normalised time `t` (0 → start,
 * 1 → done). Integers only, never overshoots `target`, clamps `t`.
 */
export function countAt(target: number, t: number): number {
  return Math.min(target, Math.round(target * easeOutCubic(t)))
}
