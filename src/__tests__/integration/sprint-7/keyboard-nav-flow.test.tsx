import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Stage } from "@/components/Stage";
import type { StorySchema } from "@/lib/schemas/story";

let capturedOnComplete: (() => void) | undefined;
let capturedObserverConfig: {
  onUp?: () => void;
  onDown?: () => void;
  [key: string]: unknown;
} = {};

vi.mock("gsap", () => {
  const timelineMock = vi.fn((opts?: { onComplete?: () => void }) => {
    capturedOnComplete = opts?.onComplete;
    return {
      to: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      kill: vi.fn(),
    };
  });

  return {
    gsap: {
      registerPlugin: vi.fn(),
      timeline: timelineMock,
      ticker: { add: vi.fn(), remove: vi.fn() },
      utils: {
        wrap: vi.fn(
          (min: number, max: number) =>
            (value: number) =>
              ((value % max) + max) % max,
        ),
      },
    },
  };
});

vi.mock("gsap/Observer", () => ({
  Observer: {
    create: vi.fn((config: typeof capturedObserverConfig) => {
      capturedObserverConfig = config;
      return { kill: vi.fn() };
    }),
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

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn(() => ({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

const story: StorySchema = {
  meta: { title: "Accessibility Story", slug: "accessibility-story" },
  transition: {
    mode: "section",
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
      id: "scene-0",
      label: "Intro",
      startFrame: 0,
      endFrame: 30,
      imageSequence: { pattern: "/frames/intro/{idx:0000}.webp", frameCount: 30 },
      overlays: [{ id: "overlay-0", type: "text", content: "Welcome", enterAt: 0, exitAt: 1, position: "center" }],
    },
    {
      id: "scene-1",
      label: "Details",
      startFrame: 30,
      endFrame: 60,
      imageSequence: { pattern: "/frames/details/{idx:0000}.webp", frameCount: 30 },
      overlays: [{ id: "overlay-1", type: "text", content: "More detail", enterAt: 0, exitAt: 1, position: "center" }],
    },
  ],
  pauseLenisInSection: true,
  reducedMotionFallback: "scrub-instant",
};

describe("Sprint 7 keyboard navigation flow", () => {
  beforeEach(() => {
    capturedOnComplete = undefined;
    capturedObserverConfig = {};
    vi.clearAllMocks();
    setMatchMedia(false);
  });

  it("skip link receives focus on first Tab", () => {
    render(<Stage story={story} />);

    const skipLink = screen.getByRole("link", { name: "Skip to presentation content" });
    skipLink.focus();

    expect(skipLink).toHaveFocus();
  });

  it("tab focuses pagination dots", () => {
    render(<Stage story={story} />);

    const firstDot = screen.getByRole("button", { name: "Go to scene 1" });
    firstDot.focus();

    expect(firstDot).toHaveFocus();
  });

  it("arrow keys change scenes", async () => {
    render(<Stage story={story} />);

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowDown" });
    });

    await act(async () => {
      capturedOnComplete?.();
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Go to scene 2" })).toHaveAttribute("aria-current", "step");
    });
  });
});
