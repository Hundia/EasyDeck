import { ContentBrief } from "./schemas";
import { designNarrative } from "./narrativeDesigner";
import { composeStory, type ComposerLog } from "./sceneComposer";
import type { StorySchema as StorySchemaType } from "@/lib/schemas/story";

export interface PipelineResult {
  story: StorySchemaType;
  log: ComposerLog;
}

export function createPresentation(input: unknown): PipelineResult {
  const briefResult = ContentBrief.safeParse(input);
  if (!briefResult.success) {
    throw new Error(`Pipeline error [ContentBrief validation]: ${briefResult.error.message}`);
  }

  const brief = briefResult.data;
  const narrative = designNarrative(brief);

  try {
    const { story, log } = composeStory(narrative);
    return { story, log };
  } catch (error) {
    throw new Error(`Pipeline error [SceneComposer]: ${error instanceof Error ? error.message : String(error)}`);
  }
}
