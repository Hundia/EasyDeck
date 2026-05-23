"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useInView,
} from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── Utilities ─────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 44 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated frame-grid canvas (hero background) ─────────────────────────

function FrameGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CELL = 6;
    const GAP = 4;
    const STEP = CELL + GAP;
    let raf: number;
    const t0 = performance.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();
    };

    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / STEP);
      const rows = Math.ceil(height / STEP);

      for (let cx = 0; cx < cols; cx++) {
        for (let cy = 0; cy < rows; cy++) {
          const w1 = (Math.sin((cx + cy * 0.5 - t * 3.5) * 0.32) + 1) / 2;
          const w2 = (Math.sin((cx - t * 2.8) * 0.45) + 1) / 2;
          const w3 = (Math.sin((cy - t * 1.8) * 0.28) + 1) / 2;
          const alpha = w1 * 0.13 + w2 * 0.07 + w3 * 0.05 + 0.018;
          ctx.fillStyle = `rgba(52,211,153,${alpha.toFixed(3)})`;
          drawRoundRect(cx * STEP, cy * STEP, CELL, CELL, 1.5);
        }
      }
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

// ─── Navigation ─────────────────────────────────────────────────────────────

function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(
    () => scrollY.on("change", (v) => setScrolled(v > 30)),
    [scrollY]
  );

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-[background,border-color] duration-300 ${
        scrolled
          ? "bg-[#020203]/85 backdrop-blur-xl border-b border-white/[0.06]"
          : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="1" y="1" width="5" height="5" rx="1" />
              <rect x="8" y="1" width="5" height="5" rx="1" opacity="0.55" />
              <rect x="1" y="8" width="5" height="5" rx="1" opacity="0.35" />
              <rect x="8" y="8" width="5" height="5" rx="1" opacity="0.18" />
            </svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">EasyDeck</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-5">
          {([
            ["#modes",          "Modes"],
            ["#features",       "Features"],
            ["#start-building", "Start building"],
          ] as const).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="hidden sm:block text-zinc-500 hover:text-white text-sm transition-colors duration-150"
            >
              {label}
            </a>
          ))}
          <a
            href="https://github.com/Hundia/EasyDeck"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-sm text-white hover:bg-white/[0.1] hover:border-white/[0.18] transition-all duration-150"
          >
            <GitHubIcon className="w-3.5 h-3.5" />
            GitHub
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Hero ───────────────────────────────────────────────────────────────────

const WORDS: { text: string; accent: boolean }[] = [
  { text: "Build", accent: false },
  { text: "stories", accent: false },
  { text: "that", accent: false },
  { text: "scroll.", accent: true },
];

