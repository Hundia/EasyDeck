import { StorySchema } from "@/lib/schemas/story";
import type { StorySchema as StorySchemaType } from "@/lib/schemas/story";
import type { NarrativeOutput } from "./narrativeDesigner";

export interface ComposerLog {
  adjustments: string[];
}

export function composeStory(narrative: NarrativeOutput): {
  story: StorySchemaType;
  log: ComposerLog;
} {
  const log: ComposerLog = { adjustments: [] };
  const scenes = [...narrative.scenes];

  if (narrative.mode === "section") {
    for (let index = 1; index < scenes.length; index++) {
      if (scenes[index].startFrame !== scenes[index - 1].endFrame) {
        const expected = scenes[index - 1].endFrame;
        const diff = scenes[index].startFrame - expected;
        log.adjustments.push(
          `Adjusted scene "${scenes[index].label}" startFrame from ${scenes[index].startFrame} to ${expected} (diff: ${diff})`,
        );
        const duration = scenes[index].endFrame - scenes[index].startFrame;
        scenes[index] = {
          ...scenes[index],
          startFrame: expected,
          endFrame: expected + duration,
        };
      }
    }
  }

  for (const scene of scenes) {
    for (const overlay of scene.overlays) {
      if (overlay.enterAt >= overlay.exitAt) {
        throw new Error(
          `Invalid overlay timing in scene "${scene.label}": enterAt (${overlay.enterAt}) must be < exitAt (${overlay.exitAt})`,
        );
      }
    }
  }

  const storyData = {
    meta: { title: narrative.title, slug: narrative.slug },
    transition: { mode: narrative.mode },
    scenes: scenes.map((scene) => ({
      id: scene.id,
      label: scene.label,
      startFrame: scene.startFrame,
      endFrame: scene.endFrame,
      imageSequence: {
        pattern: narrative.imagePattern,
        frameCount: scene.endFrame - scene.startFrame,
      },
      overlays: scene.overlays.map((overlay) => ({
        id: overlay.id,
        type: overlay.type,
        content: overlay.content,
        enterAt: overlay.enterAt,
        exitAt: overlay.exitAt,
        position: overlay.position,
      })),
    })),
  };

  const parsed = StorySchema.parse(storyData);
  return { story: parsed, log };
}
