import { describe, expect, it, vi } from "vitest";
import { AIEnhancer, type LLMProvider } from "@/lib/ai";
import type { NarrativeOutput } from "@/lib/pipeline";

function createNarrative(): NarrativeOutput {
  return {
    title: "AI Deck",
    slug: "ai-deck",
    mode: "section",
    fps: 30,
    imagePattern: "/frames/frame-{index}.webp",
    scenes: [
      {
        id: "scene-0",
        label: "Intro",
        startFrame: 0,
        endFrame: 60,
        mode: "section",
        overlays: [
          {
            id: "overlay-0-0",
            type: "text",
            content: "Original intro",
            enterAt: 0.2,
            exitAt: 0.8,
            position: "center",
          },
        ],
        transitionRationale: "Original intro rationale",
      },
      {
        id: "scene-1",
        label: "Outro",
        startFrame: 60,
        endFrame: 120,
        mode: "section",
        overlays: [
          {
            id: "overlay-1-0",
            type: "text",
            content: "Original outro",
            enterAt: 0.2,
            exitAt: 0.8,
            position: "center",
          },
        ],
        transitionRationale: "Original outro rationale",
      },
    ],
  };
}

class StubProvider implements LLMProvider {
  readonly name = "stub";

  constructor(
    private readonly responses: string[],
    private readonly error?: Error,
  ) {}

  generate = vi.fn(async () => {
    if (this.error) {
      throw this.error;
    }

    const content = this.responses.shift();
    if (!content) {
      throw new Error("missing response");
    }

    return { content };
  });

  async healthCheck() {
    return { healthy: true };
  }
}

describe("AIEnhancer", () => {
  it("calls provider.generate with description and rationale prompts", async () => {
    const provider = new StubProvider([
      JSON.stringify([{ sceneId: "scene-0", overlayText: "Sharper intro" }]),
      JSON.stringify([{ sceneId: "scene-0", rationale: "Section mode keeps focus." }]),
    ]);
    const enhancer = new AIEnhancer(provider, {
      enrichDescriptions: true,
      suggestTiming: false,
      generateRationale: true,
    });

    await enhancer.enhance(createNarrative());

    expect(provider.generate).toHaveBeenCalledTimes(2);
    expect(provider.generate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        temperature: 0.7,
        maxTokens: 1024,
        messages: [
          expect.objectContaining({ role: "system", content: expect.stringContaining("Enrich scene overlay text") }),
          expect.objectContaining({ role: "user", content: expect.stringContaining('"sceneId":"scene-0"') }),
        ],
      }),
    );
    expect(provider.generate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        temperature: 0.5,
        maxTokens: 512,
        messages: [
          expect.objectContaining({ role: "system", content: expect.stringContaining("motion design expert") }),
          expect.objectContaining({ role: "user", content: expect.stringContaining("Mode: section") }),
        ],
      }),
    );
  });

  it("enriches overlay content and rationale and reports enhancements", async () => {
    const provider = new StubProvider([
      JSON.stringify([
        { sceneId: "scene-0", overlayText: "Sharper intro" },
        { sceneId: "scene-1", overlayText: "Cleaner outro" },
      ]),
      JSON.stringify([
        { sceneId: "scene-0", rationale: "Section mode keeps the opener crisp." },
        { sceneId: "scene-1", rationale: "Section mode lands the close with clarity." },
      ]),
    ]);
    const enhancer = new AIEnhancer(provider, {
      enrichDescriptions: true,
      suggestTiming: false,
      generateRationale: true,
    });

    const result = await enhancer.enhance(createNarrative());

    expect(result.enhanced).toBe(true);
    expect(result.enhancements).toEqual([
      "enriched scene descriptions",
      "generated transition rationale",
    ]);
    expect(result.narrative.scenes[0].overlays[0]?.content).toBe("Sharper intro");
    expect(result.narrative.scenes[1].overlays[0]?.content).toBe("Cleaner outro");
    expect(result.narrative.scenes[0].transitionRationale).toBe(
      "Section mode keeps the opener crisp.",
    );
    expect(result.narrative.scenes[1].transitionRationale).toBe(
      "Section mode lands the close with clarity.",
    );
  });

  it("returns the original narrative unchanged when provider.generate throws", async () => {
    const narrative = createNarrative();
    const provider = new StubProvider([], new Error("provider unavailable"));
    const enhancer = new AIEnhancer(provider, {
      enrichDescriptions: true,
      suggestTiming: false,
      generateRationale: true,
    });

    const result = await enhancer.enhance(narrative);

    expect(result).toEqual({
      narrative,
      enhanced: false,
      enhancements: ["enhancement failed, using original"],
    });
  });
});
