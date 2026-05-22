"use client";
import { useRef, useEffect, useState, type MutableRefObject } from "react";
import { gsap } from "gsap";
import type { Playhead } from "@/lib/types/playhead";
import { preloadFrames, type ProgressCallback } from "@/lib/canvas/preloader";
import { computeCanvasDimensions, applyCanvasDimensions } from "@/lib/canvas/sizing";
import { clampFrame } from "@/lib/canvas/clamp";

export interface ImageSequenceCanvasProps {
  playhead: MutableRefObject<Playhead>;
  pattern: string;
  frameCount: number;
  onProgress?: ProgressCallback;
  className?: string;
}

export function ImageSequenceCanvas({
  playhead,
  pattern,
  frameCount,
  onProgress,
  className = "absolute inset-0 h-full w-full",
}: ImageSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastDrawnFrame = useRef<number>(-1);

  // Preload frames
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    preloadFrames(pattern, frameCount, (progress) => {
      if (!cancelled) onProgress?.(progress);
    }).then((images) => {
      if (!cancelled) {
        imagesRef.current = images;
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pattern, frameCount, onProgress]);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dims = computeCanvasDimensions(parent.clientWidth, parent.clientHeight);
      applyCanvasDimensions(canvas, dims);
      // Force redraw after resize
      lastDrawnFrame.current = -1;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);

    return () => observer.disconnect();
  }, []);

  // GSAP ticker draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const frameIdx = clampFrame(playhead.current.frame, frameCount);
      // Skip redundant draws
      if (frameIdx === lastDrawnFrame.current) return;

      const img = imagesRef.current[frameIdx];
      if (img) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        lastDrawnFrame.current = frameIdx;
      }
    };

    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
    };
  }, [playhead, frameCount]);

  return <canvas ref={canvasRef} className={className} />;
}
