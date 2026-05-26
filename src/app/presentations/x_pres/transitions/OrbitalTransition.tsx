"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { VideoTransitionProps } from "./types";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>?/\\|";

function randomChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function scrambleString(target: string, progress: number): string {
  return target
    .split("")
    .map((ch, i) => {
      if (ch === " ") return " ";
      // reveal characters left-to-right as progress increases
      if (i < Math.floor(progress * target.length)) return ch;
      return randomChar();
    })
    .join("");
}

const MOTES = [
  { color: "#00D4FF", size: 4, speed: 2.2, leftPct: 12, topPct: 25 },
  { color: "#FFB830", size: 3, speed: 1.8, leftPct: 28, topPct: 55 },
  { color: "#00D4FF", size: 2, speed: 2.5, leftPct: 45, topPct: 35 },
  { color: "#00D4FF", size: 3, speed: 2.0, leftPct: 62, topPct: 70 },
  { color: "#FFB830", size: 4, speed: 1.6, leftPct: 75, topPct: 20 },
  { color: "#00D4FF", size: 2, speed: 2.8, leftPct: 85, topPct: 60 },
  { color: "#FFB830", size: 3, speed: 2.3, leftPct: 38, topPct: 80 },
  { color: "#00D4FF", size: 2, speed: 1.9, leftPct: 92, topPct: 42 },
];

