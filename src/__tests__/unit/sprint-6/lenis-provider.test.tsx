import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LenisProvider, useLenis } from "@/lib/lenis/LenisProvider";
import { destroyLenis, initLenis } from "@/lib/lenis/initLenis";

const mockLenis = {
  raf: vi.fn(),
  destroy: vi.fn(),
  stop: vi.fn(),
  start: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  resize: vi.fn(),
};

vi.mock("@/lib/lenis/initLenis", () => ({
  initLenis: vi.fn(() => mockLenis),
  destroyLenis: vi.fn(),
}));

describe("LenisProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children", () => {
    render(
      <LenisProvider>
        <div>child content</div>
      </LenisProvider>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("provides the Lenis instance through context", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <LenisProvider>{children}</LenisProvider>;

    const { result } = renderHook(() => useLenis(), { wrapper });

    await waitFor(() => {
      expect(result.current.lenis).toBe(mockLenis);
    });
  });

  it("stop() calls lenis.stop()", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <LenisProvider>{children}</LenisProvider>;
    const { result } = renderHook(() => useLenis(), { wrapper });

    await waitFor(() => {
      expect(result.current.lenis).toBe(mockLenis);
    });

    act(() => {
      result.current.stop();
    });

    expect(mockLenis.stop).toHaveBeenCalledTimes(1);
  });

  it("start() calls lenis.start()", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <LenisProvider>{children}</LenisProvider>;
    const { result } = renderHook(() => useLenis(), { wrapper });

    await waitFor(() => {
      expect(result.current.lenis).toBe(mockLenis);
    });

    act(() => {
      result.current.start();
    });

    expect(mockLenis.start).toHaveBeenCalledTimes(1);
  });

  it("destroys Lenis on unmount", () => {
    const { unmount } = render(
      <LenisProvider>
        <div>child content</div>
      </LenisProvider>,
    );

    unmount();

    expect(initLenis).toHaveBeenCalledTimes(1);
    expect(destroyLenis).toHaveBeenCalledWith(mockLenis);
  });
});
