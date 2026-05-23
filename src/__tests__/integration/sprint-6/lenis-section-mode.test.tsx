import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LenisProvider } from "@/lib/lenis/LenisProvider";
import { SectionStage } from "@/components/SectionStage";
import type { StorySchema } from "@/lib/schemas/story";

const mockLenis = {
  raf: vi.fn(),
  destroy: vi.fn(),
  stop: vi.fn(),
  start: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  resize: vi.fn(),
};

let capturedOnComplete: (() => void) | undefined;

vi.mock("lenis", () => ({
  default: vi.fn().mockImplementation(() => mockLenis),
}));

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
      ticker: {
        add: vi.fn(),
        remove: vi.fn(),
        lagSmoothing: vi.fn(),
      },
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

vi.mock("@/components/ImageSequenceCanvas", () => ({
  ImageSequenceCanvas: vi.fn(() => <canvas data-testid="mock-canvas" />),
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
  meta: { title: "Test Story", slug: "test-story" },
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
  ],
  pauseLenisInSection: true,
  reducedMotionFallback: "scrub-instant",
};

describe("Lenis section mode integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnComplete = undefined;
    capturedObserverConfig = {};
    setReducedMotion(false);
  });

  afterEach(() => {
    capturedOnComplete = undefined;
  });

  it("stops Lenis when SectionStage mounts", () => {
    render(
      <LenisProvider>
        <SectionStage story={story} />
      </LenisProvider>,
    );

    expect(mockLenis.stop).toHaveBeenCalledTimes(1);
  });

  it("restarts Lenis when SectionStage unmounts", () => {
    const { unmount } = render(
      <LenisProvider>
        <SectionStage story={story} />
      </LenisProvider>,
    );

    act(() => {
      unmount();
    });

    expect(mockLenis.start).toHaveBeenCalledTimes(1);
  });
});
