"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useInView } from "framer-motion";
import React from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

// ─── FadeUp ──────────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Particle canvas (rising dust) ───────────────────────────────────────────

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    type P = { x: number; y: number; speed: number; opacity: number; fadeStart: number; fadingOut: boolean };
    let particles: P[] = [];
    let raf = 0;
    const setSize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    const makeP = (): P => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: Math.random() / 5 + 0.06, opacity: 0.6, fadeStart: Date.now() + Math.random() * 800 + 100, fadingOut: false });
    const resetP = (p: P) => { p.x = Math.random() * canvas.width; p.y = canvas.height + 2; p.speed = Math.random() / 5 + 0.06; p.opacity = 0.6; p.fadeStart = Date.now() + Math.random() * 800 + 100; p.fadingOut = false; };
    const init = () => { particles = Array.from({ length: Math.floor((canvas.width * canvas.height) / 6500) }, makeP); };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y -= p.speed;
        if (p.y < -2) resetP(p);
        if (!p.fadingOut && Date.now() > p.fadeStart) p.fadingOut = true;
        if (p.fadingOut) { p.opacity -= 0.005; if (p.opacity <= 0) resetP(p); }
        ctx.fillStyle = `rgba(255,255,255,${p.opacity.toFixed(3)})`;
        ctx.fillRect(p.x, p.y, 0.7, Math.random() * 2 + 1);
      }
      raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(() => { setSize(); init(); });
    ro.observe(canvas); setSize(); init(); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 mix-blend-screen opacity-50" style={{ width: "100%", height: "100%" }} />;
}

// ─── Frame-grid canvas ────────────────────────────────────────────────────────

function FrameGrid() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const CELL = 6, STEP = 10;
    let raf: number;
    const t0 = performance.now();
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    const drawRR = (x: number, y: number) => {
      ctx.beginPath(); ctx.moveTo(x+1.5,y); ctx.lineTo(x+CELL-1.5,y); ctx.quadraticCurveTo(x+CELL,y,x+CELL,y+1.5); ctx.lineTo(x+CELL,y+CELL-1.5); ctx.quadraticCurveTo(x+CELL,y+CELL,x+CELL-1.5,y+CELL); ctx.lineTo(x+1.5,y+CELL); ctx.quadraticCurveTo(x,y+CELL,x,y+CELL-1.5); ctx.lineTo(x,y+1.5); ctx.quadraticCurveTo(x,y,x+1.5,y); ctx.closePath(); ctx.fill();
    };
    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const cols = Math.ceil(width / STEP), rows = Math.ceil(height / STEP);
      for (let cx = 0; cx < cols; cx++) for (let cy = 0; cy < rows; cy++) {
        const a = ((Math.sin((cx + cy * 0.5 - t * 3.5) * 0.32)+1)/2) * 0.13 + ((Math.sin((cx - t * 2.8) * 0.45)+1)/2) * 0.07 + ((Math.sin((cy - t * 1.8) * 0.28)+1)/2) * 0.05 + 0.018;
        ctx.fillStyle = `rgba(52,211,153,${a.toFixed(3)})`;
        drawRR(cx * STEP, cy * STEP);
      }
      raf = requestAnimationFrame(draw);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas); resize(); draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0" style={{ width: "100%", height: "100%" }} />;
}

// ─── Accent grid lines ────────────────────────────────────────────────────────

function AccentLines() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {[18, 50, 82].map((pct, i) => (
        <motion.div key={`h${i}`} className="absolute h-px left-0 right-0 bg-white/[0.03]" style={{ top: `${pct}%`, transformOrigin: "50% 50%" }}
          initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.2 + i * 0.15, ease: EASE }} />
      ))}
      {[18, 50, 82].map((pct, i) => (
        <motion.div key={`v${i}`} className="absolute w-px top-0 bottom-0 bg-white/[0.025]" style={{ left: `${pct}%`, transformOrigin: "50% 0%" }}
          initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.55 + i * 0.15, ease: EASE }} />
      ))}
    </div>
  );
}

