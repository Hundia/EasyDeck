"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "./LenisProvider";

export function useLenisScrollTriggerSync(): void {
  const { lenis } = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }

    const onScroll = () => {
      ScrollTrigger.update();
    };

    const onResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    lenis.on("scroll", onScroll);
    window.addEventListener("resize", onResize);

    return () => {
      lenis.off("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [lenis]);
}
