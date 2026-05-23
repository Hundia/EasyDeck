import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useTouchTolerance } from "@/lib/a11y/useTouchTolerance";

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("useTouchTolerance", () => {
  it("returns 10 for fine pointer by default", async () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useTouchTolerance());

    await waitFor(() => {
      expect(result.current).toBe(10);
    });
  });

  it("returns 20 for coarse pointer", async () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTouchTolerance());

    await waitFor(() => {
      expect(result.current).toBe(20);
    });
  });
});