// ─── Spotlight card ───────────────────────────────────────────────────────────

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  return (
    <motion.div ref={divRef}
      onMouseMove={(e) => { if (!divRef.current) return; const r = divRef.current.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
      onMouseEnter={() => setOpacity(1)} onMouseLeave={() => setOpacity(0)}
      whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 340, damping: 26 }}
      className={`relative rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.13] transition-colors duration-300 overflow-hidden ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{ opacity, background: `radial-gradient(380px circle at ${pos.x}px ${pos.y}px, rgba(52,211,153,0.07), transparent 60%)` }} />
      {children}
    </motion.div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function Nav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => scrollY.on("change", (v) => setScrolled(v > 40)), [scrollY]);
  return (
    <motion.nav initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#020203]/80 backdrop-blur-2xl border-b border-white/[0.07]" : ""}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_16px_rgba(52,211,153,0.4)]">
            <EasyDeckLogo />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">EasyDeck</span>
        </div>
        <div className="flex items-center gap-6">
          {([["#modes","Modes"],["#features","Features"],["#start-building","Start building"]] as const).map(([href, label]) => (
            <a key={href} href={href} className="hidden sm:block text-zinc-500 hover:text-zinc-200 text-sm transition-colors duration-200 relative group">
              {label}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-emerald-500 group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          <a href="https://github.com/Hundia/EasyDeck" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-sm text-white hover:bg-white/[0.1] hover:border-emerald-500/30 transition-all duration-200">
            <GitHubIcon className="w-3.5 h-3.5" />GitHub
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const WORDS = [
  { text: "Build",   accent: false },
  { text: "stories", accent: false },
  { text: "that",    accent: false },
  { text: "scroll.", accent: true  },
];

function Hero() {
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[#020203]" />
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="blob-a absolute rounded-full opacity-[0.17]"
          style={{ width: 900, height: 900, background: "radial-gradient(circle, #059669 0%, transparent 65%)", top: "-20%", left: "-12%" }} />
        <div className="blob-b absolute rounded-full opacity-[0.08]"
          style={{ width: 650, height: 650, background: "radial-gradient(circle, #4f46e5 0%, transparent 65%)", bottom: "-10%", right: "-8%" }} />
        <div className="absolute rounded-full opacity-[0.05]"
          style={{ width: 800, height: 400, background: "radial-gradient(ellipse, #34d399 0%, transparent 70%)", top: "-5%", left: "50%", transform: "translateX(-50%)" }} />
      </div>
      <div className="absolute inset-0" aria-hidden="true"><FrameGrid /></div>
      <div className="absolute inset-0" aria-hidden="true"><ParticleCanvas /></div>
      <AccentLines />
      {/* Radial vignette */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 18%, #020203 72%)" }} />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, scale: 0.88, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="inline-flex items-center gap-2.5 mb-8 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/[0.18] text-emerald-400 text-xs font-mono tracking-[0.16em]">
          <span className="relative flex w-2 h-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
          </span>
          SCROLLYTELLING FRAMEWORK
        </motion.div>

        <h1 className="text-[clamp(3.2rem,10.5vw,6.5rem)] font-extrabold leading-[1.02] tracking-tight mb-6">
          {WORDS.map((w, i) => (
            <motion.span key={w.text}
              initial={{ opacity: 0, y: 72, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.85, delay: 0.1 + i * 0.1, ease: EASE }}
              className={`inline-block mr-[0.22em] last:mr-0 ${w.accent
                ? "bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent"
                : "text-white"}`}>
              {w.text}
            </motion.span>
          ))}
        </h1>

        <motion.p initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-11 leading-relaxed">
          Three transition modes. One{" "}
          <code className="text-emerald-400 text-base font-mono bg-emerald-500/[0.1] px-1.5 py-0.5 rounded-md border border-emerald-500/[0.15]">
            &lt;Stage&gt;
          </code>{" "}
          component. Canvas-driven image sequences with GSAP, Lenis, and accessibility baked&nbsp;in.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.7, ease: EASE }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.a href="https://github.com/Hundia/EasyDeck" target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(52,211,153,0.35)" }} whileTap={{ scale: 0.97 }}
            className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors duration-200 cursor-pointer shadow-[0_0_24px_rgba(52,211,153,0.22)]">
            <GitHubIcon className="w-4 h-4" />View on GitHub
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </motion.a>
          <motion.a href="#modes" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/[0.05] border border-white/[0.12] text-white hover:bg-white/[0.09] hover:border-white/[0.2] transition-all duration-200 cursor-pointer backdrop-blur-sm">
            Explore the modes
          </motion.a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}
        aria-hidden="true" className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-zinc-700 text-[9px] font-mono tracking-[0.25em] uppercase">Scroll</span>
        <motion.div animate={{ scaleY: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-px h-10 bg-gradient-to-b from-emerald-700 via-emerald-800 to-transparent origin-top" />
      </motion.div>
    </section>
  );
}

// ─── Mode demos ───────────────────────────────────────────────────────────────

const SCENES = [
  { label: "Scene 1", frames: "0 → 45",   grad: "from-emerald-950 via-emerald-900 to-teal-950" },
  { label: "Scene 2", frames: "45 → 90",  grad: "from-indigo-950 via-indigo-900 to-blue-950" },
  { label: "Scene 3", frames: "90 → 135", grad: "from-violet-950 via-violet-900 to-purple-950" },
] as const;

function SectionDemo() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const go = useCallback((d: 1 | -1) => { setDir(d); setIdx((i) => (i + d + 3) % 3); }, []);
  const s = SCENES[idx];
  return (
    <div className="space-y-3">
      <div className="relative h-32 rounded-xl overflow-hidden bg-zinc-950 ring-1 ring-white/[0.06]">
        <AnimatePresence mode="popLayout" custom={dir}>
          <motion.div key={idx} custom={dir}
            variants={{ enter: (d: number) => ({ y: d > 0 ? 64 : -64, opacity: 0, filter: "blur(4px)" }), center: { y: 0, opacity: 1, filter: "blur(0px)" }, exit: (d: number) => ({ y: d > 0 ? -64 : 64, opacity: 0, filter: "blur(4px)" }) }}
            initial="enter" animate="center" exit="exit" transition={{ duration: 0.42, ease: EASE }}
            className={`absolute inset-0 bg-gradient-to-br ${s.grad} flex flex-col items-center justify-center gap-1.5`}>
            <span className="text-white/30 text-[10px] font-mono tracking-wider uppercase">{s.label}</span>
            <span className="text-white font-mono text-sm font-semibold">Frame {s.frames}</span>
            <div className="flex items-end gap-0.5 mt-1 h-4" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.div key={i} className="w-0.5 rounded-full bg-white/20"
                  animate={{ height: [3, 6 + Math.sin(i * 0.8) * 8, 3] }}
                  transition={{ duration: 0.9 + (i % 3) * 0.2, repeat: Infinity, delay: i * 0.05 }} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        {(["← Prev", "Next →"] as const).map((label, i) => (
          <button key={label} onClick={() => go(i === 0 ? -1 : 1)}
            className="flex-1 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-zinc-500 text-xs hover:text-white hover:bg-white/[0.08] transition-all duration-150 cursor-pointer font-mono">
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SnapDemo() {
  const [pos, setPos] = useState(2);
  return (
    <div className="space-y-3">
      <div className="h-32 rounded-xl bg-zinc-950 flex flex-col items-center justify-center gap-5 px-6 ring-1 ring-white/[0.06]">
        <AnimatePresence mode="wait">
          <motion.span key={pos} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            className="text-white font-mono text-sm tabular-nums">
            Scene {pos + 1} <span className="text-zinc-700">/ 5</span>
          </motion.span>
        </AnimatePresence>
        <div className="relative w-full h-1.5 bg-zinc-800 rounded-full">
          <motion.div className="absolute left-0 top-0 h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
            animate={{ width: `${pos * 25}%` }} transition={{ type: "spring", stiffness: 280, damping: 28 }} />
          {[0, 1, 2, 3, 4].map((i) => (
            <button key={i} aria-label={`Scene ${i + 1}`} onClick={() => setPos(i)}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 flex items-center justify-center cursor-pointer" style={{ left: `${i * 25}%` }}>
              <motion.div animate={{ scale: pos === i ? 1.6 : 1, backgroundColor: pos === i ? "#818cf8" : "#3f3f46" }}
                className="w-2.5 h-2.5 rounded-full" transition={{ type: "spring", stiffness: 380, damping: 24 }} />
            </button>
          ))}
        </div>
      </div>
      <p className="text-center text-zinc-700 font-mono text-[11px]">magnetic stops · tap to snap</p>
    </div>
  );
}

function ScrubDemo() {
  const [progress, setProgress] = useState(0.3);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const handleMove = useCallback((clientX: number) => {
    if (!dragging.current || !trackRef.current) return;
    const r = trackRef.current.getBoundingClientRect();
    setProgress(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
  }, []);
  const frame = Math.round(progress * 120);
  return (
    <div className="space-y-3">
      <div className="h-32 rounded-xl bg-zinc-950 flex flex-col items-center justify-center gap-4 px-6 ring-1 ring-white/[0.06]">
        <div className="flex items-baseline gap-1.5">
          <span className="text-violet-400 font-mono text-2xl font-bold tabular-nums">{String(frame).padStart(3,"0")}</span>
          <span className="text-zinc-700 font-mono text-sm">/ 120</span>
        </div>
        <div ref={trackRef}
          className="w-full h-2 bg-zinc-800 rounded-full relative cursor-grab active:cursor-grabbing select-none"
          onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); const r = e.currentTarget.getBoundingClientRect(); setProgress(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); }}
          onPointerMove={(e) => handleMove(e.clientX)}
          onPointerUp={() => { dragging.current = false; }}
          onPointerCancel={() => { dragging.current = false; }}>
          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-700 to-violet-400 rounded-full" style={{ width: `${progress * 100}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-violet-400 shadow-lg pointer-events-none" style={{ left: `${progress * 100}%` }} />
        </div>
      </div>
      <p className="text-center text-zinc-700 font-mono text-[11px]">drag to scrub · continuous playback</p>
    </div>
  );
}

