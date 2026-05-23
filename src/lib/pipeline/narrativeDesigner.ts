import type { ContentBrief } from "./schemas";
import type { TransitionMode } from "@/lib/schemas/transition";

export interface NarrativeScene {
  id: string;
  label: string;
  startFrame: number;
  endFrame: number;
  mode: TransitionMode;
  overlays: Array<{
    id: string;
    type: "text";
    content: string;
    enterAt: number;
    exitAt: number;
    position: "center";
  }>;
  transitionRationale: string;
}

export interface NarrativeOutput {
  title: string;
  slug: string;
  mode: TransitionMode;
  fps: number;
  imagePattern: string;
  scenes: NarrativeScene[];
}

export function designNarrative(brief: ContentBrief): NarrativeOutput {
  const fps = brief.fps;
  const globalMode: TransitionMode = brief.mode ?? "section";

  let currentFrame = 0;
  const scenes: NarrativeScene[] = brief.scenes.map((scene, index) => {
    const frameDuration = Math.round(scene.durationHint * fps);
    const startFrame = currentFrame;
    const endFrame = currentFrame + frameDuration;
    currentFrame = endFrame;

    const overlays: NarrativeScene["overlays"] = [];
    if (scene.overlayText) {
      overlays.push({
        id: `overlay-${index}-0`,
        type: "text",
        content: scene.overlayText,
        enterAt: 0.2,
        exitAt: 0.8,
        position: "center",
      });
    }

    return {
      id: `scene-${index}`,
      label: scene.label,
      startFrame,
      endFrame,
      mode: globalMode,
      overlays,
      transitionRationale: `Scene "${scene.label}" uses ${globalMode} mode. Duration: ${scene.durationHint}s (${frameDuration} frames at ${fps}fps).`,
    };
  });

  return {
    title: brief.title,
    slug: brief.slug,
    mode: globalMode,
    fps,
    imagePattern: brief.imagePattern,
    scenes,
  };
}
