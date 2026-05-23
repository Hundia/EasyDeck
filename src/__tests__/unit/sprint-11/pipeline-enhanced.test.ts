import { afterEach, describe, expect, it, vi } from "vitest";
import { AIConfigSchema } from "@/lib/ai";
import { createPresentation } from "@/lib/pipeline";

const brief = {
  title: "Enhanced Deck",
  slug: "enhanced-deck",
  scenes: [
    { label: "Intro", description: "Opening", overlayText: "Start here" },
    { label: "Outro", description: "Closing", overlayText: "Finish strong" },
  ],
};

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("@/lib/ai/enhancer");
  vi.doUnmock("@/lib/ai/providers");
  vi.restoreAllMocks();
});

describe("enhanced pipeline", () => {
  it("createPresentation still works synchronously without breaking changes", () => {
    const result = createPresentation(brief);

    expect(result.story.meta.title).toBe("Enhanced Deck");
    expect(result.story.scenes).toHaveLength(2);
    expect(result.aiEnhancements).toBeUndefined();
  });

  it("createEnhancedPresentation without config matches createPresentation", async () => {
    const deterministic = createPresentation(brief);
    const { createEnhancedPresentation } = await import("@/lib/pipeline/pipeline");

    const result = await createEnhancedPresentation(brief);

    expect(result).toEqual(deterministic);
  });

  it("createEnhancedPresentation with config calls AIEnhancer and returns aiEnhancements", async () => {
    const provider = { name: "stub", generate: vi.fn(), healthCheck: vi.fn() };
    const enhance = vi.fn(async (narrative: Awaited<ReturnType<typeof import("@/lib/pipeline")["designNarrative"]>>) => ({
      narrative: {
        ...narrative,
        scenes: narrative.scenes.map((scene, index) =>
          index === 0
            ? {
                ...scene,
                overlays: scene.overlays.map((overlay, overlayIndex) =>
                  overlayIndex === 0 ? { ...overlay, content: "AI intro" } : overlay,
                ),
              }
            : scene,
        ),
      },
      enhanced: true,
      enhancements: ["enriched scene descriptions"],
    }));

    vi.doMock("@/lib/ai/providers", () => ({
      registry: {
        getProvider: vi.fn(() => provider),
      },
    }));
    vi.doMock("@/lib/ai/enhancer", () => ({
      AIEnhancer: class {
        constructor(
          readonly receivedProvider: unknown,
          readonly receivedConfig: unknown,
        ) {
          expect(receivedProvider).toBe(provider);
          expect(receivedConfig).toEqual({
            enrichDescriptions: true,
            suggestTiming: false,
            generateRationale: true,
          });
        }

        enhance = enhance;
      },
    }));

    const { createEnhancedPresentation } = await import("@/lib/pipeline/pipeline");
    const result = await createEnhancedPresentation(
      brief,
      AIConfigSchema.parse({ provider: { provider: "copilot" } }),
    );

    expect(enhance).toHaveBeenCalledTimes(1);
    expect(result.aiEnhancements).toEqual(["enriched scene descriptions"]);
    expect(result.story.scenes[0]?.overlays[0]?.content).toBe("AI intro");
  });

  it("createEnhancedPresentation with provider setup failure falls back to deterministic output", async () => {
    vi.doMock("@/lib/ai/providers", () => ({
      registry: {
        getProvider: vi.fn(() => {
          throw new Error("provider unavailable");
        }),
      },
    }));

    const deterministic = createPresentation(brief);
    const { createEnhancedPresentation } = await import("@/lib/pipeline/pipeline");

    const result = await createEnhancedPresentation(
      brief,
      AIConfigSchema.parse({ provider: { provider: "copilot" } }),
    );

    expect(result.story).toEqual(deterministic.story);
    expect(result.log).toEqual(deterministic.log);
    expect(result.aiEnhancements).toEqual([
      "AI enhancement unavailable, using deterministic mode",
    ]);
  });
});
