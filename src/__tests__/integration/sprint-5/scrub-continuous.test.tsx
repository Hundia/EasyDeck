import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
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
        snap?: unknown;
        onUpdate?: (self: ScrollTriggerUpdate) => void;
      };
    }
  | undefined;
let capturedPlayhead: MutableRefObject<Playhead> | null = null;

vi.mock("gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    timeline: vi.fn((options?: typeof capturedTimelineOptions) => {
      capturedTimelineOptions = options;
      return {
        addLabel: vi.fn().mockReturnThis(),
        to: vi.fn().mockReturnThis(),
        fromTo: vi.fn().mockReturnThis(),
        add: vi.fn().mockReturnThis(),
        kill: vi.fn(),
        scrollTrigger: { kill: vi.fn() },
      };
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
    showPagination: false,
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

describe("ScrubStage continuous scroll", () => {
  beforeEach(() => {
    capturedTimelineOptions = undefined;
    capturedPlayhead = null;
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    vi.clearAllMocks();
  });

  it("updates frames continuously without snap behavior", () => {
    render(<ScrubStage story={story} />);

    const frames: number[] = [];

    act(() => {
      capturedTimelineOptions?.scrollTrigger?.onUpdate?.({ progress: 0.1 });
      frames.push(capturedPlayhead?.current.frame ?? -1);
      capturedTimelineOptions?.scrollTrigger?.onUpdate?.({ progress: 0.11 });
      frames.push(capturedPlayhead?.current.frame ?? -1);
      capturedTimelineOptions?.scrollTrigger?.onUpdate?.({ progress: 0.12 });
      frames.push(capturedPlayhead?.current.frame ?? -1);
    });

    expect(frames).toEqual([9, 10, 11]);
    expect(capturedTimelineOptions?.scrollTrigger).not.toHaveProperty("snap");
  });
});
