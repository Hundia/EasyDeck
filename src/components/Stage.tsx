"use client";
import type { StorySchema } from "@/lib/schemas/story";
import { resolveTransitionMode } from "@/lib/stage/resolveTransitionMode";
import { SectionStage } from "@/components/SectionStage";
import { SnapStage } from "@/components/SnapStage";
import { ScrubStage } from "@/components/ScrubStage";

export interface StageProps {
  story: StorySchema;
}

export function Stage({ story }: StageProps) {
  const mode = resolveTransitionMode(story);

  switch (mode) {
    case "snap":
      return <SnapStage story={story} />;
    case "scrub":
      return <ScrubStage story={story} />;
    case "section":
    default:
      return <SectionStage story={story} />;
  }
}
