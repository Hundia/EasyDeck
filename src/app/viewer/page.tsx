"use client";

import type { ReactNode } from "react";
import { ArchitectureDiagram } from "@/app/viewer/components/ArchitectureDiagram";
import { FeatureCard } from "@/app/viewer/components/FeatureCard";
import { StatsCard } from "@/app/viewer/components/StatsCard";

interface Stat {
  value: string;
  label: string;
  accent: "emerald" | "cyan" | "amber" | "purple";
  subLabel?: string;
}

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

const stats: Stat[] = [
  { value: "255", label: "Tests Passing", accent: "emerald" },
  { value: "9", label: "Sprints Complete", accent: "cyan" },
  { value: "138KB", label: "Bundle", accent: "amber", subLabel: "/ 200KB budget" },
];

const features: Feature[] = [
  {
    title: "Transition Modes",
    description: "Observer-powered section mode, magnetic snap, and continuous scrub routing from one stage contract.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M5 7h14" />
        <path d="M5 12h8" />
        <path d="M5 17h14" />
      </svg>
    ),
  },
  {
    title: "Canvas Engine",
    description: "Playhead-first rendering keeps image sequences smooth, deterministic, and independent from scroll position.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="4" y="5" width="16" height="12" rx="2" />
        <path d="M10 19h4" />
      </svg>
    ),
  },
  {
    title: "Lenis Smoothing",
    description: "Smooth scrolling stays in sync with runtime mode selection, then pauses instantly for controlled section scenes.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M5 14c2.5-6 11.5-6 14 0" />
        <path d="M5 10c2.5 6 11.5 6 14 0" />
      </svg>
    ),
  },
  {
    title: "Accessibility",
    description: "Keyboard navigation, reduced-motion support, semantic overlays, and polished focus states are first-class.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v6" />
        <path d="M7 11h10" />
        <path d="m9 21 3-8 3 8" />
      </svg>
    ),
  },
  {
    title: "Agent Pipeline",
    description: "NarrativeDesigner and SceneComposer transform briefs into validated stories with continuity preserved.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <rect x="4" y="4" width="6" height="6" rx="1.5" />
        <rect x="14" y="14" width="6" height="6" rx="1.5" />
        <path d="M10 7h4a2 2 0 0 1 2 2v5" />
      </svg>
    ),
  },
  {
    title: "Design Tokens",
    description: "Dark glass surfaces, measured spacing, and rich accent hues keep docs feeling premium and readable.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
        <path d="M12 3v18" />
        <path d="M4 8h16" />
        <path d="M4 16h16" />
      </svg>
    ),
  },
];

export default function ViewerDashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:gap-10">
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-10 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_36%)]" />
        <div className="pointer-events-none absolute inset-0 viewer-grid opacity-40" />
        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-purple-300">
            Sprint 10 • Framework Viewer
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
            <span className="gradient-text">EasyDeck Framework</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            A polished command center for architecture, flows, schemas, and sprint delivery — designed with premium dark surfaces and static-export-friendly motion.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-5 backdrop-blur-xl sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Architecture overview</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-100 sm:text-3xl">Five layers, one delivery path</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-zinc-400">
              From validated story inputs down to polished controls, each layer stays cleanly separated and animation-ready.
            </p>
          </div>
          <ArchitectureDiagram />
        </article>

        <article className="rounded-[32px] border border-zinc-800/50 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Highlights</p>
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/60 p-4">
              <p className="text-sm font-medium text-zinc-200">Static-export safe motion</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">CSS-driven gradients and pulse lines deliver polish without introducing runtime complexity.</p>
            </div>
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/60 p-4">
              <p className="text-sm font-medium text-zinc-200">Scalable docs shell</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">The viewer layout is ready for future Architecture, Flows, Docs, Sprints, Schemas, and Modes surfaces.</p>
            </div>
            <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/60 p-4">
              <p className="text-sm font-medium text-zinc-200">Premium dashboard language</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Glass panels, deep gradients, and restrained accent lighting echo Linear, Vercel, and Stripe docs aesthetics.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Capability surface</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-100 sm:text-3xl">Core viewer modules</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">Six polished entry points summarize the engine’s most important runtime and authoring capabilities.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
}
