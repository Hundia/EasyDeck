import type { StorySchema } from "@/lib/schemas/story";
import type { TransitionMode } from "@/lib/schemas/transition";

/**
 * Resolves the effective transition mode for a story.
 * If ALL scenes unanimously override the mode, use that.
 * Otherwise fallback to story-level transition.mode.
 */
export function resolveTransitionMode(story: StorySchema): TransitionMode {
  const storyMode = story.transition.mode;
  const sceneOverrides = story.scenes
    .map((scene) => scene.transition?.mode)
    .filter((mode): mode is TransitionMode => mode !== undefined);

  if (sceneOverrides.length === story.scenes.length) {
    const allSame = sceneOverrides.every((mode) => mode === sceneOverrides[0]);
    if (allSame) {
      return sceneOverrides[0];
    }
  }

  return storyMode;
}
