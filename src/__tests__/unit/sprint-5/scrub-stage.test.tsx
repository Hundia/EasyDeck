import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, screen, act } from "@testing-library/react";
import type { MutableRefObject } from "react";
import { ScrubStage } from "@/components/ScrubStage";
import type { StorySchema } from "@/lib/schemas/story";
import type { Playhead } from "@/lib/types/playhead";

interface ScrollTriggerUpdate {
  progress: number;
}

let capturedTimelineOptions:
  | {
      scrollTrigger?: {
        scrub?: boolean | number;
        snap?: unknown;
        onUpdate?: (self: ScrollTriggerUpdate) => void;
      };
    }
  | undefined;
let timelineInstance: {
  addLabel: ReturnType<typeof vi.fn>;
  to: ReturnType<typeof vi.fn>;
  fromTo: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  kill: ReturnType<typeof vi.fn>;
  scrollTrigger: { kill: ReturnType<typeof vi.fn> };
};
let capturedPlayhead: MutableRefObject<Playhead> | null = null;

vi.mock("gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    timeline: vi.fn((options?: typeof capturedTimelineOptions) => {
      capturedTimelineOptions = options;
      timelineInstance = {
        addLabel: vi.fn().mockReturnThis(),
        to: vi.fn().mockReturnThis(),
        fromTo: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        kill: vi.fn(),
        scrollTrigger: { kill: vi.fn() },
      };
      return timelineInstance;
    }),
    ticker: { add: vi.fn(), remove: vi.fn() },
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

vi.mock("@/components/ImageSequenceCanvas", () => ({
  ImageSequenceCanvas: vi.fn((props: { playhead: MutableRefObject<Playhead> }) => {
    capturedPlayhead = props.playhead;
    return <canvas data-testid="scrub-canvas" />;
  }),
}));

function setReducedMotion(matches: boolean) {
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
  meta: { title: "Scrub Story", slug: "scrub-story" },
  transition: {
    mode: "scrub",
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
      overlays: [
        {
          id: "overlay-1",
          type: "text",
          content: "Overlay 1",
          enterAt: 0.25,
          exitAt: 0.75,
          position: "center",
        },
      ],
    },
    {
      id: "scene-2",
      label: "Scene 2",
      startFrame: 30,
      endFrame: 90,
      imageSequence: { pattern: "/frames/{idx:0000}.webp", frameCount: 60 },
      overlays: [],
    },
  ],
  pauseLenisInSection: true,
  reducedMotionFallback: "scrub-instant",
};

describe("ScrubStage", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    capturedTimelineOptions = undefined;
    capturedPlayhead = null;
    setReducedMotion(false);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders without error", () => {
    render(<ScrubStage story={story} />);
    expect(screen.getByTestId("scrub-canvas")).toBeInTheDocument();
  });

  it("creates ScrollTrigger with scrub and no snap property", async () => {
    const { gsap } = await import("gsap");

    render(<ScrubStage story={story} />);

    expect(gsap.timeline).toHaveBeenCalledTimes(1);
    expect(capturedTimelineOptions?.scrollTrigger?.scrub).toBe(true);
    expect(capturedTimelineOptions?.scrollTrigger).not.toHaveProperty("snap");
  });

  it("updates the playhead continuously from scroll progress", () => {
    render(<ScrubStage story={story} />);

    act(() => {
      capturedTimelineOptions?.scrollTrigger?.onUpdate?.({ progress: 0.5 });
    });

    expect(capturedPlayhead?.current.frame).toBe(45);
  });

  it("positions overlay animations at enter and exit progress", () => {
    render(<ScrubStage story={story} />);

    expect(timelineInstance.fromTo).toHaveBeenCalledWith(
      expect.anything(),
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, ease: "power2.inOut" },
      0.25,
    );
    expect(timelineInstance.to).toHaveBeenCalledWith(
      expect.anything(),
      { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" },
      0.45,
    );
  });

  it("respects reduced motion by skipping GSAP timeline animations", async () => {
    const { gsap } = await import("gsap");
    setReducedMotion(true);

    render(<ScrubStage story={story} />);

    expect(gsap.timeline).not.toHaveBeenCalled();
    expect(capturedPlayhead?.current.frame).toBe(0);
  });
});
