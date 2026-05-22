export function computeNextIndex(
  currentIndex: number,
  targetIndex: number,
  sceneCount: number,
  wrapEnabled: boolean,
): number {
  if (wrapEnabled) {
    return ((targetIndex % sceneCount) + sceneCount) % sceneCount;
  }
  return Math.max(0, Math.min(targetIndex, sceneCount - 1));
}
