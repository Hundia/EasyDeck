import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHashNavigation } from "@/lib/a11y/useHashNavigation";

describe("useHashNavigation", () => {
  beforeEach(() => {
    window.location.hash = "";
    vi.restoreAllMocks();
  });

  it("returns initialIndex 0 when no hash", () => {
    const { result } = renderHook(() => useHashNavigation());

    expect(result.current.initialIndex).toBe(0);
  });

  it("returns initialIndex N when hash is #scene-N", () => {
    window.location.hash = "#scene-3";
    const { result } = renderHook(() => useHashNavigation());

    expect(result.current.initialIndex).toBe(3);
  });

  it("updateHash calls replaceState with correct hash", () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState").mockImplementation(() => {});
    const { result } = renderHook(() => useHashNavigation());

    act(() => {
      result.current.updateHash(2);
    });

    expect(replaceStateSpy).toHaveBeenCalledWith(null, "", "#scene-2");
  });
});
