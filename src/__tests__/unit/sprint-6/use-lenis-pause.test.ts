import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLenisPause } from "@/lib/lenis/useLenisPause";

const mockLenis = {
  stop: vi.fn(),
  start: vi.fn(),
};

vi.mock("@/lib/lenis/LenisProvider", () => ({
  useLenis: vi.fn(() => ({
    lenis: mockLenis,
    stop: vi.fn(),
    start: vi.fn(),
  })),
}));

describe("useLenisPause", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls stop on mount", () => {
    renderHook(() => useLenisPause());

    expect(mockLenis.stop).toHaveBeenCalledTimes(1);
  });

  it("calls start on unmount", () => {
    const { unmount } = renderHook(() => useLenisPause());

    unmount();

    expect(mockLenis.start).toHaveBeenCalledTimes(1);
  });
});
