"use client";

import { FlowDiagram, type FlowStep } from "@/app/viewer/components/FlowDiagram";

/* ─── Flow definitions ────────────────────────────────────────────────────── */

const sectionSteps: FlowStep[] = [
  { id: "input", label: "Wheel/Touch/Key" },
  { id: "observer", label: "GSAP Observer" },
  { id: "detect", label: "direction detection" },
  { id: "index", label: "scene index update" },
  { id: "tween", label: "GSAP tween (frame range)" },
  { id: "frame", label: "playhead.frame" },
  { id: "draw", label: "Canvas draw" },
  { id: "overlay", label: "Overlay sync" },
];

const snapSteps: FlowStep[] = [
  { id: "scroll", label: "Native scroll" },
  { id: "lenis", label: "Lenis smooth" },
  { id: "st", label: "ScrollTrigger (progress)" },
  { id: "snap", label: "labelsDirectional snap" },
  { id: "settle", label: "scene settle" },
  { id: "frame", label: "playhead.frame" },
  { id: "draw", label: "Canvas draw" },
];

const scrubSteps: FlowStep[] = [
  { id: "scroll", label: "Native scroll" },
  { id: "lenis", label: "Lenis smooth" },
  { id: "st", label: "ScrollTrigger", sublabel: "scrub:true" },
  { id: "linear", label: "linear progress" },
  { id: "frame", label: "playhead.frame" },
  { id: "draw", label: "Canvas draw" },
];

const agentSteps: FlowStep[] = [
  { id: "brief", label: "ContentBrief" },
  { id: "design", label: "designNarrative()" },
  { id: "nd", label: "NarrativeDesigner" },
  { id: "compose", label: "composeStory()" },
  { id: "sc", label: "SceneComposer" },
  { id: "validate", label: "Zod validate" },
  { id: "schema", label: "StorySchema" },
];

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function ViewerFlowsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:gap-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-10 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 viewer-grid opacity-35" />
        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Runtime journeys
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            <span className="gradient-text">User Experience Flows</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Follow each runtime pipeline from user input or authored content all
            the way through stage control and rendered canvas frame.
          </p>
        </div>
      </section>

      {/* Section Mode */}
      <section
        aria-labelledby="section-mode-heading"
        className="flow-panel-enter rounded-[32px] border border-purple-500/20 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8"
        style={{ animationDelay: "0ms" }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-8 w-1 rounded-full bg-gradient-to-b from-purple-400 to-purple-700"
          />
          <h2
            id="section-mode-heading"
            className="text-xl font-semibold text-zinc-100"
          >
            Section Mode Flow
          </h2>
        </div>
        <FlowDiagram
          title="Observer-driven scene progression"
          steps={sectionSteps}
          accentColor="purple"
        />
      </section>

      {/* Snap Mode */}
      <section
        aria-labelledby="snap-mode-heading"
        className="flow-panel-enter rounded-[32px] border border-cyan-500/20 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8"
        style={{ animationDelay: "80ms" }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-8 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-cyan-700"
          />
          <h2
            id="snap-mode-heading"
            className="text-xl font-semibold text-zinc-100"
          >
            Snap Mode Flow
          </h2>
        </div>
        <FlowDiagram
          title="ScrollTrigger magnetic snap"
          steps={snapSteps}
          accentColor="cyan"
        />
      </section>

      {/* Scrub Mode */}
      <section
        aria-labelledby="scrub-mode-heading"
        className="flow-panel-enter rounded-[32px] border border-emerald-500/20 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8"
        style={{ animationDelay: "160ms" }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-8 w-1 rounded-full bg-gradient-to-b from-emerald-400 to-emerald-700"
          />
          <h2
            id="scrub-mode-heading"
            className="text-xl font-semibold text-zinc-100"
          >
            Scrub Mode Flow
          </h2>
        </div>
        <FlowDiagram
          title="Continuous linear scrub"
          steps={scrubSteps}
          accentColor="emerald"
        />
      </section>

      {/* Agent Pipeline */}
      <section
        aria-labelledby="agent-heading"
        className="flow-panel-enter rounded-[32px] border border-amber-500/20 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8"
        style={{ animationDelay: "240ms" }}
      >
        <div className="mb-5 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="h-8 w-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-700"
          />
          <h2
            id="agent-heading"
            className="text-xl font-semibold text-zinc-100"
          >
            Agent Pipeline Flow
          </h2>
        </div>
        <FlowDiagram
          title="ContentBrief to StorySchema"
          steps={agentSteps}
          accentColor="amber"
        />
      </section>
    </div>
  );
}

