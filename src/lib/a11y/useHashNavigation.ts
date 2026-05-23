import { useCallback, useRef } from "react";

export interface HashNavigationResult {
  initialIndex: number;
  updateHash: (index: number) => void;
}

/**
 * URL hash persistence for scene deep-linking.
 * Writes #scene-{N} on change, reads on mount.
 */
export function useHashNavigation(): HashNavigationResult {
  const initialIndex = useRef(0);

  if (typeof window !== "undefined") {
    const match = window.location.hash.match(/^#scene-(\d+)$/);
    if (match) {
      initialIndex.current = parseInt(match[1], 10);
    }
  }

  const updateHash = useCallback((index: number) => {
    if (typeof window === "undefined") {
      return;
    }

    window.history.replaceState(null, "", `#scene-${index}`);
  }, []);

  return {
    initialIndex: initialIndex.current,
    updateHash,
  };
}
