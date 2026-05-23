import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useReducedMotion } from "@/lib/a11y/useReducedMotion";

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
        if (event === "change") listeners.add(handler);
      }),
      removeEventListener: vi.fn((event: string, handler: (event: MediaQueryListEvent) => void) => {
        if (event === "change") listeners.delete(handler);
      }),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  return {
    update(nextMatches: boolean) {
      matches = nextMatches;
      const event = { matches: nextMatches } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

describe("useReducedMotion", () => {
  it("returns false when no reduced-motion preference", () => {
    mockMatchMedia(false);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(false);
  });

  it("returns true when reduced-motion is active", () => {
    mockMatchMedia(true);

    const { result } = renderHook(() => useReducedMotion());

    expect(result.current).toBe(true);
  });

  it("updates when preference changes", () => {
    const mediaQuery = mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());

    act(() => {
      mediaQuery.update(true);
    });

    expect(result.current).toBe(true);
  });
});
