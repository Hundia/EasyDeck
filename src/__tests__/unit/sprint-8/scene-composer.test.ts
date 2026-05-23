import { describe, expect, it } from "vitest";
import { composeStory } from "@/lib/pipeline";
import type { NarrativeOutput } from "@/lib/pipeline";
import { StorySchema } from "@/lib/schemas/story";

function makeNarrative(overrides: Partial<NarrativeOutput> = {}): NarrativeOutput {
  return {
    title: "Test Deck",
    slug: "test-deck",
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
        overlays: [],
        transitionRationale: "Opening scene uses section mode for impact.",
      },
      {
        id: "scene-1",
        label: "Body",
        startFrame: 60,
        endFrame: 120,
        mode: "section",
        overlays: [],
        transitionRationale: "Continuation with same mode for cohesion.",
      },
    ],
    ...overrides,
  };
}

describe("SceneComposer — composeStory", () => {
  it("produces a valid StorySchema that passes Zod parse", () => {
    const narrative = makeNarrative();
    const { story } = composeStory(narrative);

    expect(() => StorySchema.parse(story)).not.toThrow();
  });

  it("story meta matches narrative title and slug", () => {
    const narrative = makeNarrative({ title: "Demo", slug: "demo" });
    const { story } = composeStory(narrative);

    expect(story.meta.title).toBe("Demo");
    expect(story.meta.slug).toBe("demo");
  });

  it("story transition mode matches narrative mode", () => {
    const narrative = makeNarrative({ mode: "snap" });
    const { story } = composeStory(narrative);

    expect(story.transition.mode).toBe("snap");
  });

  it("produces the same number of scenes as the narrative", () => {
    const narrative = makeNarrative();
    const { story } = composeStory(narrative);

    expect(story.scenes).toHaveLength(2);
  });

  it("enforces frame continuity for section mode — contiguous scenes pass cleanly", () => {
    const narrative = makeNarrative(); // already contiguous: 0→60, 60→120
    const { story, log } = composeStory(narrative);

    // No adjustment needed — log should have no continuity entries
    expect(story.scenes[0].endFrame).toBe(story.scenes[1].startFrame);
    expect(log.adjustments).toHaveLength(0);
  });

  it("enforces frame continuity for section mode — fixes gaps and logs adjustments", () => {
    const narrative = makeNarrative({
      scenes: [
        {
          id: "scene-0",
          label: "Intro",
          startFrame: 0,
          endFrame: 60,
          mode: "section",
          overlays: [],
          transitionRationale: "Opening.",
        },
        {
          id: "scene-1",
          label: "Body",
          startFrame: 80, // GAP: should be 60
          endFrame: 140,
          mode: "section",
          overlays: [],
          transitionRationale: "Continuation.",
        },
      ],
    });

    const { story, log } = composeStory(narrative);

    // Fixed: scene-1 startFrame adjusted to 60
    expect(story.scenes[1].startFrame).toBe(60);
    expect(story.scenes[1].endFrame).toBe(120); // shifted proportionally
    // A log entry was generated for the adjustment
    expect(log.adjustments.length).toBeGreaterThan(0);
  });

  it("does NOT enforce frame continuity for snap mode", () => {
    const narrative = makeNarrative({
      mode: "snap",
      scenes: [
        {
          id: "scene-0",
          label: "Intro",
          startFrame: 0,
          endFrame: 60,
          mode: "snap",
          overlays: [],
          transitionRationale: "Snap opening.",
        },
        {
          id: "scene-1",
          label: "Body",
          startFrame: 100, // non-contiguous OK for snap
          endFrame: 160,
          mode: "snap",
          overlays: [],
          transitionRationale: "Snap body.",
        },
      ],
    });

    const { story } = composeStory(narrative);

    // No adjustment — snap mode does not require contiguity
    expect(story.scenes[1].startFrame).toBe(100);
  });

  it("logs adjustments when fixing frame continuity", () => {
    const narrative = makeNarrative({
      scenes: [
        {
          id: "scene-0",
          label: "Intro",
          startFrame: 0,
          endFrame: 60,
          mode: "section",
          overlays: [],
          transitionRationale: "Opening.",
        },
        {
          id: "scene-1",
          label: "Middle",
          startFrame: 90, // wrong
          endFrame: 150,
          mode: "section",
          overlays: [],
          transitionRationale: "Middle.",
        },
        {
          id: "scene-2",
          label: "End",
          startFrame: 200, // also wrong
          endFrame: 260,
          mode: "section",
          overlays: [],
          transitionRationale: "Closing.",
        },
      ],
    });

    const { log } = composeStory(narrative);

    // At least one log entry per adjusted scene
    expect(log.adjustments.length).toBeGreaterThanOrEqual(2);
    for (const entry of log.adjustments) {
      expect(typeof entry).toBe("string");
      expect(entry.length).toBeGreaterThan(0);
    }
  });

  it("rejects invalid overlay timing where enterAt >= exitAt", () => {
    const narrative = makeNarrative({
      scenes: [
        {
          id: "scene-0",
          label: "Broken Overlay",
          startFrame: 0,
          endFrame: 60,
          mode: "section",
          overlays: [
            {
              id: "overlay-0",
              type: "text",
              content: "This overlay is invalid",
              enterAt: 0.8,
              exitAt: 0.2, // enterAt > exitAt — invalid
              position: "center",
            },
          ],
          transitionRationale: "Test for bad overlay.",
        },
      ],
    });

    expect(() => composeStory(narrative)).toThrow();
  });

  it("rejects overlay where enterAt === exitAt", () => {
    const narrative = makeNarrative({
      scenes: [
        {
          id: "scene-0",
          label: "Equal Overlay",
          startFrame: 0,
          endFrame: 60,
          mode: "section",
          overlays: [
            {
              id: "overlay-0",
              type: "text",
              content: "Zero duration overlay",
              enterAt: 0.5,
              exitAt: 0.5, // equal — invalid
              position: "center",
            },
          ],
          transitionRationale: "Test for equal times.",
        },
      ],
    });

    expect(() => composeStory(narrative)).toThrow();
  });

  it("handles scenes without overlays", () => {
    const narrative = makeNarrative({
      scenes: [
        {
          id: "scene-0",
          label: "Clean",
          startFrame: 0,
          endFrame: 60,
          mode: "section",
          overlays: [],
          transitionRationale: "No overlays needed.",
        },
      ],
    });

    const { story } = composeStory(narrative);

    expect(story.scenes[0].overlays).toHaveLength(0);
    expect(() => StorySchema.parse(story)).not.toThrow();
  });

  it("passes overlays through with correct timing values", () => {
    const narrative = makeNarrative({
      scenes: [
        {
          id: "scene-0",
          label: "With Overlay",
          startFrame: 0,
          endFrame: 60,
          mode: "section",
          overlays: [
            {
              id: "overlay-0",
              type: "text",
              content: "Hello world",
              enterAt: 0.2,
              exitAt: 0.8,
              position: "center",
            },
          ],
          transitionRationale: "Scene with overlay.",
        },
      ],
    });

    const { story } = composeStory(narrative);

    expect(story.scenes[0].overlays[0].enterAt).toBe(0.2);
    expect(story.scenes[0].overlays[0].exitAt).toBe(0.8);
    expect(story.scenes[0].overlays[0].content).toBe("Hello world");
  });

  it("returns log as an empty array when no adjustments are needed", () => {
    const narrative = makeNarrative(); // perfectly contiguous
    const { log } = composeStory(narrative);

    expect(Array.isArray(log.adjustments)).toBe(true);
  });
});
