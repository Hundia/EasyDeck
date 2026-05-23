"use client";

import { useState } from "react";
import { FlowDiagram } from "@/app/viewer/components/FlowDiagram";
import { NodeGraph, type GraphNode } from "@/app/viewer/components/NodeGraph";

/* ─── Component tree ──────────────────────────────────────────────────────── */

const componentTree: GraphNode = {
  id: "stage",
  label: "<Stage>",
  children: [
    { id: "resolve", label: "resolveTransitionMode()" },
    {
      id: "section",
      label: "<SectionStage>",
      children: [{ id: "observer", label: "Observer → playhead" }],
    },
    {
      id: "snap",
      label: "<SnapStage>",
      children: [{ id: "st-snap", label: "ScrollTrigger(snap) → playhead" }],
    },
    {
      id: "scrub",
      label: "<ScrubStage>",
      children: [{ id: "st-scrub", label: "ScrollTrigger(scrub) → playhead" }],
    },
    {
      id: "canvas",
      label: "<ImageSequenceCanvas>",
      children: [
        { id: "frame-link", label: "playhead.current.frame" },
        { id: "usePlayhead", label: "usePlayhead()" },
        { id: "usePreloader", label: "usePreloader()" },
        { id: "ticker", label: "gsap.ticker → draw()" },
      ],
    },
  ],
};

/* ─── Data flow steps ─────────────────────────────────────────────────────── */

const dataFlowSteps = [
  { id: "brief", label: "ContentBrief" },
  { id: "nd", label: "NarrativeDesigner" },
  { id: "sc", label: "SceneComposer" },
  { id: "schema", label: "StorySchema" },
  { id: "stage-out", label: "Stage" },
  { id: "canvas-out", label: "Canvas" },
];

/* ─── Layer architecture ──────────────────────────────────────────────────── */

type LayerAccent = "purple" | "cyan" | "emerald" | "amber" | "rose";

interface LayerModule {
  name: string;
  /** Inline annotation — renders inside a <code> so the li text ≠ name */
  note?: string;
}

interface Layer {
  id: string;
  title: string;
  accent: LayerAccent;
  subtitle: string;
  modules: LayerModule[];
}

const layers: Layer[] = [
  {
    id: "story-definition",
    title: "Story Definition",
    accent: "purple",
    subtitle: "Zod schemas & scene contracts",
    modules: [
      { name: "ContentBriefSchema" },
      { name: "Story schema contract", note: "(Zod)" },
      { name: "Scene definitions" },
    ],
  },
  {
    id: "agent-pipeline",
    title: "Agent Pipeline",
    accent: "cyan",
    subtitle: "NarrativeDesigner → SceneComposer",
    modules: [
      { name: "designNarrative()" },
      { name: "composeStory()" },
      { name: "Zod validation" },
    ],
  },
  {
    id: "stage-runtime",
    title: "Stage Runtime",
    accent: "emerald",
    subtitle: "section / snap / scrub routing",
    modules: [
      { name: "SectionStage" },
      { name: "SnapStage" },
      { name: "ScrubStage" },
    ],
  },
  {
    id: "canvas-engine",
    title: "Canvas Engine",
    accent: "amber",
    subtitle: "playhead-driven frame render",
    modules: [
      { name: "ImageSequenceCanvas" },
      { name: "usePlayhead()" },
      { name: "usePreloader()" },
      { name: "gsap.ticker" },
    ],
  },
  {
    id: "ux-shell",
    title: "UX Shell",
    accent: "rose",
    subtitle: "pagination, keyboard, a11y",
    modules: [
      { name: "Sidebar navigation" },
      { name: "Keyboard controls" },
      { name: "Reduced-motion support" },
    ],
  },
];

/* ─── Accent style maps ───────────────────────────────────────────────────── */

const accentBar: Record<LayerAccent, string> = {
  purple: "from-purple-500 to-purple-700",
  cyan: "from-cyan-500 to-cyan-700",
  emerald: "from-emerald-500 to-emerald-700",
  amber: "from-amber-500 to-amber-700",
  rose: "from-rose-500 to-rose-700",
};

const accentBorder: Record<LayerAccent, string> = {
  purple: "border-purple-500/25 hover:border-purple-400/35",
  cyan: "border-cyan-500/25 hover:border-cyan-400/35",
  emerald: "border-emerald-500/25 hover:border-emerald-400/35",
  amber: "border-amber-500/25 hover:border-amber-400/35",
  rose: "border-rose-500/25 hover:border-rose-400/35",
};

const accentModuleBadge: Record<LayerAccent, string> = {
  purple: "border-purple-500/20 bg-purple-950/25 text-purple-200",
  cyan: "border-cyan-500/20 bg-cyan-950/25 text-cyan-200",
  emerald: "border-emerald-500/20 bg-emerald-950/25 text-emerald-200",
  amber: "border-amber-500/20 bg-amber-950/25 text-amber-200",
  rose: "border-rose-500/20 bg-rose-950/25 text-rose-200",
};

export default function ViewerArchitecturePage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  function toggle(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:gap-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-10 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_34%)]" />
        <div className="pointer-events-none absolute inset-0 viewer-grid opacity-35" />
        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-purple-300">
            System maps
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            <span className="gradient-text">Architecture Visualization</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Interactive overview of the EasyDeck component tree, agent
            data-flow, and layered runtime architecture.
          </p>
        </div>
      </section>

      {/* Component Tree */}
      <section aria-labelledby="tree-heading" className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8">
        <h2 id="tree-heading" className="gradient-text text-2xl font-semibold text-zinc-50">
          Component Tree
        </h2>
        <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-800/60 bg-zinc-950/70 p-4 sm:p-5">
          <NodeGraph root={componentTree} />
        </div>
      </section>

      {/* Data Flow Diagram */}
      <section aria-labelledby="flow-heading" className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8">
        <h2 id="flow-heading" className="gradient-text text-2xl font-semibold text-zinc-50">
          Data Flow Diagram
        </h2>
        <div className="mt-6">
          <FlowDiagram
            title="Agent to Canvas Pipeline"
            steps={dataFlowSteps}
            accentColor="cyan"
          />
        </div>
      </section>

      {/* Layer Architecture */}
      <section aria-labelledby="layers-heading" className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8">
        <h2 id="layers-heading" className="gradient-text text-2xl font-semibold text-zinc-50">
          Layer Architecture
        </h2>
        <div className="mt-6 space-y-3">
          {layers.map((layer) => {
            const isOpen = expanded === layer.id;
            return (
              <div
                key={layer.id}
                className={`overflow-hidden rounded-2xl border bg-zinc-950/50 transition-colors duration-200 ${accentBorder[layer.accent]}`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-zinc-800/25"
                  onClick={() => toggle(layer.id)}
                >
                  <span
                    aria-hidden="true"
                    className={`h-10 w-1 flex-shrink-0 rounded-full bg-gradient-to-b ${accentBar[layer.accent]}`}
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-zinc-100">
                      {layer.title}
                    </span>
                    <span className="block text-xs text-zinc-500">
                      {layer.subtitle}
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                    className={`h-4 w-4 flex-shrink-0 text-zinc-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="border-t border-zinc-800/50 px-5 pb-5 pt-3">
                    <ul className="flex flex-wrap gap-2" role="list">
                      {layer.modules.map((mod) => (
                        <li
                          key={mod.name}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-mono ${accentModuleBadge[layer.accent]}`}
                        >
                          {mod.name}
                          {mod.note && (
                            <code className="ml-1 font-sans text-[10px] opacity-55">
                              {" "}
                              {mod.note}
                            </code>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
