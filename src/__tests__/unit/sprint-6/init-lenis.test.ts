import { beforeEach, describe, expect, it, vi } from "vitest";
import { destroyLenis, initLenis } from "@/lib/lenis/initLenis";
import type Lenis from "lenis";

vi.mock("lenis", () => ({
  default: vi.fn().mockImplementation(() => ({
    raf: vi.fn(),
    destroy: vi.fn(),
    stop: vi.fn(),
    start: vi.fn(),
  })),
}));

vi.mock("gsap", () => ({
  gsap: {
    ticker: {
      add: vi.fn(),
      remove: vi.fn(),
      lagSmoothing: vi.fn(),
    },
  },
}));

type LenisWithTickerCallback = Lenis & {
  __gsapTickerCallback?: (time: number) => void;
};

describe("initLenis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a Lenis instance", async () => {
    const { default: LenisCtor } = await import("lenis");

    const lenis = initLenis();

    expect(LenisCtor).toHaveBeenCalledTimes(1);
    expect(lenis).toBeDefined();
  });

  it("disables GSAP lag smoothing", async () => {
    const { gsap } = await import("gsap");

    initLenis();

    expect(gsap.ticker.lagSmoothing).toHaveBeenCalledWith(0);
  });

  it("adds a callback to the GSAP ticker", async () => {
    const { gsap } = await import("gsap");

    const lenis = initLenis() as LenisWithTickerCallback;

    expect(gsap.ticker.add).toHaveBeenCalledTimes(1);
    expect(gsap.ticker.add).toHaveBeenCalledWith(lenis.__gsapTickerCallback);
    expect(lenis.__gsapTickerCallback).toEqual(expect.any(Function));
  });

  it("removes the ticker callback and destroys Lenis", async () => {
    const { gsap } = await import("gsap");

    const lenis = initLenis() as LenisWithTickerCallback;
    const destroySpy = vi.mocked(lenis.destroy);

    destroyLenis(lenis);

    expect(gsap.ticker.remove).toHaveBeenCalledWith(lenis.__gsapTickerCallback);
    expect(destroySpy).toHaveBeenCalledTimes(1);
  });
});
