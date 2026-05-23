import { describe, expect, it, vi } from "vitest";
import { createPresentation, ContentBrief } from "@/lib/pipeline";
import { StorySchema } from "@/lib/schemas/story";

type RawBrief = {
  title: string;
  slug: string;
  scenes: Array<{
    label: string;
    description: string;
    durationHint?: number;
    overlayText?: string;
  }>;
  mode?: "section" | "snap" | "scrub";
  fps?: number;
};

function parseBrief(raw: RawBrief) {
  return ContentBrief.parse(raw);
}

describe("Pipeline — createPresentation", () => {
  it("end-to-end: minimal brief produces a defined result", () => {
    const brief = parseBrief({
      title: "My Presentation",
      slug: "my-presentation",
      scenes: [{ label: "Intro", description: "Opening" }],
    });

    const result = createPresentation(brief);

    expect(result).toBeDefined();
    expect(result.story).toBeDefined();
    expect(result.log).toBeDefined();
  });

  it("output.story passes StorySchema.parse() validation", () => {
    const brief = parseBrief({
      title: "Validated Story",
      slug: "validated-story",
      scenes: [
        { label: "Scene A", description: "First scene", durationHint: 2 },
        { label: "Scene B", description: "Second scene", durationHint: 3 },
      ],
    });

    const { story } = createPresentation(brief);

    expect(() => StorySchema.parse(story)).not.toThrow();
  });

  it("output story meta matches input brief", () => {
    const brief = parseBrief({
      title: "Brand Story",
      slug: "brand-story",
      scenes: [{ label: "Intro", description: "Opening" }],
    });

    const { story } = createPresentation(brief);

    expect(story.meta.title).toBe("Brand Story");
    expect(story.meta.slug).toBe("brand-story");
  });

  it("output story has the same number of scenes as the brief", () => {
    const brief = parseBrief({
      title: "Three Scene Deck",
      slug: "three-scene-deck",
      scenes: [
        { label: "Intro", description: "Opening" },
        { label: "Middle", description: "Body" },
        { label: "Outro", description: "Closing" },
      ],
    });

    const { story } = createPresentation(brief);

    expect(story.scenes).toHaveLength(3);
  });

  it("handles many scenes (10 scenes)", () => {
    const scenes = Array.from({ length: 10 }, (_, i) => ({
      label: `Scene ${i + 1}`,
      description: `Description for scene ${i + 1}`,
      durationHint: 2,
    }));

    const brief = parseBrief({
      title: "Long Deck",
      slug: "long-deck",
      scenes,
    });

    const { story } = createPresentation(brief);

    expect(story.scenes).toHaveLength(10);
    expect(() => StorySchema.parse(story)).not.toThrow();
  });

  it("section mode output has contiguous frame ranges", () => {
    const brief = parseBrief({
      title: "Section Deck",
      slug: "section-deck",
      mode: "section",
      scenes: [
        { label: "A", description: "First", durationHint: 2 },
        { label: "B", description: "Second", durationHint: 3 },
        { label: "C", description: "Third", durationHint: 1 },
      ],
    });

    const { story } = createPresentation(brief);

    for (let i = 0; i < story.scenes.length - 1; i++) {
      expect(story.scenes[i].endFrame).toBe(story.scenes[i + 1].startFrame);
    }
  });

  it("throws on invalid brief — missing title", () => {
    expect(() =>
      ContentBrief.parse({ slug: "no-title", scenes: [{ label: "X", description: "Y" }] }),
    ).toThrow();
  });

  it("throws on invalid brief — empty scenes array", () => {
    expect(() =>
      ContentBrief.parse({ title: "Bad", slug: "bad", scenes: [] }),
    ).toThrow();
  });

  it("returns log with adjustments array", () => {
    const brief = parseBrief({
      title: "Log Test",
      slug: "log-test",
      scenes: [{ label: "Only", description: "Single scene" }],
    });

    const { log } = createPresentation(brief);

    expect(Array.isArray(log.adjustments)).toBe(true);
    for (const entry of log.adjustments) {
      expect(typeof entry).toBe("string");
    }
  });

  it("returns log with adjustments when SceneComposer fixes continuity", async () => {
    vi.resetModules();
    vi.doMock("@/lib/pipeline/narrativeDesigner", async () => {
      const actual = await vi.importActual<typeof import("@/lib/pipeline/narrativeDesigner")>("@/lib/pipeline/narrativeDesigner");
      return {
        ...actual,
        designNarrative: () => ({
          title: "Adjusted Deck",
          slug: "adjusted-deck",
          mode: "section" as const,
          fps: 30,
          imagePattern: "/frames/frame-{index}.webp",
          scenes: [
            {
              id: "scene-0",
              label: "Intro",
              startFrame: 0,
              endFrame: 60,
              mode: "section" as const,
              overlays: [],
              transitionRationale: "Intro uses section mode.",
            },
            {
              id: "scene-1",
              label: "Gap",
              startFrame: 80,
              endFrame: 140,
              mode: "section" as const,
              overlays: [],
              transitionRationale: "Gap scene uses section mode.",
            },
          ],
        }),
      };
    });

    const { createPresentation: createPresentationWithGap } = await import("@/lib/pipeline/pipeline");
    const result = createPresentationWithGap({
      title: "Adjusted Deck",
      slug: "adjusted-deck",
      scenes: [{ label: "Intro", description: "Opening" }],
    });

    expect(result.log.adjustments).toHaveLength(1);
    expect(result.story.scenes[1].startFrame).toBe(60);

    vi.doUnmock("@/lib/pipeline/narrativeDesigner");
    vi.resetModules();
  });

  it("is deterministic — same brief produces identical story output", () => {
    const rawBrief = {
      title: "Deterministic Test",
      slug: "deterministic-test",
      scenes: [
        { label: "Alpha", description: "First", durationHint: 2 },
        { label: "Beta", description: "Second", durationHint: 3 },
      ],
    };

    const { story: first, log: firstLog } = createPresentation(parseBrief(rawBrief));
    const { story: second, log: secondLog } = createPresentation(parseBrief(rawBrief));

    expect(first).toEqual(second);
    expect(firstLog).toEqual(secondLog);
  });

  it("uses the mode from brief when provided", () => {
    const brief = parseBrief({
      title: "Snap Deck",
      slug: "snap-deck",
      mode: "snap",
      scenes: [
        { label: "A", description: "First" },
        { label: "B", description: "Second" },
      ],
    });

    const { story } = createPresentation(brief);

    expect(story.transition.mode).toBe("snap");
  });

  it("defaults to section mode when no mode in brief", () => {
    const brief = parseBrief({
      title: "Default Mode",
      slug: "default-mode",
      scenes: [{ label: "Only", description: "Single" }],
    });

    const { story } = createPresentation(brief);

    expect(story.transition.mode).toBe("section");
  });

  it("generates overlays in the story when overlayText is in brief", () => {
    const brief = parseBrief({
      title: "Overlay Deck",
      slug: "overlay-deck",
      scenes: [
        { label: "Hero", description: "Hero section", overlayText: "Join us today" },
      ],
    });

    const { story } = createPresentation(brief);

    expect(story.scenes[0].overlays).toHaveLength(1);
    expect(story.scenes[0].overlays[0].content).toBe("Join us today");
  });

  it("output passes StorySchema even with many scenes and overlays", () => {
    const scenes = Array.from({ length: 5 }, (_, i) => ({
      label: `Slide ${i + 1}`,
      description: `Content ${i + 1}`,
      durationHint: 3,
      overlayText: i % 2 === 0 ? `Caption ${i + 1}` : undefined,
    }));

    const brief = parseBrief({
      title: "Full Deck",
      slug: "full-deck",
      scenes,
    });

    const { story } = createPresentation(brief);

    expect(() => StorySchema.parse(story)).not.toThrow();
  });
});
