import type { TransitionConfig } from "@/lib/schemas/transition";

export interface SnapConfig {
  snapTo: "labelsDirectional";
  duration: { min: number; max: number };
  delay: number;
  ease: string;
  directional: boolean;
  inertia: boolean;
}

/**
 * Builds ScrollTrigger snap configuration from TransitionConfig.
 * Returns undefined if reduced motion is active (disables snapping).
 */
export function buildSnapConfig(
  transition: TransitionConfig,
  reducedMotion = false,
): SnapConfig | undefined {
  if (reducedMotion) return undefined;

  return {
    snapTo: "labelsDirectional",
    duration: { min: transition.snapDurationMin, max: transition.snapDurationMax },
    delay: transition.snapDelay,
    ease: transition.ease,
    directional: transition.directional,
    inertia: transition.inertia,
  };
}

/**
 * Calculates the playhead frame for a given timeline progress and scene array.
 * Progress is 0-1 across the entire timeline.
 */
export function progressToFrame(
  progress: number,
  scenes: Array<{ startFrame: number; endFrame: number }>,
): number {
  const totalScenes = scenes.length;
  if (totalScenes === 0) return 0;

  const sceneProgress = progress * totalScenes;
  const sceneIndex = Math.min(totalScenes - 1, Math.floor(sceneProgress));
  const withinScene = sceneProgress - sceneIndex;

  const scene = scenes[sceneIndex];
  return scene.startFrame + (scene.endFrame - scene.startFrame) * withinScene;
}
