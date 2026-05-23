"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { ImageSequenceCanvas } from "./ImageSequenceCanvas";
import { Pagination } from "./Pagination";
import { usePlayhead } from "@/lib/hooks/usePlayhead";
import { useLenisPause } from "@/lib/lenis/useLenisPause";
import { computeNextIndex } from "@/lib/section/gotoScene";
import type { StorySchema } from "@/lib/schemas/story";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer);
}

export interface SectionStageProps {
  story: StorySchema;
}

export function SectionStage({ story }: SectionStageProps) {
  const { scenes, transition } = story;

  const playhead = usePlayhead(scenes[0].startFrame);
  const [currentIndex, setCurrentIndex] = useState(0);

  useLenisPause();
  // Ref copy so callbacks never capture stale closures
  const currentIndexRef = useRef(0);
  const animating = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);

  const updateCurrentIndex = useCallback((idx: number) => {
    currentIndexRef.current = idx;
    setCurrentIndex(idx);
  }, []);

  const getEffectiveDuration = useCallback(() => {
    if (typeof window === "undefined") return transition.duration;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    return mq.matches ? 0.01 : transition.duration;
  }, [transition.duration]);

  const gotoScene = useCallback(
    (targetIndex: number, direction: 1 | -1) => {
      if (animating.current) return;

      const idx = currentIndexRef.current;
      const nextIndex = computeNextIndex(idx, targetIndex, scenes.length, transition.wrapEnabled);

      // No-op when already at the boundary and wrap is disabled
      if (nextIndex === idx) return;

      const duration = getEffectiveDuration();
      // Animate to the outgoing scene's boundary frame
      const targetFrame = direction > 0 ? scenes[idx].endFrame : scenes[idx].startFrame;

      animating.current = true;

      const tl = gsap.timeline({
        onComplete: () => {
          animating.current = false;
          playhead.current.frame = scenes[nextIndex].startFrame;
          updateCurrentIndex(nextIndex);
        },
      });

      // Tween the playhead to the scene boundary
      tl.to(playhead.current, {
        frame: targetFrame,
        duration,
        ease: transition.ease,
      });

      // Cross-fade overlays
      const outOverlay = overlayRefs.current[idx];
      const inOverlay = overlayRefs.current[nextIndex];
      if (outOverlay) {
        tl.to(outOverlay, { autoAlpha: 0, duration: duration * 0.5 }, 0);
      }
      if (inOverlay) {
        tl.fromTo(inOverlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: duration * 0.5 }, duration * 0.5);
      }
    },
    [scenes, transition.wrapEnabled, transition.ease, playhead, getEffectiveDuration, updateCurrentIndex],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!transition.enableKeyboard) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const idx = currentIndexRef.current;
      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          e.preventDefault();
          gotoScene(idx + 1, 1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          gotoScene(idx - 1, -1);
          break;
        case "Home":
          e.preventDefault();
          gotoScene(0, -1);
          break;
        case "End":
          e.preventDefault();
          gotoScene(scenes.length - 1, 1);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [gotoScene, scenes.length, transition.enableKeyboard]);

  // GSAP Observer for wheel / touch / pointer gestures
  useEffect(() => {
    const observer = Observer.create({
      target: containerRef.current ?? window,
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      tolerance: transition.tolerance,
      preventDefault: true,
      onDown: () => gotoScene(currentIndexRef.current - 1, -1),
      onUp: () => gotoScene(currentIndexRef.current + 1, 1),
    });

    return () => observer.kill();
  }, [gotoScene, transition.tolerance]);

  const activeScene = scenes[currentIndex] ?? scenes[0];

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <ImageSequenceCanvas
        playhead={playhead}
        pattern={activeScene.imageSequence.pattern}
        frameCount={activeScene.imageSequence.frameCount}
      />

      {/* Per-scene overlay layers — autoAlpha managed by GSAP */}
      {scenes.map((scene, i) => (
        <div
          key={scene.id}
          ref={(el) => {
            overlayRefs.current[i] = el;
          }}
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: i === currentIndex ? 1 : 0,
            visibility: (i === currentIndex ? "visible" : "hidden") as "visible" | "hidden",
          }}
        />
      ))}

      {transition.showPagination && (
        <Pagination
          sceneCount={scenes.length}
          currentIndex={currentIndex}
          onDotClick={(i) => gotoScene(i, i > currentIndexRef.current ? 1 : -1)}
        />
      )}
    </div>
  );
}
