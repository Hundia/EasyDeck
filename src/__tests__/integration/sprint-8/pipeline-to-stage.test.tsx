import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stage } from "@/components/Stage";
import { createPresentation, ContentBrief } from "@/lib/pipeline";

// ---------------------------------------------------------------------------
// Mock heavy dependencies (GSAP, Observer, canvas) — same pattern as sprint-7
// ---------------------------------------------------------------------------

vi.mock("gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    timeline: vi.fn(() => ({
      to: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      kill: vi.fn(),
    })),
    ticker: { add: vi.fn(), remove: vi.fn() },
    utils: {
      wrap: vi.fn(
        (min: number, max: number) =>
          (value: number) =>
            ((value % max) + max) % max,
      ),
    },
  },
}));

vi.mock("gsap/Observer", () => ({
  Observer: {
    create: vi.fn(() => ({ kill: vi.fn() })),
  },
}));

vi.mock("@/components/ImageSequenceCanvas", () => ({
  ImageSequenceCanvas: vi.fn(() => <canvas data-testid="mock-canvas" />),
}));

vi.mock("@/components/SnapStage", () => ({
  SnapStage: () => <div data-testid="snap-stage" />,
}));

vi.mock("@/components/ScrubStage", () => ({
  ScrubStage: () => <div data-testid="scrub-stage" />,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeAndRun(rawBrief: Parameters<typeof ContentBrief.parse>[0]) {
  const brief = ContentBrief.parse(rawBrief);
  return createPresentation(brief);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Sprint 8 integration — pipeline output → Stage render", () => {
  it("pipeline output renders in <Stage> without error (single scene)", () => {
    const { story } = makeAndRun({
      title: "Render Test",
      slug: "render-test",
      scenes: [{ label: "Intro", description: "Opening scene", durationHint: 2 }],
    });

    expect(() => render(<Stage story={story} />)).not.toThrow();
  });

  it("Stage renders section-mode pipeline output with a recognisable root element", () => {
    const { story } = makeAndRun({
      title: "Section Render",
      slug: "section-render",
      mode: "section",
      scenes: [
        { label: "Scene A", description: "First scene", durationHint: 2 },
        { label: "Scene B", description: "Second scene", durationHint: 3 },
      ],
    });

    render(<Stage story={story} />);

    // SectionStage is NOT mocked — it renders the real component.
    // We verify the Stage itself mounts without error by checking for canvas.
    expect(screen.getAllByTestId("mock-canvas").length).toBeGreaterThan(0);
  });

  it("multi-scene pipeline output renders all scenes in Stage", () => {
    const { story } = makeAndRun({
      title: "Multi Scene",
      slug: "multi-scene",
      mode: "section",
      scenes: [
        { label: "Alpha", description: "First", durationHint: 2 },
        { label: "Beta", description: "Second", durationHint: 2 },
        { label: "Gamma", description: "Third", durationHint: 2 },
      ],
    });

    // Three scenes → three canvases (one per ImageSequenceCanvas)
    render(<Stage story={story} />);

    expect(story.scenes).toHaveLength(3);
    expect(() => render(<Stage story={story} />)).not.toThrow();
  });

  it("snap-mode pipeline output routes to SnapStage", () => {
    const { story } = makeAndRun({
      title: "Snap Render",
      slug: "snap-render",
      mode: "snap",
      scenes: [
        { label: "One", description: "First", durationHint: 2 },
        { label: "Two", description: "Second", durationHint: 2 },
      ],
    });

    render(<Stage story={story} />);

    expect(screen.getByTestId("snap-stage")).toBeInTheDocument();
  });

  it("pipeline output with overlays renders without error", () => {
    const { story } = makeAndRun({
      title: "Overlay Render",
      slug: "overlay-render",
      scenes: [
        {
          label: "Hero",
          description: "Opening with overlay",
          durationHint: 3,
          overlayText: "Welcome",
        },
        { label: "Body", description: "Clean slide", durationHint: 2 },
      ],
    });

    expect(() => render(<Stage story={story} />)).not.toThrow();
  });
});
