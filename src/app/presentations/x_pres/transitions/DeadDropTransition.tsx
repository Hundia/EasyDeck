"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { VideoTransitionProps } from "./types";

export default function DeadDropTransition({
  fromScene,
  toScene,
  direction,
  prevVideoRef,
  currentVideoRef,
  onVideoSwitch,
  onComplete,
}: VideoTransitionProps) {
  const beamRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const rChannelRef = useRef<HTMLDivElement>(null);
  const bChannelRef = useRef<HTMLDivElement>(null);
  const [coordText, setCoordText] = useState("4F 2A 8C D1 93 7E");
  const [showFlare, setShowFlare] = useState(false);
  const [flareStyle] = useState(() => ({
    top: Math.random() > 0.5 ? 0 : ("auto" as const),
    bottom: Math.random() > 0.5 ? 0 : ("auto" as const),
    left: Math.random() > 0.5 ? 0 : ("auto" as const),
    right: Math.random() > 0.5 ? 0 : ("auto" as const),
  }));

  const coordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const randomHex = () => {
    const bytes = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .toUpperCase()
        .padStart(2, "0")
    );
    return bytes.join(" ");
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      const t = setTimeout(() => {
        onVideoSwitch();
        onComplete();
      }, 300);
      return () => clearTimeout(t);
    }

    const prevVideoEl = prevVideoRef.current;
    const currentVideoEl = currentVideoRef.current;
    const beamEl = beamRef.current;
    const trailEl = trailRef.current;
    const rEl = rChannelRef.current;
    const bEl = bChannelRef.current;

    if (!prevVideoEl || !currentVideoEl || !beamEl || !trailEl) return;

    const vh = window.innerHeight;

    // Set initial states
    gsap.set(beamEl, { y: -2 });
    gsap.set(trailEl, { y: -2 });

    if (rEl) {
      gsap.set(rEl, { x: 0, opacity: 0 });
    }
    if (bEl) {
      gsap.set(bEl, { x: 0, opacity: 0 });
    }

    // currentVideo starts blurry/dark, no clip yet
    currentVideoEl.style.clipPath = `inset(${vh}px 0 0 0)`;
    currentVideoEl.style.filter = "blur(8px) brightness(0.4)";
    prevVideoEl.style.clipPath = "";
    prevVideoEl.style.filter = "saturate(1) contrast(1)";

    const tl = gsap.timeline();
    tlRef.current = tl;

    // PHASE 1: 0-180ms — LOSS: degrade prevVideo filter + chromatic aberration onset
    tl.to(
      prevVideoEl,
      {
        duration: 0.18,
        ease: "none",
        onStart: () => {
          prevVideoEl.style.transition = "none";
        },
        onUpdate: function () {
          const p = this.progress();
          const sat = 1 - 0.7 * p;
          const con = 1 + 0.3 * p;
          prevVideoEl.style.filter = `saturate(${sat}) contrast(${con})`;
        },
      },
      0
    );

    // Chromatic aberration channels appear
    if (rEl && bEl) {
      tl.to(
        rEl,
        {
          duration: 0.18,
          opacity: 0.6,
          x: -6,
          ease: "power1.in",
        },
        0
      );
      tl.to(
        bEl,
        {
          duration: 0.18,
          opacity: 0.6,
          x: 6,
          ease: "power1.in",
        },
        0
      );
    }

    // PHASE 2: 180-560ms — CORRIDOR: scan beam sweeps top→bottom
    tl.to(
      beamEl,
      {
        duration: 0.38,
        y: vh + 2,
        ease: "power1.inOut",
        onStart: () => {
          beamEl.style.opacity = "1";
          trailEl.style.opacity = "1";
        },
        onUpdate: function () {
          const beamY = gsap.getProperty(beamEl, "y") as number;
          trailEl.style.transform = `translateY(${beamY}px)`;
          prevVideoEl.style.clipPath = `inset(0 0 ${Math.max(0, vh - beamY)}px 0)`;
          currentVideoEl.style.clipPath = `inset(${Math.max(0, beamY)}px 0 0 0)`;
        },
        onComplete: () => {
          prevVideoEl.style.clipPath = `inset(0 0 ${vh}px 0)`;
          currentVideoEl.style.clipPath = "";
        },
      },
      0.18
    );

    // Call onVideoSwitch at ~400ms (220ms into phase 2)
    tl.call(
      () => {
        onVideoSwitch();
      },
      [],
      0.4
    );

    // PHASE 3: 560-1080ms — LOCK: new scene filter recovery
    tl.to(
      currentVideoEl,
      {
        duration: 0.52,
        ease: "power2.out",
        onUpdate: function () {
          const p = this.progress();
          const blurVal = 8 * (1 - p);
          const bright = 0.4 + 0.6 * p;
          currentVideoEl.style.filter = `blur(${blurVal}px) brightness(${bright})`;
        },
        onComplete: () => {
          currentVideoEl.style.filter = "";
        },
      },
      0.56
    );

    // Coordinate readout scramble starts at 560ms
    tl.call(
      () => {
        coordIntervalRef.current = setInterval(() => {
          setCoordText(randomHex());
        }, 33); // ~30fps
      },
      [],
      0.56
    );

    // Coord readout resolves at 900ms
    tl.call(
      () => {
        if (coordIntervalRef.current) {
          clearInterval(coordIntervalRef.current);
          coordIntervalRef.current = null;
        }
        setCoordText(toScene.dataLine || "SECTOR: CLASSIFIED");
      },
      [],
      0.9
    );

    // PHASE 4: 1080-1200ms — RESIDUAL
    // Film flare at ~1100ms
    tl.call(
      () => {
        setShowFlare(true);
      },
      [],
      1.1
    );

    // RGB channels retract
    if (rEl && bEl) {
      tl.to(
        rEl,
        {
          duration: 0.12,
          opacity: 0,
          x: 0,
          ease: "power1.in",
        },
        1.08
      );
      tl.to(
        bEl,
        {
          duration: 0.12,
          opacity: 0,
          x: 0,
          ease: "power1.in",
        },
        1.08
      );
    }

    // onComplete at 1200ms
    tl.call(
      () => {
        onComplete();
      },
      [],
      1.2
    );

    return () => {
      tl.kill();
      if (coordIntervalRef.current) {
        clearInterval(coordIntervalRef.current);
      }
      // Cleanup: reset all styles on video elements
      if (prevVideoRef.current) {
        prevVideoRef.current.style.clipPath = "";
        prevVideoRef.current.style.filter = "";
        prevVideoRef.current.style.transition = "";
      }
      if (currentVideoRef.current) {
        currentVideoRef.current.style.clipPath = "";
        currentVideoRef.current.style.filter = "";
        currentVideoRef.current.style.transition = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      {/* SVG filters for chromatic aberration */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="dd-red">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="dd-blue">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      {/* Red channel overlay for chromatic aberration */}
      <div
        ref={rChannelRef}
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "inherit",
          filter: "url(#dd-red)",
          mixBlendMode: "screen",
          opacity: 0,
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
      />

      {/* Blue channel overlay for chromatic aberration */}
      <div
        ref={bChannelRef}
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "inherit",
          filter: "url(#dd-blue)",
          mixBlendMode: "screen",
          opacity: 0,
          pointerEvents: "none",
          willChange: "transform, opacity",
        }}
      />

      {/* Phosphor trail — follows beam, slightly below */}
      <div
        ref={trailRef}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          height: 80,
          background:
            "linear-gradient(to bottom, rgba(0,212,255,0.3) 0%, transparent 100%)",
          opacity: 0,
          pointerEvents: "none",
          willChange: "transform",
        }}
      />

      {/* Scan beam */}
      <div
        ref={beamRef}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          top: 0,
          height: 2,
          background: "#00D4FF",
          boxShadow:
            "0 0 24px 4px #00D4FF, 0 0 80px 12px rgba(0,212,255,0.4)",
          opacity: 0,
          pointerEvents: "none",
          willChange: "transform",
        }}
      />

      {/* Coordinate readout */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          fontFamily: "monospace",
          fontSize: 11,
          letterSpacing: "0.12em",
          color: "#00D4FF",
          textShadow: "0 0 8px rgba(0,212,255,0.8)",
          opacity: 0.9,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <div style={{ marginBottom: 2, opacity: 0.5, fontSize: 9 }}>
          UPLINK COORD
        </div>
        <div>{coordText}</div>
      </div>

      {/* Film flare — warm amber pulse in random corner */}
      {showFlare && (
        <motion.div
          style={{
            position: "fixed",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,184,48,0.35) 0%, transparent 70%)",
            ...flareStyle,
            pointerEvents: "none",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 0.2 }}
        />
      )}
    </div>
  );
}
