import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SnapStage } from "@/components/SnapStage";

vi.mock("gsap", () => {
  const timelineInstance = {
    addLabel: vi.fn().mockReturnThis(),
    to: vi.fn().mockReturnThis(),
    fromTo: vi.fn().mockReturnThis(),
    add: vi.fn().mockReturnThis(),
    kill: vi.fn(),
    scrollTrigger: { kill: vi.fn() },
  };
  return {
    gsap: {
      registerPlugin: vi.fn(),
      timeline: vi.fn(() => timelineInstance),
      ticker: { add: vi.fn(), remove: vi.fn() },
    },
  };
});

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

vi.mock("@/components/ImageSequenceCanvas", () => ({
  ImageSequenceCanvas: vi.fn(() => <canvas />),
}));

Object.defineProperty(window, "matchMedia", {
  value: vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
  writable: true,
});

const mockStory = {
  meta: { title: "Test", slug: "test" },
  transition: {
    mode: "snap" as const,
    duration: 1.0,
    ease: "power2.inOut" as const,
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
      id: "s1",
      label: "Scene 1",
      startFrame: 0,
      endFrame: 30,
      imageSequence: { pattern: "/f/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
    {
      id: "s2",
      label: "Scene 2",
      startFrame: 30,
      endFrame: 60,
      imageSequence: { pattern: "/f/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
  ],
  pauseLenisInSection: true,
  reducedMotionFallback: "scrub-instant" as const,
};

describe("SnapStage Integration", () => {
  it("creates timeline with gsap.timeline", async () => {
    const { gsap } = await import("gsap");
    render(<SnapStage story={mockStory} />);
    expect(gsap.timeline).toHaveBeenCalled();
  });

  it("renders canvas alongside pagination", () => {
    const { container } = render(<SnapStage story={mockStory} />);
    const canvas = container.querySelector("canvas");
    const nav = container.querySelector("nav");
    expect(canvas).toBeTruthy();
    expect(nav).toBeTruthy();
  });
});
