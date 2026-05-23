import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Enables ScrollTrigger.normalizeScroll on touch devices.
 * Provides consistent scroll behavior across devices.
 */
export function useNormalizeScroll(): void {
  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;

    if (isTouch) {
      ScrollTrigger.normalizeScroll(true);
    }

    return () => {
      ScrollTrigger.normalizeScroll(false);
    };
  }, []);
}
