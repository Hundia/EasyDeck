import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import React, { useRef } from "react";
import { ImageSequenceCanvas } from "@/components/ImageSequenceCanvas";
import type { Playhead } from "@/lib/types/playhead";

// Capture the ticker callback so we can invoke it manually
let tickerCallback: (() => void) | null = null;

vi.mock("gsap", () => ({
  gsap: {
    ticker: {
      add: vi.fn((cb: () => void) => {
        tickerCallback = cb;
      }),
      remove: vi.fn(() => {
        tickerCallback = null;
      }),
    },
  },
}));

// Mock canvas getContext to return a spy context
const mockClearRect = vi.fn();
const mockDrawImage = vi.fn();
const mockGetContext = vi.fn(() => ({
  clearRect: mockClearRect,
  drawImage: mockDrawImage,
}));

// Mock Image that immediately loads
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  _src = "";
  naturalWidth = 100;
  naturalHeight = 100;
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
  OriginalImage = globalThis.Image;
  // @ts-expect-error mock
  globalThis.Image = MockImage;

  // Patch getContext on HTMLCanvasElement prototype
  HTMLCanvasElement.prototype.getContext = mockGetContext as unknown as typeof HTMLCanvasElement.prototype.getContext;

  vi.clearAllMocks();
  tickerCallback = null;
});

afterEach(() => {
  globalThis.Image = OriginalImage;
  cleanup();
});

describe("Canvas-Playhead Integration", () => {
  it("draws the correct frame when playhead changes and ticker fires", async () => {
    const playheadRef = { current: { frame: 0 } };
    const frameCount = 5;

    render(
      <div style={{ width: 800, height: 600 }}>
        <ImageSequenceCanvas
          playhead={playheadRef}
          pattern="/frames/{idx:0000}.webp"
          frameCount={frameCount}
        />
      </div>
    );

    // Wait for images to load
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Ticker callback should be registered
    expect(tickerCallback).not.toBeNull();

    // Change playhead to frame 2
    playheadRef.current.frame = 2;

    // Fire the ticker callback
    act(() => {
      tickerCallback?.();
    });

    // drawImage should have been called
    expect(mockDrawImage).toHaveBeenCalled();
    const [img] = mockDrawImage.mock.calls[0];
    expect(img).toBeInstanceOf(MockImage);
  });

  it("does not call drawImage when frame is unchanged", async () => {
    const playheadRef = { current: { frame: 0 } };

    render(
      <div style={{ width: 800, height: 600 }}>
        <ImageSequenceCanvas
          playhead={playheadRef}
          pattern="/frames/{idx:0000}.webp"
          frameCount={3}
        />
      </div>
    );

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    // Fire ticker once (draws frame 0 for the first time)
    act(() => {
      tickerCallback?.();
    });

    const firstCallCount = mockDrawImage.mock.calls.length;

    // Fire ticker again without changing frame
    act(() => {
      tickerCallback?.();
    });

    // Should not have drawn again
    expect(mockDrawImage.mock.calls.length).toBe(firstCallCount);
  });
});
