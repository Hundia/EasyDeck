import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePlayhead } from "@/lib/hooks/usePlayhead";
import { resolveFrameUrl, preloadFrames } from "@/lib/canvas/preloader";
import { computeCanvasDimensions } from "@/lib/canvas/sizing";
import { clampFrame } from "@/lib/canvas/clamp";

// Mock Image in tests
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  _src = "";
  set src(val: string) {
    this._src = val;
    // Simulate async load
    setTimeout(() => this.onload?.(), 0);
  }
  get src() {
    return this._src;
  }
  get complete() {
    return true;
  }
}

describe("usePlayhead", () => {
  it("returns ref with default initial frame 0", () => {
    const { result } = renderHook(() => usePlayhead());
    expect(result.current.current.frame).toBe(0);
  });

  it("returns ref with provided initial frame", () => {
    const { result } = renderHook(() => usePlayhead(42));
    expect(result.current.current.frame).toBe(42);
  });

  it("mutation to ref persists across renders", () => {
    const { result, rerender } = renderHook(() => usePlayhead(0));
    result.current.current.frame = 99;
    rerender();
    expect(result.current.current.frame).toBe(99);
  });
});

describe("resolveFrameUrl", () => {
  it("zero-pads index to 4 digits", () => {
    expect(resolveFrameUrl("/frames/{idx:0000}.webp", 5)).toBe("/frames/0005.webp");
  });

  it("zero-pads index to 3 digits", () => {
    expect(resolveFrameUrl("/frames/{idx:000}.webp", 7)).toBe("/frames/007.webp");
  });

  it("handles index at exact pad length", () => {
    expect(resolveFrameUrl("/frames/{idx:0000}.webp", 1234)).toBe("/frames/1234.webp");
  });

  it("handles index exceeding pad length", () => {
    expect(resolveFrameUrl("/frames/{idx:00}.webp", 999)).toBe("/frames/999.webp");
  });

  it("handles index 0", () => {
    expect(resolveFrameUrl("/frames/{idx:0000}.webp", 0)).toBe("/frames/0000.webp");
  });
});

describe("preloadFrames", () => {
  let OriginalImage: typeof Image;

  beforeEach(() => {
    OriginalImage = globalThis.Image;
    // @ts-expect-error mock
    globalThis.Image = MockImage;
  });

  afterEach(() => {
    globalThis.Image = OriginalImage;
  });

  it("resolves with array of correct length", async () => {
    const images = await preloadFrames("/frames/{idx:0000}.webp", 5);
    expect(images).toHaveLength(5);
  });

  it("calls progress callback with increasing values", async () => {
    const progressValues: number[] = [];
    await preloadFrames("/frames/{idx:0000}.webp", 3, (p) => progressValues.push(p));
    // All progress values should be between 0 and 1
    expect(progressValues.length).toBeGreaterThan(0);
    progressValues.forEach((v) => expect(v).toBeGreaterThan(0));
    expect(progressValues[progressValues.length - 1]).toBe(1);
    // Values should be non-decreasing
    for (let i = 1; i < progressValues.length; i++) {
      expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
    }
  });

  it("handles frameCount 0", async () => {
    const progressValues: number[] = [];
    const images = await preloadFrames("/frames/{idx:0000}.webp", 0, (p) => progressValues.push(p));
    expect(images).toHaveLength(0);
    expect(progressValues).toEqual([1]);
  });

  it("resolves with HTMLImageElement instances for loaded frames", async () => {
    const images = await preloadFrames("/frames/{idx:0000}.webp", 2);
    images.forEach((img) => {
      expect(img).toBeInstanceOf(MockImage);
    });
  });
});

describe("computeCanvasDimensions", () => {
  it("with DPR 1 returns same CSS and backing dimensions", () => {
    const dims = computeCanvasDimensions(800, 600, 1);
    expect(dims.cssWidth).toBe(800);
    expect(dims.cssHeight).toBe(600);
    expect(dims.backingWidth).toBe(800);
    expect(dims.backingHeight).toBe(600);
    expect(dims.dpr).toBe(1);
  });

  it("with DPR 2 doubles backing store dimensions", () => {
    const dims = computeCanvasDimensions(800, 600, 2);
    expect(dims.cssWidth).toBe(800);
    expect(dims.cssHeight).toBe(600);
    expect(dims.backingWidth).toBe(1600);
    expect(dims.backingHeight).toBe(1200);
    expect(dims.dpr).toBe(2);
  });

  it("with DPR 3 triples backing store dimensions", () => {
    const dims = computeCanvasDimensions(400, 300, 3);
    expect(dims.backingWidth).toBe(1200);
    expect(dims.backingHeight).toBe(900);
    expect(dims.dpr).toBe(3);
  });
});

describe("clampFrame", () => {
  it("clamps negative frame to 0", () => {
    expect(clampFrame(-5, 10)).toBe(0);
  });

  it("clamps overflow frame to frameCount - 1", () => {
    expect(clampFrame(15, 10)).toBe(9);
  });

  it("returns rounded value for fractional frame", () => {
    expect(clampFrame(3.7, 10)).toBe(4);
    expect(clampFrame(3.2, 10)).toBe(3);
  });

  it("returns 0 when frameCount is 0", () => {
    expect(clampFrame(5, 0)).toBe(0);
  });

  it("returns 0 when frameCount is negative", () => {
    expect(clampFrame(5, -1)).toBe(0);
  });

  it("returns valid frame for exact boundary", () => {
    expect(clampFrame(0, 10)).toBe(0);
    expect(clampFrame(9, 10)).toBe(9);
  });
});
