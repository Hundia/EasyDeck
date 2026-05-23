import Lenis from "lenis";
import { gsap } from "gsap";

export interface LenisOptions {
  duration?: number;
  easing?: (t: number) => number;
  syncTouch?: boolean;
  touchMultiplier?: number;
}

type LenisWithTickerCallback = Lenis & {
  __gsapTickerCallback?: (time: number) => void;
};

export function initLenis(options?: LenisOptions): Lenis {
  const lenis = new Lenis({
    duration: options?.duration ?? 1.2,
    easing: options?.easing ?? ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
    syncTouch: options?.syncTouch ?? true,
    touchMultiplier: options?.touchMultiplier ?? 2,
  }) as LenisWithTickerCallback;

  gsap.ticker.lagSmoothing(0);

  const tickerCallback = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tickerCallback);
  lenis.__gsapTickerCallback = tickerCallback;

  return lenis;
}

export function destroyLenis(lenis: Lenis): void {
  const instance = lenis as LenisWithTickerCallback;

  if (instance.__gsapTickerCallback) {
    gsap.ticker.remove(instance.__gsapTickerCallback);
  }

  lenis.destroy();
}
