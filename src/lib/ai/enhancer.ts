import type { LLMProvider, Message } from "./types";
import type { AIConfig } from "./config";
import type { NarrativeOutput } from "../pipeline/narrativeDesigner";

export interface EnhancementResult {
  narrative: NarrativeOutput;
  enhanced: boolean;
  enhancements: string[];
}

/**
 * AI Enhancer — optional pipeline stage that enriches narratives via LLM.
 * If provider is unavailable or errors, returns original narrative unchanged.
 */
export class AIEnhancer {
  constructor(
    private readonly provider: LLMProvider,
    private readonly config: AIConfig["enhancement"],
  ) {}

  async enhance(narrative: NarrativeOutput): Promise<EnhancementResult> {
    const enhancements: string[] = [];
    let enhanced: NarrativeOutput = {
      ...narrative,
      scenes: narrative.scenes.map((scene) => ({
        ...scene,
        overlays: scene.overlays.map((overlay) => ({ ...overlay })),
      })),
    };

    try {
      if (this.config.enrichDescriptions) {
        enhanced = await this.enrichDescriptions(enhanced);
        enhancements.push("enriched scene descriptions");
      }

      if (this.config.generateRationale) {
        enhanced = await this.enrichRationale(enhanced);
        enhancements.push("generated transition rationale");
      }

      if (this.config.suggestTiming) {
        enhanced = await this.suggestTiming(enhanced);
        enhancements.push("suggested timing adjustments");
      }

      return {
        narrative: enhanced,
        enhanced: enhancements.length > 0,
        enhancements,
      };
    } catch {
      return {
        narrative,
        enhanced: false,
        enhancements: ["enhancement failed, using original"],
      };
    }
  }

  private async enrichDescriptions(
    narrative: NarrativeOutput,
  ): Promise<NarrativeOutput> {
    const prompt = this.buildDescriptionPrompt(narrative);
    const result = await this.provider.generate({
      messages: prompt,
      temperature: 0.7,
      maxTokens: 1024,
    });

    try {
      const enriched = JSON.parse(result.content) as Array<{
        sceneId: string;
        overlayText: string;
      }>;
      const scenes = narrative.scenes.map((scene) => {
        const match = enriched.find((entry) => entry.sceneId === scene.id);
        if (match && scene.overlays.length > 0) {
          return {
            ...scene,
            overlays: scene.overlays.map((overlay, index) =>
              index === 0 ? { ...overlay, content: match.overlayText } : overlay,
            ),
          };
        }
        return scene;
      });
      return { ...narrative, scenes };
    } catch {
      return narrative;
    }
  }

  private async enrichRationale(narrative: NarrativeOutput): Promise<NarrativeOutput> {
    const prompt = this.buildRationalePrompt(narrative);
    const result = await this.provider.generate({
      messages: prompt,
      temperature: 0.5,
      maxTokens: 512,
    });

    try {
      const rationales = JSON.parse(result.content) as Array<{
        sceneId: string;
        rationale: string;
      }>;
      const scenes = narrative.scenes.map((scene) => {
        const match = rationales.find((entry) => entry.sceneId === scene.id);
        return match ? { ...scene, transitionRationale: match.rationale } : scene;
      });
      return { ...narrative, scenes };
    } catch {
      return narrative;
    }
  }

  private async suggestTiming(narrative: NarrativeOutput): Promise<NarrativeOutput> {
    const prompt = this.buildTimingPrompt(narrative);
    const result = await this.provider.generate({
      messages: prompt,
      temperature: 0.3,
      maxTokens: 512,
    });

    try {
      const suggestions = JSON.parse(result.content) as Array<{
        sceneId: string;
        suggestedDuration: number;
      }>;
      const scenes = narrative.scenes.map((scene) => {
        const match = suggestions.find((entry) => entry.sceneId === scene.id);
        if (!match) {
          return scene;
        }

        const currentDuration = scene.endFrame - scene.startFrame;
        const ratio = match.suggestedDuration / currentDuration;
        if (ratio < 0.8 || ratio > 1.2) {
          return scene;
        }

        return scene;
      });

      return { ...narrative, scenes };
    } catch {
      return narrative;
    }
  }

  private buildDescriptionPrompt(narrative: NarrativeOutput): Message[] {
    return [
      {
        role: "system",
        content:
          "You are a presentation narrative expert. Enrich scene overlay text to be more engaging and concise. Respond with a JSON array of {sceneId, overlayText} objects. Keep text short (under 20 words per overlay).",
      },
      {
        role: "user",
        content: `Enrich the overlay text for this presentation titled "${narrative.title}":\n${JSON.stringify(
          narrative.scenes.map((scene) => ({
            sceneId: scene.id,
            label: scene.label,
            currentText: scene.overlays[0]?.content || scene.label,
          })),
        )}`,
      },
    ];
  }

  private buildRationalePrompt(narrative: NarrativeOutput): Message[] {
    return [
      {
        role: "system",
        content:
          "You are a motion design expert. Provide brief transition rationale for each scene explaining why the chosen mode fits. Respond with JSON array of {sceneId, rationale}. Keep rationale under 30 words.",
      },
      {
        role: "user",
        content: `Mode: ${narrative.mode}. Scenes:\n${JSON.stringify(
          narrative.scenes.map((scene) => ({
            sceneId: scene.id,
            label: scene.label,
            frames: scene.endFrame - scene.startFrame,
          })),
        )}`,
      },
    ];
  }

  private buildTimingPrompt(narrative: NarrativeOutput): Message[] {
    return [
      {
        role: "system",
        content:
          "You are a timing expert for scroll presentations. Suggest frame durations. Respond with JSON array of {sceneId, suggestedDuration}.",
      },
      {
        role: "user",
        content: `FPS: ${narrative.fps}. Scenes:\n${JSON.stringify(
          narrative.scenes.map((scene) => ({
            sceneId: scene.id,
            label: scene.label,
            currentDuration: scene.endFrame - scene.startFrame,
          })),
        )}`,
      },
    ];
  }
}