// ─── Modes Section ────────────────────────────────────────────────────────────

const MODE_CARDS = [
  { id: "section", name: "Section", badge: "Observer-driven", color: "emerald" as const, isDefault: true,
    description: "One gesture = one scene. GSAP Observer captures wheel, touch, and pointer. Lenis is paused during transitions for conflict-free paging.", code: 'mode: "section"', Demo: SectionDemo },
  { id: "snap",    name: "Snap",    badge: "labelsDirectional", color: "indigo" as const, isDefault: false,
    description: "Free scroll with magnetic stops at scene boundaries via ScrollTrigger. Apple AirPods Pro–style pacing. Lenis stays active with sync.", code: 'mode: "snap"', Demo: SnapDemo },
  { id: "scrub",   name: "Scrub",   badge: "ScrollTrigger",    color: "violet" as const, isDefault: false,
    description: "Continuous scroll-driven playback. Full user control, no magnetic stops. Perfect for long visual reveals and data storytelling.", code: 'mode: "scrub"', Demo: ScrubDemo },
] as const;

const CV = {
  emerald: { badge: "text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/[0.2]", code: "text-emerald-400 bg-emerald-500/[0.06] border-emerald-500/[0.12]" },
  indigo:  { badge: "text-indigo-400 bg-indigo-500/[0.08] border-indigo-500/[0.2]",   code: "text-indigo-400 bg-indigo-500/[0.06] border-indigo-500/[0.12]"   },
  violet:  { badge: "text-violet-400 bg-violet-500/[0.08] border-violet-500/[0.2]",   code: "text-violet-400 bg-violet-500/[0.06] border-violet-500/[0.12]"   },
} as const;

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-500 text-[11px] font-mono tracking-[0.16em] uppercase">
      {label}
    </div>
  );
}

