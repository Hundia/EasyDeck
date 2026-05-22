import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import React, { useRef } from "react";
import { ImageSequenceCanvas } from "@/components/ImageSequenceCanvas";
import type { Playhead } from "@/lib/types/playhead";

vi.mock("gsap", () => ({
  gsap: {
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
    },
  },
}));

// Mock Image to auto-load
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  _src = "";
  set src(val: string) {
    this._src = val;
    setTimeout(() => this.onload?.(), 0);
  }
  get src() {
    return this._src;
  }
}

const mockGetContext = vi.fn(() => ({
  clearRect: vi.fn(),
  drawImage: vi.fn(),
}));

let OriginalImage: typeof Image;

beforeEach(() => {
  OriginalImage = globalThis.Image;
  // @ts-expect-error mock
  globalThis.Image = MockImage;
  HTMLCanvasElement.prototype.getContext = mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

afterEach(() => {
  globalThis.Image = OriginalImage;
  cleanup();
  vi.clearAllMocks();
});

function TestWrapper({
  frameCount = 3,
  onProgress,
}: {
  frameCount?: number;
  onProgress?: (p: number) => void;
}) {
  const playhead = useRef<Playhead>({ frame: 0 });
  return (
    <div style={{ width: 800, height: 600 }}>
      <ImageSequenceCanvas
        playhead={playhead}
        pattern="/frames/{idx:0000}.webp"
        frameCount={frameCount}
        onProgress={onProgress}
      />
    </div>
  );
}

describe("ImageSequenceCanvas", () => {
  it("renders a canvas element", () => {
    const { container } = render(<TestWrapper />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
  });

  it("calls onProgress during preload", async () => {
    const onProgress = vi.fn();
    render(<TestWrapper frameCount={3} onProgress={onProgress} />);

    // Wait for async image loads to complete
    await new Promise((r) => setTimeout(r, 50));

    expect(onProgress).toHaveBeenCalled();
    const lastCall = onProgress.mock.calls[onProgress.mock.calls.length - 1];
    expect(lastCall[0]).toBe(1);
  });

  it("cleans up GSAP ticker on unmount", async () => {
    const { gsap } = await import("gsap");
    const { unmount } = render(<TestWrapper />);

    expect(gsap.ticker.add).toHaveBeenCalled();
    unmount();
    expect(gsap.ticker.remove).toHaveBeenCalled();
  });

  it("applies default className to canvas", () => {
    const { container } = render(<TestWrapper />);
    const canvas = container.querySelector("canvas");
    expect(canvas?.className).toBe("absolute inset-0 h-full w-full");
  });
});
