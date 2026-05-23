"use client";
import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ImageSequenceCanvas } from "./ImageSequenceCanvas";
import { Pagination } from "./Pagination";
import { usePlayhead } from "@/lib/hooks/usePlayhead";
import type { StorySchema } from "@/lib/schemas/story";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrubStageProps {
  story: StorySchema;
}

export function ScrubStage({ story }: ScrubStageProps) {
  const { scenes, transition } = story;
  const totalFrames = Math.max(...scenes.map((scene) => scene.endFrame));
  const playhead = usePlayhead(scenes[0].startFrame);
  const [currentIndex, setCurrentIndex] = useState(0);
  const reducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current || reducedMotion) {
      playhead.current.frame = scenes[0].startFrame;
      setCurrentIndex(0);
      return;
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        start: "top top",
        end: () => `+=${scenes.length * window.innerHeight * 1.2}`,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          playhead.current.frame = Math.round(self.progress * totalFrames);
          const sceneIndex = Math.min(scenes.length - 1, Math.floor(self.progress * scenes.length));
          setCurrentIndex(sceneIndex);
        },
      },
    });

    scenes.forEach((scene, index) => {
      tl.addLabel(scene.id, index);

      if (scene.overlays.length > 0 && overlayRefs.current[index]) {
        const overlayEl = overlayRefs.current[index];
        if (overlayEl) {
          const firstOverlay = scene.overlays[0];
          const enterAt = firstOverlay?.enterAt ?? 0;
          const exitAt = firstOverlay?.exitAt ?? 1;

          tl.fromTo(
            overlayEl,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3, ease: "power2.inOut" },
            index + enterAt,
          );
          tl.to(
            overlayEl,
            { autoAlpha: 0, duration: 0.3, ease: "power2.inOut" },
            index + Math.max(0, exitAt - 0.3),
          );
        }
      }
    });

    tl.addLabel("end", scenes.length);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [playhead, reducedMotion, scenes, totalFrames]);

  return (
    <div ref={containerRef} className="relative h-screen w-screen overflow-hidden">
      <ImageSequenceCanvas
        playhead={playhead}
        pattern={scenes[0].imageSequence.pattern}
        frameCount={totalFrames}
      />
      {scenes.map((scene, index) => (
        <div
          key={scene.id}
          ref={(el) => {
            overlayRefs.current[index] = el;
          }}
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: reducedMotion && index === 0 ? 1 : 0,
            visibility: (reducedMotion && index === 0 ? "visible" : "hidden") as "visible" | "hidden",
          }}
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
