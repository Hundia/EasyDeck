"use client";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ImageSequenceCanvas } from "./ImageSequenceCanvas";
import { Pagination } from "./Pagination";
import { usePlayhead } from "@/lib/hooks/usePlayhead";
import type { StorySchema } from "@/lib/schemas/story";
import { buildSnapConfig } from "@/lib/snap/buildSnapConfig";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SnapStageProps {
  story: StorySchema;
}

export function SnapStage({ story }: SnapStageProps) {
  const { scenes, transition } = story;
  const playhead = usePlayhead(scenes[0].startFrame);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        start: "top top",
        end: () => `+=${scenes.length * window.innerHeight * 1.2}`,
        scrub: 1,
        snap: buildSnapConfig(transition, reducedMotion),
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const sceneIndex = Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length));
          setCurrentIndex(sceneIndex);
        },
      },
    });

    scenes.forEach((scene, i) => {
      tl.addLabel(scene.id, i);

      tl.to(
        playhead.current,
        {
          frame: scene.endFrame,
          ease: "none",
          duration: 1,
        },
        i,
      );

      if (scene.overlays && scene.overlays.length > 0 && overlayRefs.current[i]) {
        const overlayEl = overlayRefs.current[i];
        if (overlayEl) {
          const firstOverlay = scene.overlays[0];
          const enterAt = firstOverlay?.enterAt ?? 0;
          const exitAt = firstOverlay?.exitAt ?? 1;

          tl.fromTo(
            overlayEl,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3, ease: "power2.inOut" },
            i + enterAt,
          );
          tl.to(
            overlayEl,
            { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" },
            i + exitAt - 0.3,
          );
        }
      }
    });

    tl.addLabel("end", scenes.length);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [scenes, transition, playhead]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden">
      <ImageSequenceCanvas
        playhead={playhead}
        pattern={scenes[0].imageSequence.pattern}
        frameCount={scenes.reduce((max, s) => Math.max(max, s.endFrame), 0)}
      />
      {scenes.map((scene, i) => (
        <div
          key={scene.id}
          ref={(el) => {
            overlayRefs.current[i] = el;
          }}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          {scene.overlays?.map((overlay) => (
            <div key={overlay.id} className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-2xl">{overlay.content}</span>
            </div>
          ))}
        </div>
      ))}
      {transition.showPagination && <Pagination sceneCount={scenes.length} currentIndex={currentIndex} />}
    </div>
  );
}
