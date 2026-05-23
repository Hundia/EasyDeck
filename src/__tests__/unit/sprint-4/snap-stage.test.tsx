import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { SnapStage } from "@/components/SnapStage";

const mockScrollTriggerKill = vi.fn();
const mockTimelineKill = vi.fn();

vi.mock("gsap", () => ({
  gsap: {
    registerPlugin: vi.fn(),
    timeline: vi.fn(() => ({
      addLabel: vi.fn().mockReturnThis(),
      to: vi.fn().mockReturnThis(),
      fromTo: vi.fn().mockReturnThis(),
      add: vi.fn().mockReturnThis(),
      kill: mockTimelineKill,
      scrollTrigger: { kill: mockScrollTriggerKill },
    })),
    ticker: { add: vi.fn(), remove: vi.fn() },
  },
}));

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
    {
      id: "s3",
      label: "Scene 3",
      startFrame: 60,
      endFrame: 90,
      imageSequence: { pattern: "/f/{idx:0000}.webp", frameCount: 30 },
      overlays: [],
    },
  ],
  pauseLenisInSection: true,
  reducedMotionFallback: "scrub-instant" as const,
};

describe("SnapStage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it("renders a container div", () => {
    const { container } = render(<SnapStage story={mockStory} />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders pagination when showPagination is true", () => {
    const { container } = render(<SnapStage story={mockStory} />);
    const nav = container.querySelector('nav[aria-label="scene navigation"]');
    expect(nav).toBeTruthy();
  });

  it("does not render pagination when showPagination is false", () => {
    const storyNoPag = { ...mockStory, transition: { ...mockStory.transition, showPagination: false } };
    const { container } = render(<SnapStage story={storyNoPag} />);
    const nav = container.querySelector('nav[aria-label="scene navigation"]');
    expect(nav).toBeNull();
  });

  it("renders overlay containers for each scene", () => {
    const { container } = render(<SnapStage story={mockStory} />);
    const overlays = container.querySelectorAll(".pointer-events-none");
    expect(overlays.length).toBe(3);
  });

  it("cleans up timeline on unmount", () => {
    const { unmount } = render(<SnapStage story={mockStory} />);
    unmount();
    expect(mockTimelineKill).toHaveBeenCalled();
  });
});
