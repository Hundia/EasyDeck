import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act, waitFor } from "@testing-library/react";
import React from "react";
import { SectionStage } from "@/components/SectionStage";
import type { StorySchema } from "@/lib/schemas/story";

// ─── GSAP mock — .to() immediately sets frame so playhead visibly changes ─────
let capturedOnComplete: (() => void) | undefined;

vi.mock("gsap", () => {
  const timelineMock = vi.fn((opts?: { onComplete?: () => void }) => {
    capturedOnComplete = opts?.onComplete;
    const tl = {
      to: vi.fn((target: Record<string, unknown>, vars: Record<string, unknown>) => {
        // Immediately apply the tween result so playhead.frame actually changes
        if (target && "frame" in target && "frame" in vars) {
          target["frame"] = vars["frame"];
        }
        return tl;
      }),
      fromTo: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      kill: vi.fn(),
    };
    return tl;
  });

  return {
    gsap: {
      registerPlugin: vi.fn(),
      timeline: timelineMock,
      ticker: { add: vi.fn(), remove: vi.fn() },
      utils: {
        wrap: vi.fn(
          (min: number, max: number) =>
            (val: number) =>
              ((val % max) + max) % max,
        ),
      },
    },
  };
});

// ─── Observer mock — captures callbacks for manual invocation ─────────────────
let capturedObserverConfig: {
  onUp?: () => void;
  onDown?: () => void;
  [key: string]: unknown;
} = {};

vi.mock("gsap/Observer", () => ({
  Observer: {
    create: vi.fn((config: typeof capturedObserverConfig) => {
      capturedObserverConfig = config;
      return { kill: vi.fn() };
    }),
  },
}));

// ─── matchMedia stub ──────────────────────────────────────────────────────────
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

// ─── Sample story ─────────────────────────────────────────────────────────────
const integrationStory: StorySchema = {
  meta: { title: "Integration Story", slug: "integration-story" },
  transition: {
    mode: "section",
    duration: 0.5,
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
      id: "intro",
      label: "Intro",
      startFrame: 0,
      endFrame: 30,
      imageSequence: { pattern: "/frames/intro/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
    {
      id: "body",
      label: "Body",
      startFrame: 30,
      endFrame: 60,
      imageSequence: { pattern: "/frames/body/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
  ],
  pauseLenisInSection: true,
  reducedMotionFallback: "scrub-instant",
};

// ─── Canvas / image mocks so ImageSequenceCanvas doesn't throw ────────────────
const mockClearRect = vi.fn();
const mockDrawImage = vi.fn();

class MockImage {
  onload: (() => void) | null = null;
  _src = "";
  set src(val: string) {
    this._src = val;
    setTimeout(() => this.onload?.(), 0);
  }
  get src() {
    return this._src;
  }
}

let OriginalImage: typeof Image;

beforeEach(() => {
  capturedOnComplete = undefined;
  capturedObserverConfig = {};
  OriginalImage = globalThis.Image;
  // @ts-expect-error mock
  globalThis.Image = MockImage;
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    clearRect: mockClearRect,
    drawImage: mockDrawImage,
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
  vi.clearAllMocks();
});

afterEach(() => {
  globalThis.Image = OriginalImage;
  cleanup();
});

describe("SectionStage + Canvas Integration", () => {
  it("renders ImageSequenceCanvas inside SectionStage", () => {
    render(<SectionStage story={integrationStory} />);
    const canvas = document.querySelector("canvas");
    expect(canvas).not.toBeNull();
  });

  it("renders Pagination alongside the canvas", () => {
    render(<SectionStage story={integrationStory} />);
    const nav = screen.getByRole("navigation", { name: "scene navigation" });
    expect(nav).toBeDefined();
    const dots = screen.getAllByRole("button");
    expect(dots).toHaveLength(integrationStory.scenes.length);
  });

  it("first dot is aria-current='step' on initial render", () => {
    render(<SectionStage story={integrationStory} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].getAttribute("aria-current")).toBe("step");
  });

  it("playhead frame changes after Observer onUp fires", async () => {
    render(<SectionStage story={integrationStory} />);

    // Fire the gesture — .to() immediately sets playhead.frame via the mock
    act(() => {
      capturedObserverConfig.onUp?.();
    });

    // gsap.timeline was called (tween was initiated)
    const { gsap } = vi.mocked(await import("gsap"));
    expect(vi.mocked(gsap.timeline)).toHaveBeenCalled();
    const tl = vi.mocked(gsap.timeline).mock.results[0].value as {
      to: ReturnType<typeof vi.fn>;
    };
    // The first .to() call mutated playhead.current.frame to endFrame of scene 0
    expect(tl.to).toHaveBeenCalled();
    const toArgs = tl.to.mock.calls[0] as [{ frame: number }, { frame: number }];
    expect(toArgs[0].frame).toBe(integrationStory.scenes[0].endFrame);
  });

  it("currentIndex advances to next scene after tween completes", async () => {
    render(<SectionStage story={integrationStory} />);

    act(() => {
      capturedObserverConfig.onUp?.();
    });

    // Simulate GSAP calling onComplete
    await act(async () => {
      capturedOnComplete?.();
    });

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons[1].getAttribute("aria-current")).toBe("step");
    });
  });
});
