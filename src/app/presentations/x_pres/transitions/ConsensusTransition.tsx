"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { VideoTransitionProps } from "./types";
import {
  initParticles,
  updateParticles,
  setHomePositions,
  positions,
  confidence,
  alpha,
  glyphIndex,
  getPhase,
  N,
} from "../lib/particles";
import { getGlyphAtlas } from "../lib/glyphAtlas";

// ---------------------------------------------------------------------------
// Radar arc configuration
// ---------------------------------------------------------------------------
interface ArcOrigin {
  getX: (W: number) => number;
  getY: (H: number) => number;
  delay: number; // ms
}

const ARC_ORIGINS: ArcOrigin[] = [
  { getX: ()  => -100,       getY: ()  => -100,      delay: 0   }, // NW
  { getX: (W) => W + 100,    getY: ()  => -100,      delay: 100 }, // NE
  { getX: (W) => W / 2,      getY: (H) => H + 100,   delay: 200 }, // S
];

const ARC_START  = 200;  // ms — arcs begin sweeping
const ARC_SWEEP  = 500;  // ms — full sweep duration per arc

function getArcRadius(elapsed: number, delay: number, W: number, H: number): number {
  const t = elapsed - ARC_START - delay;
  if (t <= 0) return 0;
  const progress = Math.min(t / ARC_SWEEP, 1);
  const diagonal = Math.sqrt(W * W + H * H) * 1.5;
  return progress * diagonal;
}

