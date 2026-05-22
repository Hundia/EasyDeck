import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, act, waitFor } from "@testing-library/react";
import React from "react";
import { computeNextIndex } from "@/lib/section/gotoScene";
import { Pagination } from "@/components/Pagination";
import { SectionStage } from "@/components/SectionStage";
import type { StorySchema } from "@/lib/schemas/story";

// ─── GSAP mock ────────────────────────────────────────────────────────────────
let capturedOnComplete: (() => void) | undefined;

vi.mock("gsap", () => {
  const timelineMock = vi.fn((opts?: { onComplete?: () => void }) => {
    capturedOnComplete = opts?.onComplete;
    const tl = {
      to: vi.fn().mockReturnThis(),
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

// ─── Observer mock ────────────────────────────────────────────────────────────
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

// ─── ImageSequenceCanvas mock ─────────────────────────────────────────────────
vi.mock("@/components/ImageSequenceCanvas", () => ({
  ImageSequenceCanvas: vi.fn(() => <canvas data-testid="mock-canvas" />),
}));

// ─── matchMedia mock ──────────────────────────────────────────────────────────
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

// ─── Sample story fixture ─────────────────────────────────────────────────────
const sampleStory: StorySchema = {
  meta: { title: "Test Story", slug: "test-story" },
  transition: {
    mode: "section",
    duration: 1.0,
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
      label: "Scene 0",
      startFrame: 0,
      endFrame: 30,
      imageSequence: { pattern: "/frames/s0/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
    {
      id: "scene-1",
      label: "Scene 1",
      startFrame: 30,
      endFrame: 60,
      imageSequence: { pattern: "/frames/s1/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
    {
      id: "scene-2",
      label: "Scene 2",
      startFrame: 60,
      endFrame: 90,
      imageSequence: { pattern: "/frames/s2/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
  ],
  pauseLenisInSection: true,
  reducedMotionFallback: "scrub-instant",
};

beforeEach(() => {
  capturedOnComplete = undefined;
  capturedObserverConfig = {};
  setReducedMotion(false);
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

// ─── 1. computeNextIndex ──────────────────────────────────────────────────────
describe("computeNextIndex", () => {
  it("clamps within bounds when wrapEnabled is false", () => {
    expect(computeNextIndex(0, -1, 3, false)).toBe(0);
    expect(computeNextIndex(2, 3, 3, false)).toBe(2);
    expect(computeNextIndex(1, 1, 3, false)).toBe(1);
  });

  it("wraps around when wrapEnabled is true", () => {
    expect(computeNextIndex(0, -1, 3, true)).toBe(2);
    expect(computeNextIndex(2, 3, 3, true)).toBe(0);
    expect(computeNextIndex(1, 4, 3, true)).toBe(1);
  });

  it("returns valid index for normal in-bounds target", () => {
    expect(computeNextIndex(0, 1, 3, false)).toBe(1);
    expect(computeNextIndex(1, 2, 3, true)).toBe(2);
  });
});

// ─── 2. Animating lock ────────────────────────────────────────────────────────
describe("Animating lock", () => {
  it("blocks rapid gestures — only the first gesture triggers gotoScene", async () => {
    const { gsap } = await import("gsap");

    render(<SectionStage story={sampleStory} />);

    // Trigger onUp twice in quick succession (no onComplete in between)
    act(() => {
      capturedObserverConfig.onUp?.();
      capturedObserverConfig.onUp?.(); // should be blocked
    });

    expect(vi.mocked(gsap.timeline)).toHaveBeenCalledTimes(1);
  });
});

// ─── 3. Keyboard mapping ──────────────────────────────────────────────────────
describe("Keyboard mapping", () => {
  it("ArrowDown advances to next scene", async () => {
    const { gsap } = await import("gsap");

    render(<SectionStage story={sampleStory} />);

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowDown" });
    });

    expect(vi.mocked(gsap.timeline)).toHaveBeenCalledTimes(1);
  });

  it("ArrowUp at scene 0 is a no-op (boundary clamp)", async () => {
    const { gsap } = await import("gsap");

    render(<SectionStage story={sampleStory} />);

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowUp" });
    });

    // At boundary with wrapEnabled=false → computeNextIndex returns 0 → no transition
    expect(vi.mocked(gsap.timeline)).not.toHaveBeenCalled();
  });

  it("Space advances to next scene", async () => {
    const { gsap } = await import("gsap");

    render(<SectionStage story={sampleStory} />);

    act(() => {
      fireEvent.keyDown(window, { key: " " });
    });

    expect(vi.mocked(gsap.timeline)).toHaveBeenCalledTimes(1);
  });

  it("End key jumps to last scene", async () => {
    const { gsap } = await import("gsap");

    render(<SectionStage story={sampleStory} />);

    act(() => {
      fireEvent.keyDown(window, { key: "End" });
    });

    expect(vi.mocked(gsap.timeline)).toHaveBeenCalledTimes(1);
  });

  it("currentIndex updates after onComplete fires", async () => {
    render(<SectionStage story={sampleStory} />);

    act(() => {
      fireEvent.keyDown(window, { key: "ArrowDown" });
    });

    // Simulate the GSAP tween completing
    await act(async () => {
      capturedOnComplete?.();
    });

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      expect(buttons[1].getAttribute("aria-current")).toBe("step");
    });
  });
});

// ─── 4. Pagination render ─────────────────────────────────────────────────────
describe("Pagination render", () => {
  it("renders the correct number of dots", () => {
    render(<Pagination sceneCount={4} currentIndex={0} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("sets aria-current='step' on the active dot only", () => {
    render(<Pagination sceneCount={3} currentIndex={1} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0].getAttribute("aria-current")).toBeNull();
    expect(buttons[1].getAttribute("aria-current")).toBe("step");
    expect(buttons[2].getAttribute("aria-current")).toBeNull();
  });

  it("applies correct aria-label to each dot", () => {
    render(<Pagination sceneCount={2} currentIndex={0} />);
    expect(screen.getByLabelText("Go to scene 1")).toBeDefined();
    expect(screen.getByLabelText("Go to scene 2")).toBeDefined();
  });
});

// ─── 5. Pagination click ──────────────────────────────────────────────────────
describe("Pagination click", () => {
  it("calls onDotClick with the correct index when a dot is clicked", () => {
    const onDotClick = vi.fn();
    render(<Pagination sceneCount={3} currentIndex={0} onDotClick={onDotClick} />);

    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[2]);

    expect(onDotClick).toHaveBeenCalledWith(2);
  });

  it("calls onDotClick(0) when first dot is clicked", () => {
    const onDotClick = vi.fn();
    render(<Pagination sceneCount={3} currentIndex={2} onDotClick={onDotClick} />);

    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onDotClick).toHaveBeenCalledWith(0);
  });
});

// ─── 6. Reduced motion ───────────────────────────────────────────────────────
describe("Reduced motion", () => {
  it("collapses tween duration to ~0.01 when prefers-reduced-motion is set", async () => {
    setReducedMotion(true);
    const { gsap } = await import("gsap");

    render(<SectionStage story={sampleStory} />);

    act(() => {
      capturedObserverConfig.onUp?.();
    });

    expect(vi.mocked(gsap.timeline)).toHaveBeenCalledTimes(1);
    const tlInstance = vi.mocked(gsap.timeline).mock.results[0].value as {
      to: ReturnType<typeof vi.fn>;
    };
    const toCall = tlInstance.to.mock.calls[0] as [unknown, { duration: number }];
    expect(toCall[1].duration).toBeCloseTo(0.01);
  });

  it("uses full duration when reduced motion is not set", async () => {
    setReducedMotion(false);
    const { gsap } = await import("gsap");

    render(<SectionStage story={sampleStory} />);

    act(() => {
      capturedObserverConfig.onUp?.();
    });

    expect(vi.mocked(gsap.timeline)).toHaveBeenCalledTimes(1);
    const tlInstance = vi.mocked(gsap.timeline).mock.results[0].value as {
      to: ReturnType<typeof vi.fn>;
    };
    const toCall = tlInstance.to.mock.calls[0] as [unknown, { duration: number }];
    expect(toCall[1].duration).toBeCloseTo(sampleStory.transition.duration);
  });
});
