"use client";

import { useEffect } from "react";
import { useLenis } from "./LenisProvider";

export function useLenisPause(): void {
  const { lenis } = useLenis();

  useEffect(() => {
    if (!lenis) {
      return;
    }

    lenis.stop();

    return () => {
      lenis.start();
    };
  }, [lenis]);
}
