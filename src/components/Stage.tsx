"use client";

import { useState } from "react";
import { ProgressBar } from "@/components/ProgressBar";
import { ScrubStage } from "@/components/ScrubStage";
import { SectionStage } from "@/components/SectionStage";
import { SemanticLayer } from "@/components/SemanticLayer";
import { SkipToContent } from "@/components/SkipToContent";
import { SnapStage } from "@/components/SnapStage";
import type { StorySchema } from "@/lib/schemas/story";
import { resolveTransitionMode } from "@/lib/stage/resolveTransitionMode";

export interface StageProps {
  story: StorySchema;
}

export function Stage({ story }: StageProps) {
  const mode = resolveTransitionMode(story);
  const [currentIndex] = useState(0);
  const progress = story.scenes.length > 1 ? currentIndex / (story.scenes.length - 1) : 0;

  return (
    <>
      <SkipToContent targetId="main-stage" />
      <div id="main-stage">
        {mode === "snap" && <SnapStage story={story} />}
        {mode === "scrub" && <ScrubStage story={story} />}
        {mode === "section" && <SectionStage story={story} />}
        {!(["snap", "scrub", "section"] as const).includes(mode) && <SectionStage story={story} />}
      </div>
      <SemanticLayer scenes={story.scenes} currentIndex={currentIndex} />
      <ProgressBar progress={progress} sceneCount={story.scenes.length} currentIndex={currentIndex} />
    </>
  );
}