function Hero() {
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden">
      {/* Deep background */}
      <div className="absolute inset-0 bg-[#020203]" />

      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="blob-a absolute rounded-full opacity-[0.14]"
          style={{
            width: 700,
            height: 700,
            background: "radial-gradient(circle, #059669 0%, transparent 68%)",
            top: "-15%",
            left: "-8%",
          }}
        />
        <div
          className="blob-b absolute rounded-full opacity-[0.09]"
          style={{
            width: 550,
            height: 550,
            background: "radial-gradient(circle, #4f46e5 0%, transparent 68%)",
            bottom: "-10%",
            right: "-6%",
          }}
        />
      </div>

      {/* Frame-grid canvas */}
      <div className="absolute inset-0" aria-hidden="true">
        <FrameGrid />
      </div>

      {/* Radial fade so grid doesn't compete with text */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 25%, #020203 78%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full bg-emerald-500/[0.1] border border-emerald-500/[0.22] text-emerald-400 text-xs font-mono tracking-widest"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          SCROLLYTELLING FRAMEWORK
        </motion.div>

        {/* Headline — staggered word reveal */}
        <h1 className="text-[clamp(3rem,10vw,6rem)] font-extrabold leading-[1.04] tracking-tight mb-6">
          {WORDS.map((w, i) => (
            <motion.span
              key={w.text}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.12 + i * 0.1, ease: EASE }}
              className={`inline-block mr-[0.22em] last:mr-0 ${
                w.accent ? "text-emerald-400" : "text-white"
              }`}
            >
              {w.text}
            </motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.58, ease: EASE }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Three transition modes. One{" "}
          <code className="text-emerald-400 text-base font-mono bg-emerald-500/[0.1] px-1.5 py-0.5 rounded-md">
            &lt;Stage&gt;
          </code>{" "}
          component. Canvas-driven image sequences with GSAP, Lenis, and accessibility
          baked&nbsp;in.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.72, ease: EASE }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.a
            href="https://github.com/Hundia/EasyDeck"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 text-black font-semibold hover:bg-emerald-400 transition-colors duration-200 cursor-pointer"
          >
            <GitHubIcon className="w-4 h-4" />
            View on GitHub
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
          </motion.a>
          <motion.a
            href="#modes"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white hover:bg-white/[0.09] hover:border-white/[0.18] transition-all duration-200 cursor-pointer"
          >
            Explore the modes
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        aria-hidden="true"
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-zinc-700 text-[10px] font-mono tracking-[0.2em]">SCROLL</span>
        <motion.div
          animate={{ scaleY: [1, 0.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent origin-top"
        />
      </motion.div>
    </section>
  );
}

// ─── Mode demos ─────────────────────────────────────────────────────────────

const SCENES = [
  { label: "Scene 1", frames: "0 → 45",  grad: "from-emerald-950 to-emerald-900" },
  { label: "Scene 2", frames: "45 → 90", grad: "from-indigo-950 to-indigo-900" },
  { label: "Scene 3", frames: "90 → 135",grad: "from-violet-950 to-violet-900" },
] as const;

function SectionDemo() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = useCallback(
    (d: 1 | -1) => {
      setDir(d);
      setIdx((i) => (i + d + 3) % 3);
    },
    []
  );

  const s = SCENES[idx];

  return (
    <div className="space-y-3">
      <div className="relative h-28 rounded-xl overflow-hidden bg-zinc-950">
        <AnimatePresence mode="popLayout" custom={dir}>
          <motion.div
            key={idx}
            custom={dir}
            variants={{
              enter: (d: number) => ({ y: d > 0 ? 56 : -56, opacity: 0 }),
              center: { y: 0, opacity: 1 },
              exit: (d: number) => ({ y: d > 0 ? -56 : 56, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.38, ease: EASE }}
            className={`absolute inset-0 bg-gradient-to-br ${s.grad} flex flex-col items-center justify-center gap-1`}
          >
            <span className="text-white/50 text-[10px] font-mono">{s.label}</span>
            <span className="text-white font-mono text-sm font-semibold">Frame {s.frames}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        {(["← Prev", "Next →"] as const).map((label, i) => (
          <button
            key={label}
            onClick={() => go(i === 0 ? -1 : 1)}
            className="flex-1 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-500 text-xs hover:text-white hover:bg-white/[0.09] transition-all duration-150 cursor-pointer"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SnapDemo() {
  const [pos, setPos] = useState(1);

  return (
    <div className="space-y-3">
      <div className="h-28 rounded-xl bg-zinc-950 flex items-center px-6">
        <div className="relative w-full h-1.5 bg-zinc-800 rounded-full">
          <motion.div
            className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
            animate={{ width: `${pos * 25}%` }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <button
              key={i}
              aria-label={`Scene ${i + 1}`}
              onClick={() => setPos(i)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center cursor-pointer"
              style={{ left: `${i * 25}%` }}
            >
              <motion.div
                animate={{
                  scale: pos === i ? 1.5 : 1,
                  backgroundColor: pos === i ? "#10b981" : "#3f3f46",
                }}
                className="w-2.5 h-2.5 rounded-full"
                transition={{ type: "spring", stiffness: 360, damping: 24 }}
              />
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-zinc-600 font-mono text-[11px]">
        Scene {pos + 1} of 5 — click to snap
      </p>
    </div>
  );
}

function ScrubDemo() {
  const [progress, setProgress] = useState(0.3);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!dragging.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    setProgress(Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)));
  }, []);

  const frame = Math.round(progress * 120);

  return (
    <div className="space-y-3">
      <div className="h-28 rounded-xl bg-zinc-950 flex flex-col items-center justify-center gap-4 px-6">
        <div className="text-center">
          <span className="text-white font-mono text-sm">
            Frame{" "}
            <span className="text-emerald-400 tabular-nums">{String(frame).padStart(3, "0")}</span>
            <span className="text-zinc-700"> / 120</span>
          </span>
        </div>
        <div
          ref={trackRef}
          className="w-full h-2 bg-zinc-800 rounded-full relative cursor-grab active:cursor-grabbing select-none"
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            const rect = e.currentTarget.getBoundingClientRect();
            setProgress(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
          }}
          onPointerMove={(e) => handleMove(e.clientX)}
          onPointerUp={() => { dragging.current = false; }}
          onPointerCancel={() => { dragging.current = false; }}
        >
          <div
            className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-lg pointer-events-none"
            style={{ left: `${progress * 100}%` }}
          />
        </div>
      </div>
      <p className="text-center text-zinc-600 font-mono text-[11px]">drag to scrub</p>
    </div>
  );
}

// ─── Modes Section ──────────────────────────────────────────────────────────

const MODE_CARDS = [
  {
    id: "section",
    name: "Section",
    badge: "Observer-driven",
    color: "emerald",
    description:
      "One gesture = one scene. GSAP Observer captures wheel, touch, and pointer. Lenis is paused during transitions.",
    code: 'mode: "section"',
    Demo: SectionDemo,
  },
  {
    id: "snap",
    name: "Snap",
    badge: "labelsDirectional",
    color: "indigo",
    description:
      "Free scroll with magnetic stops at scene boundaries via ScrollTrigger. Apple AirPods Pro pacing.",
    code: 'mode: "snap"',
    Demo: SnapDemo,
  },
  {
    id: "scrub",
    name: "Scrub",
    badge: "ScrollTrigger",
    color: "violet",
    description:
      "Continuous scroll-driven playback. Full user control, no magnetic stops. Great for long visual reveals.",
    code: 'mode: "scrub"',
    Demo: ScrubDemo,
  },
] as const;

const COLOR_VARIANTS = {
  emerald: {
    badge: "text-emerald-400 bg-emerald-500/[0.1] border-emerald-500/[0.2]",
    glow: "from-emerald-500/[0.09]",
    code: "text-emerald-400 bg-emerald-500/[0.08]",
  },
  indigo: {
    badge: "text-indigo-400 bg-indigo-500/[0.1] border-indigo-500/[0.2]",
    glow: "from-indigo-500/[0.09]",
    code: "text-indigo-400 bg-indigo-500/[0.08]",
  },
  violet: {
    badge: "text-violet-400 bg-violet-500/[0.1] border-violet-500/[0.2]",
    glow: "from-violet-500/[0.09]",
    code: "text-violet-400 bg-violet-500/[0.08]",
  },
} as const;

function ModesSection() {
  return (
    <section id="modes" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-emerald-400 font-mono text-[11px] tracking-[0.18em] uppercase mb-3">
            The Core
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Three ways to move
          </h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">
            Each mode maps differently to the GSAP / Lenis stack. Try them below.
          </p>
        </FadeUp>

        <div className="grid md:grid-cols-3 gap-5">
          {MODE_CARDS.map((mode, i) => {
            const v = COLOR_VARIANTS[mode.color];
            return (
              <FadeUp key={mode.id} delay={i * 0.09}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                  className="group relative rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 hover:border-white/[0.14] transition-colors duration-300 h-full"
                >
                  {/* Hover glow */}
                  <div
                    className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br ${v.glow} to-transparent`}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-white font-bold text-lg">{mode.name}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${v.badge}`}>
                        {mode.badge}
                      </span>
                    </div>

                    <mode.Demo />

                    <p className="text-zinc-500 text-sm mt-4 leading-relaxed">{mode.description}</p>

                    <code className={`mt-3 block text-xs font-mono px-2.5 py-1.5 rounded-lg ${v.code}`}>
                      {mode.code}
                    </code>
                  </div>
                </motion.div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Pipeline Section ────────────────────────────────────────────────────────

const PIPELINE = [
  { label: "ContentBrief",      sub: "Your input" },
  { label: "NarrativeDesigner", sub: "Frame ranges" },
  { label: "SceneComposer",     sub: "Zod validation" },
  { label: "<Stage>",           sub: "Mode routing" },
  { label: "Canvas",            sub: "GSAP ticker" },
] as const;

function PipelineSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    const timers = PIPELINE.map((_, i) =>
      setTimeout(() => setActive(i), i * 280 + 250)
    );
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <section id="architecture" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-emerald-400 font-mono text-[11px] tracking-[0.18em] uppercase mb-3">
            The Pipeline
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Skip the JSON authoring
          </h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">
            A two-stage agent pipeline turns a content brief into a validated{" "}
            <code className="text-emerald-400 font-mono text-sm">StorySchema</code> —
            ready to drop into{" "}
            <code className="text-emerald-400 font-mono text-sm">&lt;Stage&gt;</code>.
          </p>
        </FadeUp>

        <div ref={ref}>
          {/* Pipeline nodes */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-0">
            {PIPELINE.map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <motion.div
                  animate={{
                    opacity: active >= i ? 1 : 0.28,
                    y: active >= i ? 0 : 6,
                  }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className={`relative px-4 py-3 rounded-xl border text-center min-w-[130px] transition-colors duration-300 ${
                    active >= i
                      ? "bg-white/[0.05] border-white/[0.14]"
                      : "bg-white/[0.02] border-white/[0.05]"
                  }`}
                >
                  {active === i && (
                    <motion.div
                      layoutId="pipe-ring"
                      className="absolute inset-0 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/[0.35]"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    />
                  )}
                  <div className="relative z-10">
                    <div className="text-white font-mono text-xs font-medium leading-tight">
                      {step.label}
                    </div>
                    <div className="text-zinc-600 text-[10px] mt-0.5">{step.sub}</div>
                  </div>
                </motion.div>

                {i < PIPELINE.length - 1 && (
                  <motion.span
                    animate={{ opacity: active > i ? 1 : 0.18 }}
                    transition={{ duration: 0.3 }}
                    className="text-emerald-700 font-mono text-xs hidden sm:block select-none px-1"
                  >
                    →
                  </motion.span>
                )}
              </div>
            ))}
          </div>

          {/* Code preview */}
          <FadeUp delay={0.35} className="mt-10">
            <div className="rounded-2xl bg-[#0d1117] border border-white/[0.07] overflow-hidden">
              <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-white/[0.06]">
                {["#3f3f46", "#3f3f46", "#3f3f46"].map((c, i) => (
                  <div key={i} style={{ background: c }} className="w-2.5 h-2.5 rounded-full" />
                ))}
                <span className="text-zinc-600 font-mono text-xs ml-2">pipeline-example.ts</span>
              </div>
              <pre className="p-5 text-sm font-mono overflow-x-auto leading-[1.75] text-zinc-300">
                <code>{`import { createPresentation } from `}<span className="text-amber-300">&apos;@/lib/pipeline&apos;</span>{`
import { Stage } from `}<span className="text-amber-300">&apos;@/components/Stage&apos;</span>{`

`}<span className="text-violet-400">const</span>{` { story } = `}<span className="text-emerald-400">createPresentation</span>{`({
  `}<span className="text-sky-300">title</span>{`: `}<span className="text-amber-300">&apos;Product Launch&apos;</span>{`,
  `}<span className="text-sky-300">mode</span>{`:  `}<span className="text-amber-300">&apos;section&apos;</span>{`,  `}<span className="text-zinc-600">// or 'snap' | 'scrub'</span>{`
  `}<span className="text-sky-300">scenes</span>{`: [
    { `}<span className="text-sky-300">id</span>{`: `}<span className="text-amber-300">&apos;intro&apos;</span>{`,   `}<span className="text-sky-300">frames</span>{`: [`}<span className="text-orange-400">0</span>{`, `}<span className="text-orange-400">45</span>{`]  },
    { `}<span className="text-sky-300">id</span>{`: `}<span className="text-amber-300">&apos;feature&apos;</span>{`, `}<span className="text-sky-300">frames</span>{`: [`}<span className="text-orange-400">45</span>{`, `}<span className="text-orange-400">90</span>{`]  },
  ],
})

`}<span className="text-violet-400">export default function</span>{` `}<span className="text-emerald-400">Page</span>{`() {
  `}<span className="text-violet-400">return</span>{` <`}<span className="text-emerald-400">Stage</span>{` `}<span className="text-sky-300">story</span>{`={story} />
}`}</code>
              </pre>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Features Section ────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: <FrameIcon />,
    title: "Canvas Engine",
    description:
      "GSAP ticker draw loop reads playhead.current.frame — fully decoupled from scroll source. Any mode, one renderer.",
    tag: "60 fps",
    wide: true,
  },
  {
    icon: <BoltIcon />,
    title: "Lenis Smooth Scroll",
    description:
      "Paused in section mode to prevent conflicts. Active with ScrollTrigger sync in snap and scrub.",
    tag: "Zero conflicts",
    wide: false,
  },
  {
    icon: <CheckCircleIcon />,
    title: "WCAG 2.1 AA",
    description:
      "Keyboard nav, reduced-motion, ARIA live regions, skip links, and a semantic content layer for screen readers.",
    tag: "Accessible",
    wide: false,
  },
  {
    icon: <ShieldIcon />,
    title: "Zod Validation",
    description:
      "superRefine enforces frame continuity at schema parse time — invalid configs never reach render.",
    tag: "Type-safe",
    wide: false,
  },
  {
    icon: <LinkIcon />,
    title: "Deep Linking",
    description:
      "URL hash sync (#scene-N) via replaceState. Users can share any scene directly.",
    tag: "#scene-2",
    wide: false,
  },
  {
    icon: <AgentIcon />,
    title: "Agent Pipeline",
    description:
      "NarrativeDesigner → SceneComposer turns a brief into validated JSON. No manual schema authoring required.",
    tag: "AI-powered",
    wide: true,
  },
] as const;

function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-emerald-400 font-mono text-[11px] tracking-[0.18em] uppercase mb-3">
            Batteries Included
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Everything you need
          </h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto">
            No half-baked abstractions. Every feature ships with integration tests and docs.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FadeUp
              key={f.title}
              delay={i * 0.06}
              className={f.wide ? "md:col-span-2" : ""}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
                className="h-full rounded-2xl bg-white/[0.03] border border-white/[0.07] p-6 hover:border-white/[0.14] hover:bg-white/[0.05] transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/[0.1] flex items-center justify-center text-emerald-400 shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-white font-semibold text-[15px] mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ──────────────────────────────────────────────────────────────

const STATS = [
  { value: "235",         label: "Tests" },
  { value: "3",           label: "Transition modes" },
  { value: "TypeScript",  label: "Strict mode" },
  { value: "WCAG 2.1 AA", label: "Accessibility" },
  { value: "9",           label: "Sprints" },
  { value: "MIT",         label: "License" },
] as const;

// ─── Getting Started Section ─────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    title: "Clone & install",
    summary: "Get the framework running locally in under a minute.",
    tip: "Requires Node 20+. The dev server starts on localhost:3000.",
    code: (
      <>
        <span className="text-zinc-500"># Clone the repo</span>{"\n"}
        <span className="text-emerald-400">git</span>{" clone https://github.com/Hundia/EasyDeck.git"}{"\n"}
        <span className="text-emerald-400">cd</span>{" EasyDeck"}{"\n\n"}
        <span className="text-zinc-500"># Install dependencies</span>{"\n"}
        <span className="text-emerald-400">npm</span>{" install"}{"\n\n"}
        <span className="text-zinc-500"># Start the dev server</span>{"\n"}
        <span className="text-emerald-400">npm</span>{" run dev"}
      </>
    ),
  },
  {
    number: "02",
    title: "Prepare your frames",
    summary: "Supply an image sequence — one JPG/PNG per frame, named consistently.",
    tip: "Frames live in /public. The pattern string uses {n} as the frame index placeholder.",
    code: (
      <>
        <span className="text-zinc-500">{"// Place frames in /public/frames/"}</span>{"\n"}
        <span className="text-zinc-500">{"// e.g. frame_001.jpg … frame_120.jpg"}</span>{"\n\n"}
        <span className="text-zinc-500">{"// Reference them in your scene config:"}</span>{"\n"}
        {"imageSequence: {"}{"\n"}
        {"  "}<span className="text-sky-300">pattern</span>{":    "}<span className="text-amber-300">&apos;/frames/frame_{"{n}"}.jpg&apos;</span>{","}{"\n"}
        {"  "}<span className="text-sky-300">frameCount</span>{": "}<span className="text-orange-400">120</span>{","}{"\n"}
        {"}"}
      </>
    ),
  },
  {
    number: "03",
    title: "Define your story",
    summary: "Use the agent pipeline for a brief-to-story workflow, or author the schema directly.",
    tip: "Section mode enforces frame continuity — scene[i].endFrame must equal scene[i+1].startFrame. SceneComposer validates this automatically.",
    code: (
      <>
        <span className="text-violet-400">import</span>{" { createPresentation } "}<span className="text-violet-400">from</span>{" "}<span className="text-amber-300">&apos;@/lib/pipeline&apos;</span>{"\n\n"}
        <span className="text-zinc-500">{"// Describe your story in plain terms"}</span>{"\n"}
        <span className="text-violet-400">const</span>{" { story } = "}<span className="text-emerald-400">createPresentation</span>{"({"}{"\n"}
        {"  "}<span className="text-sky-300">title</span>{":  "}<span className="text-amber-300">&apos;Product Launch&apos;</span>{","}{"\n"}
        {"  "}<span className="text-sky-300">mode</span>{":   "}<span className="text-amber-300">&apos;section&apos;</span>{",  "}<span className="text-zinc-500">{"// 'snap' | 'scrub'"}</span>{"\n"}
        {"  "}<span className="text-sky-300">scenes</span>{": ["}{"\n"}
        {"    { "}<span className="text-sky-300">id</span>{": "}<span className="text-amber-300">&apos;intro&apos;</span>{",   "}<span className="text-sky-300">label</span>{": "}<span className="text-amber-300">&apos;Opening&apos;</span>{",  "}<span className="text-sky-300">frames</span>{": ["}<span className="text-orange-400">0</span>{", "}<span className="text-orange-400">45</span>{"] },"}{"\n"}
        {"    { "}<span className="text-sky-300">id</span>{": "}<span className="text-amber-300">&apos;feature&apos;</span>{", "}<span className="text-sky-300">label</span>{": "}<span className="text-amber-300">&apos;Key Feature&apos;</span>{", "}<span className="text-sky-300">frames</span>{": ["}<span className="text-orange-400">45</span>{", "}<span className="text-orange-400">90</span>{"] },"}{"\n"}
        {"  ],"}{"\n"}
        {"})"}{"\n\n"}
        <span className="text-zinc-500">{"// story is a fully-validated StorySchema"}</span>
      </>
    ),
  },
  {
    number: "04",
    title: "Render with Stage",
    summary: "Drop <Stage> into any full-viewport page. It handles mode routing, canvas, Lenis, and a11y.",
    tip: "Stage needs a full-viewport parent. Wrap it in a div with w-screen h-screen or use the app router layout.",
    code: (
      <>
        <span className="text-violet-400">import</span>{" { Stage } "}<span className="text-violet-400">from</span>{" "}<span className="text-amber-300">&apos;@/components/Stage&apos;</span>{"\n\n"}
        <span className="text-violet-400">export default function</span>{" "}<span className="text-emerald-400">Presentation</span>{"() {"}{"\n"}
        {"  "}<span className="text-violet-400">return</span>{" ("}{"\n"}
        {"    <"}<span className="text-emerald-400">div</span>{" "}<span className="text-sky-300">className</span>{"="}<span className="text-amber-300">&quot;w-screen h-screen&quot;</span>{">"}{"\n"}
        {"      <"}<span className="text-emerald-400">Stage</span>{" "}<span className="text-sky-300">story</span>{"={story} />"}{"\n"}
        {"    </"}<span className="text-emerald-400">div</span>{">"}{"\n"}
        {"  )"}{"\n"}
        {"}"}
      </>
    ),
  },
  {
    number: "05",
    title: "Customize & extend",
    summary: "Tune transition behaviour, accessibility fallbacks, and per-scene overrides.",
    tip: "reducedMotionFallback: 'scrub-instant' collapses all durations to ~0ms and switches to a scrub-style fallback — no motion, full content.",
    code: (
      <>
        <span className="text-zinc-500">{"// Transition knobs on StorySchema"}</span>{"\n"}
        {"transition: {"}{"\n"}
        {"  "}<span className="text-sky-300">mode</span>{":             "}<span className="text-amber-300">&apos;section&apos;</span>{","}{"\n"}
        {"  "}<span className="text-sky-300">duration</span>{":         "}<span className="text-orange-400">0.6</span>{","}{"\n"}
        {"  "}<span className="text-sky-300">ease</span>{":             "}<span className="text-amber-300">&apos;power2.inOut&apos;</span>{","}{"\n"}
        {"  "}<span className="text-sky-300">showPagination</span>{":   "}<span className="text-orange-400">true</span>{","}{"\n"}
        {"  "}<span className="text-sky-300">enableKeyboard</span>{":   "}<span className="text-orange-400">true</span>{","}{"\n"}
        {"  "}<span className="text-sky-300">wrapEnabled</span>{":      "}<span className="text-orange-400">false</span>{","}{"\n"}
        {"},"}{"\n\n"}
        <span className="text-zinc-500">{"// Reduced-motion fallback"}</span>{"\n"}
        <span className="text-sky-300">reducedMotionFallback</span>{": "}<span className="text-amber-300">&apos;scrub-instant&apos;</span>{","}
      </>
    ),
  },
] as const;

function GettingStartedSection() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <section id="start-building" className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <p className="text-emerald-400 font-mono text-[11px] tracking-[0.18em] uppercase mb-3">
            Quick Start
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Start building
          </h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">
            Five steps from zero to a scrollytelling presentation in your browser.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.07] overflow-hidden">
            <div className="flex flex-col md:flex-row min-h-[480px]">

              {/* Step sidebar */}
              <div className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.07] p-3 flex md:flex-col gap-1">
                {STEPS.map((s, i) => {
                  const isActive = active === i;
                  const isDone = i < active;
                  return (
                    <button
                      key={s.number}
                      onClick={() => setActive(i)}
                      className={`relative w-full text-left px-3 py-3 rounded-xl transition-colors duration-150 cursor-pointer group ${
                        isActive
                          ? "bg-white/[0.07]"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="step-bg"
                          className="absolute inset-0 rounded-xl bg-white/[0.05]"
                          transition={{ type: "spring", stiffness: 340, damping: 30 }}
                        />
                      )}
                      <div className="relative flex items-center gap-3 md:gap-2">
                        {/* Step number / check */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold transition-colors duration-200 ${
                            isDone
                              ? "bg-emerald-500 text-black"
                              : isActive
                              ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                              : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {isDone ? (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            s.number
                          )}
                        </div>
                        <span
                          className={`text-xs font-medium leading-tight hidden md:block transition-colors duration-150 ${
                            isActive ? "text-white" : isDone ? "text-zinc-400" : "text-zinc-600"
                          }`}
                        >
                          {s.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Step content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.28, ease: EASE }}
                    className="flex-1 flex flex-col"
                  >
                    {/* Header */}
                    <div className="px-7 pt-7 pb-5 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-emerald-500/50 font-mono text-xs">{step.number}</span>
                        <h3 className="text-white font-semibold text-lg">{step.title}</h3>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed">{step.summary}</p>
                    </div>

                    {/* Code block */}
                    <div className="flex-1 bg-[#0d1117]">
                      <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/[0.05]">
                        {["#3f3f46","#3f3f46","#3f3f46"].map((c,i) => (
                          <div key={i} style={{ background: c }} className="w-2 h-2 rounded-full" />
                        ))}
                      </div>
                      <pre className="p-5 text-sm font-mono overflow-x-auto leading-[1.8] text-zinc-300">
                        <code>{step.code}</code>
                      </pre>
                    </div>

                    {/* Tip */}
                    <div className="px-7 py-4 border-t border-white/[0.06] flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.355a3.375 3.375 0 01-3 0" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9z" />
                      </svg>
                      <p className="text-zinc-500 text-xs leading-relaxed">{step.tip}</p>
                    </div>

                    {/* Navigation */}
                    <div className="px-7 py-4 flex justify-between items-center border-t border-white/[0.06]">
                      <button
                        onClick={() => setActive(Math.max(0, active - 1))}
                        disabled={active === 0}
                        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>

                      <div className="flex gap-1.5">
                        {STEPS.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActive(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                              i === active
                                ? "bg-emerald-400 w-4"
                                : i < active
                                ? "bg-emerald-600"
                                : "bg-zinc-700"
                            }`}
                          />
                        ))}
                      </div>

                      {active < STEPS.length - 1 ? (
                        <button
                          onClick={() => setActive(active + 1)}
                          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-150 cursor-pointer"
                        >
                          Next step
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <a
                          href="https://github.com/Hundia/EasyDeck"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-150"
                        >
                          View on GitHub
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <FadeUp>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.07] px-6 py-7 flex flex-wrap justify-center gap-x-10 gap-y-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center min-w-[80px]">
              <div className="text-xl font-bold text-white tabular-nums">{s.value}</div>
              <div className="text-zinc-600 text-[11px] font-mono mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

// ─── Final CTA ──────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-32 px-6">
      <FadeUp className="max-w-2xl mx-auto text-center">
        {/* Decorative rings */}
        <div className="relative inline-block mb-10" aria-hidden="true">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto relative z-10">
            <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="5" height="5" rx="1" />
              <rect x="8" y="1" width="5" height="5" rx="1" opacity="0.55" />
              <rect x="1" y="8" width="5" height="5" rx="1" opacity="0.35" />
              <rect x="8" y="8" width="5" height="5" rx="1" opacity="0.18" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/30 blur-xl scale-150" />
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight leading-tight">
          Ready to scroll <br />
          <span className="text-emerald-400">differently?</span>
        </h2>
        <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
          Open source. MIT licensed. Built with the OpenSpec methodology —
          235 tests and zero compromises on accessibility.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.a
            href="https://github.com/Hundia/EasyDeck"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 text-black font-bold text-lg hover:bg-emerald-400 transition-colors duration-200 cursor-pointer"
          >
            <GitHubIcon className="w-5 h-5" />
            Star on GitHub
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
          </motion.a>
        </div>
      </FadeUp>
    </section>
  );
}

// ─── Footer ─────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-700 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/[0.15] flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-emerald-500" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="1" y="1" width="5" height="5" rx="1" />
              <rect x="8" y="1" width="5" height="5" rx="1" opacity="0.55" />
            </svg>
          </div>
          <span>EasyDeck — MIT License</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Hundia/EasyDeck"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-400 transition-colors duration-150"
          >
            GitHub
          </a>
          <span aria-hidden="true">·</span>
          <span>Built with OpenSpec methodology</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Icon components ────────────────────────────────────────────────────────

function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function ArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}

function FrameIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2" y="2" width="6" height="5" rx="1" />
      <rect x="10" y="2" width="6" height="5" rx="1" opacity="0.5" />
      <rect x="2" y="9" width="6" height="5" rx="1" opacity="0.3" />
      <rect x="10" y="9" width="6" height="5" rx="1" opacity="0.15" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25 4.5-4.5m5.25 5.25a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div className="bg-[#020203] text-white overflow-x-hidden">
      <Nav />
      <Hero />
      <ModesSection />
      <PipelineSection />
      <FeaturesSection />
      <GettingStartedSection />
      <StatsBar />
      <FinalCTA />
      <Footer />
    </div>
  );
}
