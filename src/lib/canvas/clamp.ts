/**
 * Clamps a frame value to valid range [0, frameCount - 1].
 * Returns 0 if frameCount is 0.
 */
export function clampFrame(frame: number, frameCount: number): number {
  if (frameCount <= 0) return 0;
  return Math.max(0, Math.min(frameCount - 1, Math.round(frame)));
}