function ModesSection() {
  return (
    <section id="modes" className="py-36 px-6">
      <div className="max-w-6xl mx-auto">
        <FadeUp className="text-center mb-20">
          <SectionLabel label="The Core" />
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">Three ways to move</h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">Each mode maps differently to the GSAP / Lenis stack. Try them live below.</p>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5">
          {MODE_CARDS.map((mode, i) => {
            const v = CV[mode.color];
            return (
              <FadeUp key={mode.id} delay={i * 0.1}>
                <SpotlightCard className="p-6 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-lg">{mode.name}</h3>
                      {mode.isDefault && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/[0.12] text-emerald-500 font-mono border border-emerald-500/[0.2]">DEFAULT</span>}
                    </div>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono border ${v.badge}`}>{mode.badge}</span>
                  </div>
                  <mode.Demo />
                  <p className="text-zinc-500 text-sm mt-5 leading-relaxed flex-1">{mode.description}</p>
                  <code className={`mt-4 block text-xs font-mono px-3 py-2 rounded-lg border ${v.code}`}>{mode.code}</code>
                </SpotlightCard>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Pipeline Section ─────────────────────────────────────────────────────────

const PIPELINE = [
  { label: "ContentBrief",      sub: "Your input"     },
  { label: "NarrativeDesigner", sub: "Frame ranges"   },
  { label: "SceneComposer",     sub: "Zod validation" },
  { label: "<Stage>",           sub: "Mode routing"   },
  { label: "Canvas",            sub: "GSAP ticker"    },
] as const;

function PipelineSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(-1);
  useEffect(() => {
    if (!inView) return;
    const timers = PIPELINE.map((_, i) => setTimeout(() => setActive(i), i * 300 + 300));
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <section id="architecture" className="py-36 px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" aria-hidden="true" />
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-20">
          <SectionLabel label="The Pipeline" />
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">Skip the JSON authoring</h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
            A two-stage agent pipeline turns a content brief into a validated{" "}
            <code className="text-emerald-400 font-mono text-sm bg-emerald-500/[0.08] px-1.5 py-0.5 rounded border border-emerald-500/[0.15]">StorySchema</code>
            {" "}— ready to drop into{" "}
            <code className="text-emerald-400 font-mono text-sm bg-emerald-500/[0.08] px-1.5 py-0.5 rounded border border-emerald-500/[0.15]">&lt;Stage&gt;</code>.
          </p>
        </FadeUp>
        <div ref={ref}>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-0 mb-14">
            {PIPELINE.map((step, i) => (
              <div key={step.label} className="flex items-center gap-0">
                <motion.div animate={{ opacity: active >= i ? 1 : 0.22, y: active >= i ? 0 : 8 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className={`relative px-4 py-3.5 rounded-xl border text-center min-w-[136px] transition-colors duration-300 ${active >= i ? "bg-white/[0.05] border-white/[0.14]" : "bg-white/[0.02] border-white/[0.05]"}`}>
                  {active === i && (
                    <motion.div layoutId="pipe-ring" className="absolute inset-0 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.28] shadow-[0_0_20px_rgba(52,211,153,0.1)]"
                      transition={{ type: "spring", stiffness: 320, damping: 28 }} />
                  )}
                  <div className="relative z-10">
                    <div className="text-white font-mono text-xs font-medium">{step.label}</div>
                    <div className="text-zinc-600 text-[10px] mt-0.5">{step.sub}</div>
                  </div>
                </motion.div>
                {i < PIPELINE.length - 1 && (
                  <motion.div animate={{ opacity: active > i ? 1 : 0.15 }} transition={{ duration: 0.3 }}
                    className="hidden sm:flex items-center px-2 gap-0">
                    <div className="w-5 h-px bg-emerald-700" />
                    <div className="border-t-[3px] border-b-[3px] border-l-[5px] border-transparent border-l-emerald-700" />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          <FadeUp delay={0.3}>
            <div className="rounded-2xl bg-[#0d1117] border border-white/[0.07] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.015]">
                <div className="flex items-center gap-2">
                  {["#ef4444","#f59e0b","#22c55e"].map((c,i) => <div key={i} style={{ background: c }} className="w-3 h-3 rounded-full opacity-60" />)}
                </div>
                <span className="text-zinc-600 font-mono text-xs">pipeline-example.ts</span>
                <div className="w-16" />
              </div>
              <pre className="p-6 text-sm font-mono overflow-x-auto leading-[1.85] text-zinc-300">
                <code>{`import { createPresentation } from `}<span className="text-amber-300">&apos;@/lib/pipeline&apos;</span>{`
import { Stage } from `}<span className="text-amber-300">&apos;@/components/Stage&apos;</span>{`

`}<span className="text-violet-400">const</span>{` { story } = `}<span className="text-emerald-400">createPresentation</span>{`({
  `}<span className="text-sky-300">title</span>{`: `}<span className="text-amber-300">&apos;Product Launch&apos;</span>{`,
  `}<span className="text-sky-300">mode</span>{`:  `}<span className="text-amber-300">&apos;section&apos;</span>{`,  `}<span className="text-zinc-600">// or &apos;snap&apos; | &apos;scrub&apos;</span>{`
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

// ─── Features Bento ───────────────────────────────────────────────────────────

function AnimatedIcon({ anim, children }: { anim: string; children: React.ReactNode }) {
  return <div style={{ animation: anim }} className="flex items-center justify-center">{children}</div>;
}

const FEATURES = [
  { icon: <FrameIcon />, anim: "bento-float 6s ease-in-out infinite", title: "Canvas Engine", description: "GSAP ticker draw loop reads playhead.current.frame — fully decoupled from scroll source. Any mode, one renderer.", tag: "60 fps", wide: true },
  { icon: <BoltIcon />,  anim: "bento-pulse 4s ease-in-out infinite", title: "Lenis Smooth Scroll", description: "Paused in section mode to prevent conflicts. Active with ScrollTrigger sync in snap and scrub.", tag: "Zero conflicts", wide: false },
  { icon: <CheckCircleIcon />, anim: "bento-tilt 5.5s ease-in-out infinite", title: "WCAG 2.1 AA", description: "Keyboard nav, reduced-motion, ARIA live regions, skip links, and a semantic content layer for screen readers.", tag: "Accessible", wide: false },
  { icon: <ShieldIcon />, anim: "bento-drift 8s ease-in-out infinite", title: "Zod Validation", description: "superRefine enforces frame continuity at schema parse time — invalid configs never reach render.", tag: "Type-safe", wide: false },
  { icon: <LinkIcon />,  anim: "bento-glow 7s ease-in-out infinite", title: "Deep Linking", description: "URL hash sync (#scene-N) via replaceState. Users can share any scene directly.", tag: "#scene-2", wide: false },
  { icon: <AgentIcon />, anim: "bento-float 5s ease-in-out infinite 0.5s", title: "Agent Pipeline", description: "NarrativeDesigner → SceneComposer turns a brief into validated JSON. No manual schema authoring required.", tag: "AI-powered", wide: true },
] as const;

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section id="features" className="py-36 px-6 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" aria-hidden="true" />
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-20">
          <SectionLabel label="Batteries Included" />
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">Everything you need</h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto">No half-baked abstractions. Every feature ships with integration tests and docs.</p>
        </FadeUp>
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.65, delay: i * 0.08, ease: EASE }}
              className={f.wide ? "md:col-span-2" : ""}>
              <SpotlightCard className="p-6 h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/[0.1] border border-emerald-500/[0.12] flex items-center justify-center text-emerald-400 shrink-0">
                    <AnimatedIcon anim={f.anim}>{f.icon}</AnimatedIcon>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">{f.tag}</span>
                </div>
                <h3 className="text-white font-semibold text-[15px] mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.description}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

const STATS = [
  { value: "235",         label: "Tests"             },
  { value: "3",           label: "Transition modes"  },
  { value: "TypeScript",  label: "Strict mode"       },
  { value: "WCAG 2.1 AA", label: "Accessibility"     },
  { value: "11",          label: "Sprints"           },
  { value: "MIT",         label: "License"           },
] as const;

function StatsBar() {
  return (
    <FadeUp>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.07] px-6 py-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-bold text-white tabular-nums">{s.value}</div>
              <div className="text-zinc-600 text-[11px] font-mono mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

// ─── Getting Started ──────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01", title: "Clone & install",
    summary: "Get the framework running locally in under a minute.",
    tip: "Requires Node 20+. The dev server starts on localhost:3000.",
    code: (<><span className="text-zinc-500"># Clone the repo</span>{"\n"}<span className="text-emerald-400">git</span>{" clone https://github.com/Hundia/EasyDeck.git"}{"\n"}<span className="text-emerald-400">cd</span>{" EasyDeck\n\n"}<span className="text-zinc-500"># Install dependencies</span>{"\n"}<span className="text-emerald-400">npm</span>{" install\n\n"}<span className="text-zinc-500"># Start the dev server</span>{"\n"}<span className="text-emerald-400">npm</span>{" run dev"}</>),
  },
  {
    number: "02", title: "Prepare your frames",
    summary: "Supply an image sequence — one JPG/PNG per frame, named consistently.",
    tip: "Frames live in /public. The pattern string uses {n} as the frame index placeholder.",
    code: (<><span className="text-zinc-500">{"// Place frames in /public/frames/"}</span>{"\n"}<span className="text-zinc-500">{"// e.g. frame_001.jpg … frame_120.jpg"}</span>{"\n\n"}{"imageSequence: {"}{"\n"}{"  "}<span className="text-sky-300">pattern</span>{":    "}<span className="text-amber-300">&apos;/frames/frame_{"{n}"}.jpg&apos;</span>{","}{"\n"}{"  "}<span className="text-sky-300">frameCount</span>{": "}<span className="text-orange-400">120</span>{",\n}"}</>),
  },
  {
    number: "03", title: "Define your story",
    summary: "Use the agent pipeline for a brief-to-story workflow, or author the schema directly.",
    tip: "Section mode enforces frame continuity — scene[i].endFrame must equal scene[i+1].startFrame.",
    code: (<><span className="text-violet-400">import</span>{" { createPresentation } "}<span className="text-violet-400">from</span>{" "}<span className="text-amber-300">&apos;@/lib/pipeline&apos;</span>{"\n\n"}<span className="text-violet-400">const</span>{" { story } = "}<span className="text-emerald-400">createPresentation</span>{"({"}{"\n"}{"  "}<span className="text-sky-300">title</span>{":  "}<span className="text-amber-300">&apos;Product Launch&apos;</span>{","}{"\n"}{"  "}<span className="text-sky-300">mode</span>{":   "}<span className="text-amber-300">&apos;section&apos;</span>{","}{"\n"}{"  "}<span className="text-sky-300">scenes</span>{": ["}{"\n"}{"    { "}<span className="text-sky-300">id</span>{": "}<span className="text-amber-300">&apos;intro&apos;</span>{",   "}<span className="text-sky-300">frames</span>{": ["}<span className="text-orange-400">0</span>{", "}<span className="text-orange-400">45</span>{"] },"}{"\n"}{"    { "}<span className="text-sky-300">id</span>{": "}<span className="text-amber-300">&apos;feature&apos;</span>{", "}<span className="text-sky-300">frames</span>{": ["}<span className="text-orange-400">45</span>{", "}<span className="text-orange-400">90</span>{"] },"}{"\n"}{"  ],"}{"\n"}{"})"}     </>),
  },
  {
    number: "04", title: "Render with Stage",
    summary: "Drop <Stage> into any full-viewport page. It handles mode routing, canvas, Lenis, and a11y.",
    tip: "Stage needs a full-viewport parent. Wrap it in a div with w-screen h-screen.",
    code: (<><span className="text-violet-400">import</span>{" { Stage } "}<span className="text-violet-400">from</span>{" "}<span className="text-amber-300">&apos;@/components/Stage&apos;</span>{"\n\n"}<span className="text-violet-400">export default function</span>{" "}<span className="text-emerald-400">Presentation</span>{"() {"}{"\n"}{"  "}<span className="text-violet-400">return</span>{" ("}{"\n"}{"    <"}<span className="text-emerald-400">div</span>{" "}<span className="text-sky-300">className</span>{"="}<span className="text-amber-300">&quot;w-screen h-screen&quot;</span>{">"}{"\n"}{"      <"}<span className="text-emerald-400">Stage</span>{" "}<span className="text-sky-300">story</span>{"={story} />"}{"\n"}{"    </"}<span className="text-emerald-400">div</span>{">"}{"\n"}{"  )"}{"\n"}{"}"}</>),
  },
  {
    number: "05", title: "Customize & extend",
    summary: "Tune transition behaviour, accessibility fallbacks, and per-scene overrides.",
    tip: "reducedMotionFallback: 'scrub-instant' collapses all durations to ~0ms — no motion, full content.",
    code: (<><span className="text-zinc-500">{"// Transition knobs on StorySchema"}</span>{"\n"}{"transition: {"}{"\n"}{"  "}<span className="text-sky-300">mode</span>{":           "}<span className="text-amber-300">&apos;section&apos;</span>{","}{"\n"}{"  "}<span className="text-sky-300">duration</span>{":       "}<span className="text-orange-400">0.6</span>{","}{"\n"}{"  "}<span className="text-sky-300">ease</span>{":           "}<span className="text-amber-300">&apos;power2.inOut&apos;</span>{","}{"\n"}{"  "}<span className="text-sky-300">showPagination</span>{": "}<span className="text-orange-400">true</span>{","}{"\n"}{"  "}<span className="text-sky-300">enableKeyboard</span>{": "}<span className="text-orange-400">true</span>{","}{"\n"}{"},"}{"\n\n"}<span className="text-sky-300">reducedMotionFallback</span>{": "}<span className="text-amber-300">&apos;scrub-instant&apos;</span>{","}</>),
  },
] as const;

function GettingStartedSection() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];
  return (
    <section id="start-building" className="py-36 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeUp className="text-center mb-20">
          <SectionLabel label="Quick Start" />
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 tracking-tight">Start building</h2>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed">Five steps from zero to a scrollytelling presentation in your browser.</p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="rounded-2xl bg-white/[0.02] border border-white/[0.07] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)]">
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Sidebar */}
              <div className="md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.07] p-3 flex md:flex-col gap-1 bg-white/[0.01]">
                {STEPS.map((s, i) => {
                  const isActive = active === i, isDone = i < active;
                  return (
                    <button key={s.number} onClick={() => setActive(i)}
                      className={`relative w-full text-left px-3 py-3 rounded-xl transition-colors duration-150 cursor-pointer ${isActive ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"}`}>
                      {isActive && <motion.div layoutId="step-bg" className="absolute inset-0 rounded-xl bg-white/[0.04]" transition={{ type: "spring", stiffness: 340, damping: 30 }} />}
                      <div className="relative flex items-center gap-3 md:gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-mono font-bold transition-all duration-200 ${isDone ? "bg-emerald-500 text-black" : isActive ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40" : "bg-zinc-800 text-zinc-500"}`}>
                          {isDone ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> : s.number}
                        </div>
                        <span className={`text-xs font-medium leading-tight hidden md:block transition-colors duration-150 ${isActive ? "text-white" : isDone ? "text-zinc-400" : "text-zinc-600"}`}>{s.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.28, ease: EASE }} className="flex-1 flex flex-col">
                    <div className="px-7 pt-7 pb-5 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-emerald-500/40 font-mono text-xs">{step.number}</span>
                        <h3 className="text-white font-semibold text-lg">{step.title}</h3>
                      </div>
                      <p className="text-zinc-400 text-sm leading-relaxed">{step.summary}</p>
                    </div>
                    <div className="flex-1 bg-[#0d1117]">
                      <div className="flex items-center gap-1.5 px-5 py-3 border-b border-white/[0.05]">
                        {["#ef4444","#f59e0b","#22c55e"].map((c,i) => <div key={i} style={{ background: c }} className="w-2.5 h-2.5 rounded-full opacity-60" />)}
                      </div>
                      <pre className="p-5 text-sm font-mono overflow-x-auto leading-[1.85] text-zinc-300"><code>{step.code}</code></pre>
                    </div>
                    <div className="px-7 py-4 border-t border-white/[0.06] flex items-start gap-2.5">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" /></svg>
                      <p className="text-zinc-500 text-xs leading-relaxed">{step.tip}</p>
                    </div>
                    <div className="px-7 py-4 flex justify-between items-center border-t border-white/[0.06]">
                      <button onClick={() => setActive(Math.max(0, active - 1))} disabled={active === 0}
                        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-300 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>Previous
                      </button>
                      <div className="flex gap-1.5">
                        {STEPS.map((_, i) => (
                          <button key={i} onClick={() => setActive(i)} className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${i === active ? "bg-emerald-400 w-4" : i < active ? "bg-emerald-700 w-1.5" : "bg-zinc-700 w-1.5"}`} />
                        ))}
                      </div>
                      {active < STEPS.length - 1 ? (
                        <button onClick={() => setActive(active + 1)} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer">
                          Next step<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      ) : (
                        <a href="https://github.com/Hundia/EasyDeck" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                          View on GitHub<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
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

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="py-36 px-6 relative overflow-hidden">
      {/* Aurora bg */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/[0.12] to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/[0.06] blur-[80px] rounded-full" />
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" aria-hidden="true" />
      <FadeUp className="max-w-2xl mx-auto text-center relative z-10">
        <div className="relative inline-block mb-12" aria-hidden="true">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto relative z-10 shadow-[0_0_40px_rgba(52,211,153,0.4)]">
            <EasyDeckLogoLarge />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/25 blur-2xl scale-[2]" />
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight leading-tight">
          Ready to scroll<br />
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">differently?</span>
        </h2>
        <p className="text-zinc-400 text-lg mb-12 leading-relaxed">
          Open source. MIT licensed. Built with the OpenSpec methodology —<br className="hidden sm:block" />
          235 tests and zero compromises on accessibility.
        </p>
        <motion.a href="https://github.com/Hundia/EasyDeck" target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.04, boxShadow: "0 0 48px rgba(52,211,153,0.4)" }} whileTap={{ scale: 0.97 }}
          className="group inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl bg-emerald-500 text-black font-bold text-lg hover:bg-emerald-400 transition-colors duration-200 cursor-pointer shadow-[0_0_28px_rgba(52,211,153,0.25)]">
          <GitHubIcon className="w-5 h-5" />Star on GitHub
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </motion.a>
      </FadeUp>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-700 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-emerald-500/[0.12] flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <rect x="1" y="1" width="5" height="5" rx="1" /><rect x="8" y="1" width="5" height="5" rx="1" opacity="0.55" />
            </svg>
          </div>
          <span>EasyDeck — MIT License</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/Hundia/EasyDeck" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors duration-150">GitHub</a>
          <span aria-hidden="true">·</span>
          <span>Built with OpenSpec methodology</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function EasyDeckLogo() {
  return <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="1" width="5" height="5" rx="1" /><rect x="8" y="1" width="5" height="5" rx="1" opacity="0.55" /><rect x="1" y="8" width="5" height="5" rx="1" opacity="0.35" /><rect x="8" y="8" width="5" height="5" rx="1" opacity="0.18" /></svg>;
}
function EasyDeckLogoLarge() {
  return <svg className="w-10 h-10 text-black" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true"><rect x="1" y="1" width="5" height="5" rx="1" /><rect x="8" y="1" width="5" height="5" rx="1" opacity="0.55" /><rect x="1" y="8" width="5" height="5" rx="1" opacity="0.35" /><rect x="8" y="8" width="5" height="5" rx="1" opacity="0.18" /></svg>;
}
function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>;
}
function ArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>;
}
function FrameIcon() { return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><rect x="2" y="2" width="6" height="5" rx="1" /><rect x="10" y="2" width="6" height="5" rx="1" opacity="0.5" /><rect x="2" y="9" width="6" height="5" rx="1" opacity="0.3" /><rect x="10" y="9" width="6" height="5" rx="1" opacity="0.15" /></svg>; }
function BoltIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>; }
function CheckCircleIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function ShieldIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l2.25 2.25 4.5-4.5m5.25 5.25a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>; }
function LinkIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>; }
function AgentIcon() { return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" /></svg>; }

// ─── Page ─────────────────────────────────────────────────────────────────────

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
