import { useRef, type MutableRefObject } from "react";
import type { Playhead } from "@/lib/types/playhead";

export function usePlayhead(initialFrame = 0): MutableRefObject<Playhead> {
  return useRef<Playhead>({ frame: initialFrame });
}
