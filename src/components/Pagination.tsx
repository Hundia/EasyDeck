"use client";
import { type ReactElement } from "react";

export interface PaginationProps {
  sceneCount: number;
  currentIndex: number;
  onDotClick?: (index: number) => void;
  className?: string;
}

export function Pagination({ sceneCount, currentIndex, onDotClick, className }: PaginationProps): ReactElement {
  return (
    <nav aria-label="scene navigation" className={className ?? "absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50"}>
      {Array.from({ length: sceneCount }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i === currentIndex ? "step" : undefined}
          aria-label={`Go to scene ${i + 1}`}
          onClick={() => onDotClick?.(i)}
          className={`w-3 h-3 rounded-full border border-white/50 transition-colors ${
            i === currentIndex ? "bg-white" : "bg-white/30"
          }`}
        />
      ))}
    </nav>
  );
}