function drawArcs(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  W: number,
  H: number,
): void {
  if (elapsed < ARC_START) return;
  ctx.save();
  for (let a = 0; a < ARC_ORIGINS.length; a++) {
    const arc = ARC_ORIGINS[a];
    const radius = getArcRadius(elapsed, arc.delay, W, H);
    if (radius <= 0) continue;
    const ox = arc.getX(W);
    const oy = arc.getY(H);

    // Outer sweep ring
    ctx.beginPath();
    ctx.arc(ox, oy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0,212,255,${0.35 - a * 0.05})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Trailing glow ring (slightly smaller)
    if (radius > 20) {
      ctx.beginPath();
      ctx.arc(ox, oy, radius - 8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,212,255,0.12)`;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Compute which particles each arc has reached
// ---------------------------------------------------------------------------
function computeArcHits(
  elapsed: number,
  W: number,
  H: number,
): Set<number>[] {
  const sets: Set<number>[] = [new Set(), new Set(), new Set()];
  if (elapsed < ARC_START) return sets;

  for (let a = 0; a < ARC_ORIGINS.length; a++) {
    const arc = ARC_ORIGINS[a];
    const radius = getArcRadius(elapsed, arc.delay, W, H);
    if (radius <= 0) continue;
    const ox = arc.getX(W);
    const oy = arc.getY(H);
    const TOLERANCE = 40; // px band around the arc edge

    for (let i = 0; i < N; i++) {
      const px = positions[i * 2];
      const py = positions[i * 2 + 1];
      const dx = px - ox;
      const dy = py - oy;
      const d  = Math.sqrt(dx * dx + dy * dy);
      // Particle is "hit" if it's just behind the expanding wave front
      if (d < radius && d > radius - TOLERANCE) {
        sets[a].add(i);
      }
    }
  }
  return sets;
}

// ---------------------------------------------------------------------------
// Lock flash overlay
// ---------------------------------------------------------------------------
function drawLockFlash(
  ctx: CanvasRenderingContext2D,
  elapsed: number,
  W: number,
  H: number,
): void {
  if (elapsed < 1100 || elapsed > 1300) return;
  const t       = (elapsed - 1100) / 200; // 0..1
  const opacity = t < 0.3 ? t / 0.3 : 1 - (t - 0.3) / 0.7;
  const maxR    = Math.sqrt(W * W + H * H) * 0.15;
  const r       = maxR * t;

  ctx.save();
  const grad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r);
  grad.addColorStop(0, `rgba(255,255,255,${opacity * 0.8})`);
  grad.addColorStop(0.5, `rgba(0,212,255,${opacity * 0.3})`);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ConsensusTransition({
  onVideoSwitch,
  onComplete,
}: VideoTransitionProps) {
  const canvasRef         = useRef<HTMLCanvasElement>(null);
  const frameRef          = useRef<number>(0);
  const startTimeRef      = useRef<number>(0);
  const videoSwitchedRef  = useRef(false);
  const lockSetupDoneRef  = useRef(false);
  const [showLockCrosshair, setShowLockCrosshair] = useState(false);
  const [lockReadout,       setLockReadout]       = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Size canvas to viewport
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width;
    const H = canvas.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reduced-motion fast path
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t1 = setTimeout(() => onVideoSwitch(), 300);
      const t2 = setTimeout(() => onComplete(), 600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }

    // Initialize particles spread across center area
    initParticles(W / 2, H / 2, Math.min(W, H) * 0.45);

    const render = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;

      // Trail decay — motion-blur feel
      ctx.fillStyle = "rgba(13,17,23,0.2)";
      ctx.fillRect(0, 0, W, H);

      const phase = getPhase(elapsed);

      // Video switch at 1000ms
      if (elapsed > 1000 && !videoSwitchedRef.current) {
        videoSwitchedRef.current = true;
        onVideoSwitch();
      }

      // Set up home positions once at start of assemble phase
      if (phase === "assemble" && !lockSetupDoneRef.current) {
        lockSetupDoneRef.current = true;
        setHomePositions(W / 2, H / 2, Math.min(W, H) * 0.4);
      }

      // Arc hits for confidence
      const arcHits = computeArcHits(elapsed, W, H);
      updateParticles(phase, W / 2, H / 2, arcHits, 16);

      // Draw radar arcs
      drawArcs(ctx, elapsed, W, H);

      // Lock flash
      drawLockFlash(ctx, elapsed, W, H);

      // Draw particles
      const atlas = getGlyphAtlas();
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < N; i++) {
        const a = alpha[i];
        if (a <= 0.01) continue;

        const px = positions[i * 2];
        const py = positions[i * 2 + 1];
        const isGold = confidence[i] >= 2;

        ctx.globalAlpha = Math.min(1, a * 0.85);

        if (atlas) {
          // Tint the glyph by drawing a colored rect first in multiply-ish mode
          if (isGold) {
            ctx.fillStyle = "#FFB830";
            ctx.fillRect(px | 0, py | 0, atlas.glyphW, atlas.glyphH);
          }
          ctx.drawImage(
            atlas.canvas as HTMLCanvasElement,
            glyphIndex[i] * atlas.glyphW, 0,
            atlas.glyphW, atlas.glyphH,
            px | 0, py | 0,
            atlas.glyphW, atlas.glyphH,
          );
        } else {
          // Fallback: colored dot
          ctx.fillStyle = isGold ? "#FFB830" : "#00D4FF";
          ctx.fillRect(px | 0, py | 0, 3, 3);
        }
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // Show lock crosshair at 1100ms
      if (elapsed >= 1100 && !showLockCrosshair) {
        setShowLockCrosshair(true);
        setLockReadout(`LOCK · 0.987 · ${new Date().toISOString().slice(11, 19)}Z`);
      }

      // Done
      if (elapsed >= 1800) {
        onComplete();
        return;
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        50,
        pointerEvents: "none",
        background:    "transparent",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset:    0,
          width:    "100%",
          height:   "100%",
        }}
      />

      {/* Lock crosshair — appears at 1100ms */}
      {showLockCrosshair && (
        <div
          style={{
            position:  "absolute",
            left:      "50%",
            top:       "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <motion.svg
            width="60"
            height="60"
            viewBox="-30 -30 60 60"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Corner ticks */}
            <line x1="-24" y1="-24" x2="-14" y2="-24" stroke="#00D4FF" strokeWidth="1.5" />
            <line x1="-24" y1="-24" x2="-24" y2="-14" stroke="#00D4FF" strokeWidth="1.5" />
            <line x1="24"  y1="-24" x2="14"  y2="-24" stroke="#00D4FF" strokeWidth="1.5" />
            <line x1="24"  y1="-24" x2="24"  y2="-14" stroke="#00D4FF" strokeWidth="1.5" />
            <line x1="-24" y1="24"  x2="-14" y2="24"  stroke="#00D4FF" strokeWidth="1.5" />
            <line x1="-24" y1="24"  x2="-24" y2="14"  stroke="#00D4FF" strokeWidth="1.5" />
            <line x1="24"  y1="24"  x2="14"  y2="24"  stroke="#00D4FF" strokeWidth="1.5" />
            <line x1="24"  y1="24"  x2="24"  y2="14"  stroke="#00D4FF" strokeWidth="1.5" />
            {/* Crosshair lines */}
            <line x1="-20" y1="0" x2="-9" y2="0" stroke="#00D4FF" strokeWidth="1" />
            <line x1="9"   y1="0" x2="20" y2="0" stroke="#00D4FF" strokeWidth="1" />
            <line x1="0" y1="-20" x2="0" y2="-9"  stroke="#00D4FF" strokeWidth="1" />
            <line x1="0" y1="9"   x2="0" y2="20"  stroke="#00D4FF" strokeWidth="1" />
            {/* Center reticle */}
            <circle cx="0" cy="0" r="8" fill="none" stroke="#00D4FF" strokeWidth="1" />
            <circle cx="0" cy="0" r="2" fill="#FFB830" />
          </motion.svg>

          <motion.div
            style={{
              fontFamily:  '"JetBrains Mono", "Fira Mono", monospace',
              fontSize:    10,
              color:       "#00D4FF",
              marginTop:   8,
              textAlign:   "center",
              whiteSpace:  "nowrap",
              letterSpacing: "0.08em",
              textShadow:  "0 0 8px rgba(0,212,255,0.8)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            {lockReadout}
          </motion.div>
        </div>
      )}
    </div>
  );
}
