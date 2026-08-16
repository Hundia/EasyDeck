"use client";

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

export interface VideoBackgroundHandle {
  prevVideoEl: HTMLVideoElement | null;
  currentVideoEl: HTMLVideoElement | null;
  switchToCurrent: (src: string) => void;
  setPrevSrc: (src: string) => void;
  showPrev: (visible: boolean) => void;
}

interface Props {
  currentSrc: string;
  prevSrc: string;
  prevVisible: boolean;
  objectFit?: "cover" | "contain";
  muted?: boolean;
}

const VideoBackground = forwardRef<VideoBackgroundHandle, Props>(
  ({ currentSrc, prevSrc, prevVisible, objectFit = "cover", muted = true }, ref) => {
    const currentRef = useRef<HTMLVideoElement>(null);
    const prevRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
      get prevVideoEl() { return prevRef.current; },
      get currentVideoEl() { return currentRef.current; },
      switchToCurrent: (src: string) => {
        if (currentRef.current && currentRef.current.src !== src) {
          currentRef.current.src = src;
          currentRef.current.load();
          currentRef.current.play().catch(() => {});
        }
      },
      setPrevSrc: (src: string) => {
        if (prevRef.current) {
          prevRef.current.src = src;
          prevRef.current.load();
        }
      },
      showPrev: (visible: boolean) => {
        if (prevRef.current) {
          prevRef.current.style.opacity = visible ? "1" : "0";
        }
      },
    }));

    // Sync current video src
    useEffect(() => {
      const v = currentRef.current;
      if (!v) return;
      if (v.src !== new URL(currentSrc, window.location.href).href) {
        v.src = currentSrc;
        v.load();
        v.play().catch(() => {});
      }
    }, [currentSrc]);

    // Sync prev video src + visibility
    useEffect(() => {
      const v = prevRef.current;
      if (!v) return;
      if (prevSrc && v.src !== new URL(prevSrc, window.location.href).href) {
        v.src = prevSrc;
        v.load();
        v.play().catch(() => {});
      }
      v.style.opacity = prevVisible ? "1" : "0";
    }, [prevSrc, prevVisible]);

    return (
      <>
        {/* Previous video — outgoing scene, sits below current during transition */}
        <video
          ref={prevRef}
          className="x-pres-video-bg"
          muted
          playsInline
          loop
          style={{
            position: "absolute",
            inset: 0,
            width: "100vw",
            height: "100vh",
            objectFit: objectFit || "fill",
            objectPosition: "center center",
            zIndex: 1,
            opacity: prevVisible ? 1 : 0,
            transition: "none",
          }}
        />
        {/* Current video — incoming scene */}
        <video
          ref={currentRef}
          className="x-pres-video-bg"
          muted={muted}
          autoPlay
          playsInline
          loop
          style={{
            position: "absolute",
            inset: 0,
            width: "100vw",
            height: "100vh",
            objectFit: objectFit || "fill",
            objectPosition: "center center",
            zIndex: 2,
          }}
        />
      </>
    );
  }
);

VideoBackground.displayName = "VideoBackground";
export default VideoBackground;
