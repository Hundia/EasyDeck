"use client";

import type { SceneConfig } from "@/lib/schemas/scene";

export interface SemanticLayerProps {
  scenes: SceneConfig[];
  currentIndex: number;
}

/**
 * Visually hidden semantic content for screen readers.
 * Renders scene labels and overlay text so assistive tech can read content.
 */
export function SemanticLayer({ scenes, currentIndex }: SemanticLayerProps) {
  const currentScene = scenes[currentIndex];

  return (
    <div className="sr-only" aria-live="polite" aria-atomic="true">
      <h2>
        Scene {currentIndex + 1} of {scenes.length}: {currentScene?.label}
      </h2>
      {currentScene?.overlays?.map((overlay) => (
        <p key={overlay.id}>{overlay.content}</p>
      ))}
    </div>
  );
}
