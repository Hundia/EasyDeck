import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stage } from "@/components/Stage";
import { resolveTransitionMode } from "@/lib/stage";
import { StorySchema } from "@/lib/schemas/story";
import type { StorySchema as StorySchemaType } from "@/lib/schemas/story";

vi.mock("@/components/SectionStage", () => ({
  SectionStage: () => <div data-testid="section-stage" />,
}));

vi.mock("@/components/SnapStage", () => ({
  SnapStage: () => <div data-testid="snap-stage" />,
}));

vi.mock("@/components/ScrubStage", () => ({
  ScrubStage: () => <div data-testid="scrub-stage" />,
}));

function makeStory(mode: "section" | "snap" | "scrub"): StorySchemaType {
  return {
    meta: { title: `${mode} story`, slug: `${mode}-story` },
    transition: {
      mode,
      duration: 1,
      ease: "power2.inOut",
      directional: true,
      inertia: true,
      wrapEnabled: false,
      tolerance: 10,
      showPagination: true,
      enableKeyboard: true,
      snapDelay: 0.1,
      snapDurationMin: 0.2,
      snapDurationMax: 1.5,
    },
    scenes: [
      {
        id: "scene-1",
        label: "Scene 1",
        startFrame: 0,
        endFrame: 30,
        imageSequence: { pattern: "/frames/{idx:0000}.webp", frameCount: 30 },
        overlays: [],
      },
    ],
    pauseLenisInSection: true,
    reducedMotionFallback: "scrub-instant",
  };
}

describe("Stage", () => {
  it("routes to SectionStage when mode='section'", () => {
    render(<Stage story={makeStory("section")} />);
    expect(screen.getByTestId("section-stage")).toBeInTheDocument();
  });

  it("routes to SnapStage when mode='snap'", () => {
    render(<Stage story={makeStory("snap")} />);
    expect(screen.getByTestId("snap-stage")).toBeInTheDocument();
  });

  it("routes to ScrubStage when mode='scrub'", () => {
    render(<Stage story={makeStory("scrub")} />);
    expect(screen.getByTestId("scrub-stage")).toBeInTheDocument();
  });

  it("defaults to SectionStage when mode is omitted from parsed config", () => {
    const parsedStory = StorySchema.parse({
      meta: { title: "default story", slug: "default-story" },
      transition: {
        duration: 1,
        ease: "power2.inOut",
        directional: true,
        inertia: true,
        wrapEnabled: false,
        tolerance: 10,
        showPagination: true,
        enableKeyboard: true,
        snapDelay: 0.1,
        snapDurationMin: 0.2,
        snapDurationMax: 1.5,
      },
      scenes: [
        {
          id: "scene-1",
          label: "Scene 1",
          startFrame: 0,
          endFrame: 30,
          imageSequence: { pattern: "/frames/{idx:0000}.webp", frameCount: 30 },
        },
      ],
    });

    render(<Stage story={parsedStory} />);
    expect(screen.getByTestId("section-stage")).toBeInTheDocument();
  });
});

describe("resolveTransitionMode", () => {
  it("returns story mode when no scene overrides exist", () => {
    expect(resolveTransitionMode(makeStory("snap"))).toBe("snap");
  });

  it("returns a unanimous scene override", () => {
    const baseStory = makeStory("section");
    const story = {
      ...baseStory,
      scenes: [
        {
          ...baseStory.scenes[0],
          transition: { mode: "scrub" as const },
        },
        {
          ...baseStory.scenes[0],
          id: "scene-2",
          label: "Scene 2",
          startFrame: 30,
          endFrame: 60,
          transition: { mode: "scrub" as const },
        },
      ],
    };

    expect(resolveTransitionMode(story)).toBe("scrub");
  });

  it("falls back to story mode when scene overrides are mixed", () => {
    const baseStory = makeStory("snap");
    const story = {
      ...baseStory,
      scenes: [
        {
          ...baseStory.scenes[0],
          transition: { mode: "scrub" as const },
        },
        {
          ...baseStory.scenes[0],
          id: "scene-2",
          label: "Scene 2",
          startFrame: 30,
          endFrame: 60,
          transition: { mode: "section" as const },
        },
      ],
    };

    expect(resolveTransitionMode(story)).toBe("snap");
  });
});
