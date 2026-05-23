import { ContentBrief } from "./schemas";
import { designNarrative } from "./narrativeDesigner";
import { composeStory, type ComposerLog } from "./sceneComposer";
import type { StorySchema as StorySchemaType } from "@/lib/schemas/story";
import type { AIConfig } from "@/lib/ai/config";
import { AIEnhancer } from "@/lib/ai/enhancer";
import { createProviderWithFallback } from "@/lib/ai/withFallback";
import { registry } from "@/lib/ai/providers";

export interface PipelineResult {
  story: StorySchemaType;
  log: ComposerLog;
  aiEnhancements?: string[];
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

export async function createEnhancedPresentation(
  input: unknown,
  aiConfig?: AIConfig,
): Promise<PipelineResult> {
  const briefResult = ContentBrief.safeParse(input);
  if (!briefResult.success) {
    throw new Error(`Pipeline error [ContentBrief validation]: ${briefResult.error.message}`);
  }

  const brief = briefResult.data;
  let narrative = designNarrative(brief);
  let aiEnhancements: string[] | undefined;

  if (aiConfig?.enabled) {
    try {
      const provider = createProviderWithFallback(
        registry.getProvider(aiConfig.provider),
        aiConfig.fallback ? registry.getProvider(aiConfig.fallback) : undefined,
      );
      const enhancer = new AIEnhancer(provider, aiConfig.enhancement);
      const result = await enhancer.enhance(narrative);
      narrative = result.narrative;
      if (result.enhanced) {
        aiEnhancements = result.enhancements;
      }
    } catch {
      aiEnhancements = ["AI enhancement unavailable, using deterministic mode"];
    }
  }

  try {
    const { story, log } = composeStory(narrative);
    return { story, log, aiEnhancements };
  } catch (error) {
    throw new Error(`Pipeline error [SceneComposer]: ${error instanceof Error ? error.message : String(error)}`);
  }
}
