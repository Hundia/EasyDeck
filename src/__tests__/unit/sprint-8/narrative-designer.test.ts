import { describe, expect, it } from "vitest";
import { designNarrative } from "@/lib/pipeline";
import type { ContentBrief } from "@/lib/pipeline";

/** Build a fully-parsed ContentBrief from raw input using the Zod schema */
import { ContentBrief as ContentBriefSchema } from "@/lib/pipeline";

function makeBrief(overrides: Partial<{
  title: string;
  slug: string;
  scenes: Array<{ label: string; description: string; durationHint?: number; overlayText?: string }>;
  mode: "section" | "snap" | "scrub";
  fps: number;
}>): ContentBrief {
  return ContentBriefSchema.parse({
    title: "Test Presentation",
    slug: "test-presentation",
    scenes: [{ label: "Intro", description: "Opening" }],
    ...overrides,
  });
}

describe("NarrativeDesigner — designNarrative", () => {
  it("produces the correct number of scenes", () => {
    const brief = makeBrief({
      scenes: [
        { label: "Intro", description: "Opening" },
        { label: "Features", description: "Key features" },
        { label: "CTA", description: "Call to action" },
      ],
    });

    const output = designNarrative(brief);

    expect(output.scenes).toHaveLength(3);
  });

  it("produces contiguous frame ranges across all scenes", () => {
    const brief = makeBrief({
      scenes: [
        { label: "Scene 1", description: "First", durationHint: 2 },
        { label: "Scene 2", description: "Second", durationHint: 3 },
        { label: "Scene 3", description: "Third", durationHint: 1 },
      ],
    });

    const output = designNarrative(brief);

    for (let i = 0; i < output.scenes.length - 1; i++) {
      expect(output.scenes[i].endFrame).toBe(output.scenes[i + 1].startFrame);
    }
  });

  it("first scene starts at frame 0", () => {
    const brief = makeBrief({});
    const output = designNarrative(brief);
    expect(output.scenes[0].startFrame).toBe(0);
  });

  it("assigns frames based on durationHint * fps (2s @ 30fps = 60 frames)", () => {
    const brief = makeBrief({
      fps: 30,
      scenes: [
        { label: "Short", description: "Two seconds", durationHint: 2 },
        { label: "Long", description: "Four seconds", durationHint: 4 },
      ],
    });

    const output = designNarrative(brief);

    expect(output.scenes[0].endFrame - output.scenes[0].startFrame).toBe(60);
    expect(output.scenes[1].endFrame - output.scenes[1].startFrame).toBe(120);
  });

  it("defaults to 5 seconds per scene when no durationHint provided (30fps → 150 frames)", () => {
    const brief = makeBrief({
      fps: 30,
      scenes: [{ label: "Default", description: "No duration hint" }],
    });

    const output = designNarrative(brief);

    expect(output.scenes[0].endFrame - output.scenes[0].startFrame).toBe(150);
  });

  it("includes a non-empty transitionRationale string per scene", () => {
    const brief = makeBrief({
      scenes: [
        { label: "Intro", description: "Opening" },
        { label: "Body", description: "Main content" },
      ],
    });

    const output = designNarrative(brief);

    for (const scene of output.scenes) {
      expect(typeof scene.transitionRationale).toBe("string");
      expect(scene.transitionRationale.length).toBeGreaterThan(0);
    }
  });

  it("generates an overlay when overlayText is provided", () => {
    const brief = makeBrief({
      scenes: [
        { label: "Hero", description: "Hero section", overlayText: "Welcome to the future" },
      ],
    });

    const output = designNarrative(brief);

    expect(output.scenes[0].overlays).toHaveLength(1);
    expect(output.scenes[0].overlays[0].content).toBe("Welcome to the future");
  });

  it("generates no overlay when overlayText is absent", () => {
    const brief = makeBrief({
      scenes: [{ label: "Clean", description: "No overlay" }],
    });

    const output = designNarrative(brief);

    expect(output.scenes[0].overlays).toHaveLength(0);
  });

  it("overlay timing values are in [0, 1] range with enterAt < exitAt", () => {
    const brief = makeBrief({
      scenes: [
        { label: "Overlay Scene", description: "Has overlay", overlayText: "Slide caption" },
      ],
    });

    const output = designNarrative(brief);
    const overlay = output.scenes[0].overlays[0];

    expect(overlay.enterAt).toBeGreaterThanOrEqual(0);
    expect(overlay.enterAt).toBeLessThan(1);
    expect(overlay.exitAt).toBeGreaterThan(0);
    expect(overlay.exitAt).toBeLessThanOrEqual(1);
    expect(overlay.enterAt).toBeLessThan(overlay.exitAt);
  });

  it("handles a single-scene brief", () => {
    const brief = makeBrief({
      scenes: [{ label: "Solo", description: "Only scene", durationHint: 3 }],
    });

    const output = designNarrative(brief);

    expect(output.scenes).toHaveLength(1);
    expect(output.scenes[0].startFrame).toBe(0);
    expect(output.scenes[0].endFrame).toBe(90); // 3s * 30fps
    expect(output.scenes[0].transitionRationale).toBeTruthy();
  });

  it("uses brief.mode when provided", () => {
    const brief = makeBrief({
      mode: "snap",
      scenes: [
        { label: "A", description: "First" },
        { label: "B", description: "Second" },
      ],
    });

    const output = designNarrative(brief);

    expect(output.mode).toBe("snap");
    for (const scene of output.scenes) {
      expect(scene.mode).toBe("snap");
    }
  });

  it("defaults mode to 'section' when not specified", () => {
    const brief = makeBrief({
      scenes: [{ label: "Default", description: "No mode" }],
    });

    const output = designNarrative(brief);

    expect(output.mode).toBe("section");
  });

  it("output includes brief title and slug", () => {
    const brief = makeBrief({ title: "My Deck", slug: "my-deck" });
    const output = designNarrative(brief);

    expect(output.title).toBe("My Deck");
    expect(output.slug).toBe("my-deck");
  });

  it("output fps matches brief fps", () => {
    const brief = makeBrief({ fps: 24 });
    const output = designNarrative(brief);

    expect(output.fps).toBe(24);
  });

  it("is deterministic — same input produces same output", () => {
    const brief = makeBrief({
      scenes: [
        { label: "Intro", description: "Opening", durationHint: 2 },
        { label: "Body", description: "Main content", durationHint: 4 },
      ],
    });

    const first = designNarrative(brief);
    const second = designNarrative(brief);

    expect(first).toEqual(second);
  });
});