export default function OrbitalTransition({
  fromScene,
  toScene,
  direction,
  prevVideoRef,
  currentVideoRef,
  onVideoSwitch,
  onComplete,
}: VideoTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const outgoingShellRef = useRef<HTMLDivElement>(null);
  const incomingShellRef = useRef<HTMLDivElement>(null);

  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const scrambleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrambleStartRef = useRef<number>(0);

  const [showMotes, setShowMotes] = useState(false);
  const [showBrackets, setShowBrackets] = useState(true);
  const [bracketsLocked, setBracketsLocked] = useState(false);
  const [hudLabel, setHudLabel] = useState(fromScene.hudLabel);
  const [rimFlash, setRimFlash] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      onVideoSwitch();
      const t = setTimeout(() => onComplete(), 200);
      return () => clearTimeout(t);
    }

    const container = containerRef.current;
    const scanline = scanlineRef.current;
    const outShell = outgoingShellRef.current;
    const inShell = incomingShellRef.current;

    if (!container || !scanline || !outShell || !inShell) return;

    // ── PRE-DROP initial states ──────────────────────────────────────
    gsap.set(container, { y: 0 });
    gsap.set(scanline, { y: 0, opacity: 1 });
    gsap.set(outShell, {
      rotateX: 0,
      scale: 1,
      translateZ: 0,
      opacity: 1,
    });
    gsap.set(inShell, {
      rotateX: 18,
      translateZ: -3000,
      opacity: 0.2,
    });

    const tl = gsap.timeline();
    tlRef.current = tl;

    // ── PHASE 1: 0-250ms — PRE-DROP ─────────────────────────────────
    // Compress outgoing container into slight 3D tilt
    tl.to(
      outShell,
      {
        duration: 0.25,
        rotateX: 8,
        scale: 0.96,
        ease: "power2.out",
      },
      0
    );

    // Scanline sweeps top→bottom
    tl.to(
      scanline,
      {
        duration: 0.25,
        y: "100vh",
        ease: "none",
        onComplete: () => {
          gsap.set(scanline, { opacity: 0 });
        },
      },
      0
    );

    // Show motes at start of drop
    tl.call(() => setShowMotes(true), [], 0.25);

    // ── PHASE 2: 250-850ms — THE DROP ───────────────────────────────
    // Outgoing shell exits: translateZ(-1800) rotateX(-12) opacity(0) blur(10px)
    tl.to(
      outShell,
      {
        duration: 0.6,
        rotateX: -12,
        translateZ: -1800,
        opacity: 0,
        filter: "blur(10px)",
        ease: "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      0.25
    );

    // Incoming shell rises into view
    tl.to(
      inShell,
      {
        duration: 0.6,
        rotateX: 0,
        translateZ: 0,
        opacity: 0,
        ease: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      0.25
    );

    // Call onVideoSwitch at 600ms (350ms into the drop phase)
    tl.call(() => onVideoSwitch(), [], 0.6);

    // ── PHASE 3: 850-1200ms — IMPACT & SETTLE ───────────────────────
    // Camera shake — quick y bounce
    tl.call(
      () => {
        if (!container) return;
        gsap
          .to(container, { y: 6, duration: 0.08, ease: "power2.out" })
          .then(() =>
            gsap
              .to(container, { y: -3, duration: 0.08, ease: "power2.inOut" })
              .then(() =>
                gsap.to(container, { y: 0, duration: 0.12, ease: "power2.out" })
              )
          );
      },
      [],
      0.85
    );

    // HUD brackets snap inward + rim-light flash
    tl.call(
      () => {
        setBracketsLocked(true);
        setRimFlash(true);
        setTimeout(() => setRimFlash(false), 200);
      },
      [],
      0.95
    );

    // ── PHASE 4: 1200-1400ms — LOCK-IN ──────────────────────────────
    // HUD label scramble starts at 1200ms, resolves 200ms later
    tl.call(
      () => {
        scrambleStartRef.current = performance.now();
        const target = toScene.hudLabel;

        scrambleIntervalRef.current = setInterval(() => {
          const elapsed = performance.now() - scrambleStartRef.current;
          const progress = Math.min(elapsed / 200, 1);
          setHudLabel(scrambleString(target, progress));

          if (progress >= 1) {
            if (scrambleIntervalRef.current) {
              clearInterval(scrambleIntervalRef.current);
              scrambleIntervalRef.current = null;
            }
            setHudLabel(target);
          }
        }, 30);
      },
      [],
      1.2
    );

    // onComplete at 1400ms
    tl.call(() => onComplete(), [], 1.4);

    return () => {
      tl.kill();
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        perspective: "1200px",
        perspectiveOrigin: "50% 45%",
        transformStyle: "preserve-3d",
        position: "fixed",
        inset: 0,
        zIndex: 48,
        pointerEvents: "none",
        willChange: "transform",
      }}
    >
      {/* ── Outgoing scene shell (dark glass) ── */}
      <div
        ref={outgoingShellRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(13,17,23,0.6)",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity, filter",
        }}
      />

      {/* ── Incoming scene shell (subtle reveal) ── */}
      <div
        ref={incomingShellRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(13,17,23,0.0)",
          transformStyle: "preserve-3d",
          willChange: "transform, opacity",
        }}
      />

      {/* ── Scanline sweep ── */}
      <div
        ref={scanlineRef}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 1,
          background: "#00D4FF",
          boxShadow: "0 0 12px 3px #00D4FF, 0 0 40px 8px rgba(0,212,255,0.4)",
          willChange: "transform",
          zIndex: 2,
        }}
      />

      {/* ── Parallax motes (hyperspace streaks) ── */}
      {showMotes &&
        MOTES.map((m, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: m.size,
              height: m.size,
              borderRadius: "50%",
              background: m.color,
              boxShadow: `0 0 ${m.size * 3}px ${m.color}`,
              left: `${m.leftPct}%`,
              top: `${m.topPct}%`,
              willChange: "transform, opacity",
              zIndex: 3,
            }}
            initial={{ opacity: 0, z: 0 }}
            animate={{
              opacity: [0, 1, 0],
              z: [0, 2000 * m.speed],
            }}
            transition={{
              duration: 0.7,
              ease: "easeIn",
              delay: i * 0.04,
            }}
          />
        ))}

      {/* ── HUD Corner Brackets ── */}
      {showBrackets && (
        <>
          {/* Top-left bracket */}
          <motion.div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              width: 28,
              height: 28,
              borderTop: "2px solid #00D4FF",
              borderLeft: "2px solid #00D4FF",
              willChange: "transform, opacity",
              zIndex: 4,
              boxShadow: rimFlash ? "0 0 16px 4px #00D4FF" : "none",
              transition: "box-shadow 0.1s ease",
            }}
            initial={{ x: -20, y: -20, opacity: 0 }}
            animate={
              bracketsLocked
                ? { x: 0, y: 0, opacity: 1 }
                : { x: -20, y: -20, opacity: 0 }
            }
            transition={
              bracketsLocked
                ? { duration: 0.12, ease: [0.7, 0, 0.84, 0] }
                : { duration: 0.25, ease: "easeOut" }
            }
          />

          {/* Top-right bracket */}
          <motion.div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              width: 28,
              height: 28,
              borderTop: "2px solid #00D4FF",
              borderRight: "2px solid #00D4FF",
              willChange: "transform, opacity",
              zIndex: 4,
              boxShadow: rimFlash ? "0 0 16px 4px #00D4FF" : "none",
              transition: "box-shadow 0.1s ease",
            }}
            initial={{ x: 20, y: -20, opacity: 0 }}
            animate={
              bracketsLocked
                ? { x: 0, y: 0, opacity: 1 }
                : { x: 20, y: -20, opacity: 0 }
            }
            transition={
              bracketsLocked
                ? { duration: 0.12, ease: [0.7, 0, 0.84, 0] }
                : { duration: 0.25, ease: "easeOut" }
            }
          />

          {/* Bottom-left bracket */}
          <motion.div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              width: 28,
              height: 28,
              borderBottom: "2px solid #00D4FF",
              borderLeft: "2px solid #00D4FF",
              willChange: "transform, opacity",
              zIndex: 4,
              boxShadow: rimFlash ? "0 0 16px 4px #00D4FF" : "none",
              transition: "box-shadow 0.1s ease",
            }}
            initial={{ x: -20, y: 20, opacity: 0 }}
            animate={
              bracketsLocked
                ? { x: 0, y: 0, opacity: 1 }
                : { x: -20, y: 20, opacity: 0 }
            }
            transition={
              bracketsLocked
                ? { duration: 0.12, ease: [0.7, 0, 0.84, 0] }
                : { duration: 0.25, ease: "easeOut" }
            }
          />

          {/* Bottom-right bracket */}
          <motion.div
            style={{
              position: "absolute",
              bottom: 24,
              right: 24,
              width: 28,
              height: 28,
              borderBottom: "2px solid #00D4FF",
              borderRight: "2px solid #00D4FF",
              willChange: "transform, opacity",
              zIndex: 4,
              boxShadow: rimFlash ? "0 0 16px 4px #00D4FF" : "none",
              transition: "box-shadow 0.1s ease",
            }}
            initial={{ x: 20, y: 20, opacity: 0 }}
            animate={
              bracketsLocked
                ? { x: 0, y: 0, opacity: 1 }
                : { x: 20, y: 20, opacity: 0 }
            }
            transition={
              bracketsLocked
                ? { duration: 0.12, ease: [0.7, 0, 0.84, 0] }
                : { duration: 0.25, ease: "easeOut" }
            }
          />
        </>
      )}

      {/* ── HUD Label (scramble → resolve) ── */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "monospace",
          fontSize: 12,
          letterSpacing: "0.18em",
          color: "#00D4FF",
          textShadow: "0 0 10px rgba(0,212,255,0.9)",
          opacity: 0.95,
          userSelect: "none",
          zIndex: 5,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ opacity: 0.5, fontSize: 9, display: "block", marginBottom: 3, textAlign: "center" }}>
          THEATER
        </span>
        {hudLabel}
      </div>

      {/* ── Rim-light flash overlay ── */}
      {rimFlash && (
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            border: "1px solid rgba(0,212,255,0.7)",
            boxShadow: "inset 0 0 40px 8px rgba(0,212,255,0.25)",
            pointerEvents: "none",
            zIndex: 6,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.2 }}
        />
      )}
    </div>
  );
}
