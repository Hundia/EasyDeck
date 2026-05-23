"use client";

import { useMemo, useState } from "react";
import { CodeBlock } from "@/app/viewer/components/CodeBlock";
import { SchemaTree, type SchemaField } from "@/app/viewer/components/SchemaTree";

interface SchemaDefinition {
  subtitle: string;
  summary: string;
  fields: SchemaField[];
  validExample: string;
  invalidExample: string;
  invalidError: string;
}

const schemaCatalog = {
  StorySchema: {
    subtitle: "Top-level story contract shared across runtime and authoring flows.",
    summary: "StorySchema combines metadata, ordered scenes, and inherited transition defaults. It is the final shape the viewer expects after pipeline assembly.",
    fields: [
      { name: "title", type: "string", description: "Story title" },
      { name: "version", type: "string", description: "Semver" },
      {
        name: "meta",
        type: "object",
        description: "Global story metadata and aggregate counts",
        children: [
          { name: "author", type: "string", optional: true, description: "Optional story author" },
          { name: "description", type: "string", optional: true, description: "Optional short summary" },
          { name: "totalFrames", type: "number", description: "Sum of all scene frames" },
        ],
      },
      { name: "scenes", type: "array", description: "Ordered scene list" },
      { name: "defaults", type: "object", description: "Inherited transition defaults" },
    ],
    validExample: JSON.stringify(
      {
        title: "Product Launch",
        version: "1.0.0",
        meta: { totalFrames: 300 },
        scenes: [
          { id: "intro", title: "Welcome", frameRange: { start: 0, end: 100 } },
          { id: "features", title: "Features", frameRange: { start: 100, end: 200 } },
          { id: "cta", title: "Call to Action", frameRange: { start: 200, end: 300 } },
        ],
        defaults: { mode: "section" },
      },
      null,
      2,
    ),
    invalidExample: JSON.stringify(
      {
        title: "Broken Story",
        version: "1.0.0",
        meta: { totalFrames: 300 },
        scenes: [
          { id: "s1", title: "Scene 1", frameRange: { start: 0, end: 100 } },
          { id: "s2", title: "Scene 2", frameRange: { start: 150, end: 300 } },
        ],
        defaults: { mode: "section" },
      },
      null,
      2,
    ),
    invalidError: "Frame continuity violation: scene 's2' starts at 150 but previous ends at 100",
  },
  SceneConfig: {
    subtitle: "Per-scene playback and content configuration.",
    summary: "SceneConfig defines the visual segment, optional overlay payload, and any transition override that diverges from story defaults.",
    fields: [
      { name: "id", type: "string", description: "Stable scene identifier" },
      { name: "title", type: "string", description: "Readable scene title" },
      {
        name: "frameRange",
        type: "object",
        description: "Inclusive start and exclusive end frame window",
        children: [
          { name: "start", type: "number", description: "First frame in the scene" },
          { name: "end", type: "number", description: "Last frame boundary" },
        ],
      },
      {
        name: "overlay",
        type: "object",
        optional: true,
        description: "Optional text overlay block",
        children: [
          { name: "content", type: "string", description: "Overlay copy" },
          { name: "position", type: "union", description: "top | center | bottom" },
        ],
      },
      { name: "transition", type: "object", optional: true, description: "Overrides story default" },
    ],
    validExample: JSON.stringify(
      {
        id: "features",
        title: "Feature Sweep",
        frameRange: { start: 100, end: 200 },
        overlay: { content: "Fast onboarding", position: "center" },
        transition: { mode: "snap", snap: true },
      },
      null,
      2,
    ),
    invalidExample: JSON.stringify(
      {
        id: "features",
        title: "Feature Sweep",
        frameRange: { start: 220, end: 180 },
      },
      null,
      2,
    ),
    invalidError: "Frame range invalid: start must be less than end",
  },
  TransitionConfig: {
    subtitle: "Runtime behavior knobs for section, snap, and scrub modes.",
    summary: "TransitionConfig controls how motion feels. Story defaults can be inherited or selectively overridden per scene.",
    fields: [
      { name: "mode", type: "union", description: "section | snap | scrub" },
      { name: "duration", type: "number", optional: true, description: "Tween duration for section mode" },
      { name: "snap", type: "boolean", optional: true, description: "Enable snapping behavior" },
      { name: "scrub", type: "union", optional: true, description: "boolean | number smoothing factor" },
    ],
    validExample: JSON.stringify(
      {
        mode: "section",
        duration: 1.1,
      },
      null,
      2,
    ),
    invalidExample: JSON.stringify(
      {
        mode: "section",
        duration: -0.4,
      },
      null,
      2,
    ),
    invalidError: "Duration must be zero or greater",
  },
  ContentBrief: {
    subtitle: "Pipeline input that guides narrative generation.",
    summary: "ContentBrief captures author intent before the agent pipeline expands it into a full story definition.",
    fields: [
      { name: "topic", type: "string", description: "Presentation subject" },
      { name: "audience", type: "string", description: "Intended audience" },
      { name: "tone", type: "union", description: "professional | casual | dramatic" },
      { name: "sceneCount", type: "number", description: "Requested number of scenes" },
      { name: "framesPerScene", type: "number", description: "Target frames allocated to each scene" },
    ],
    validExample: JSON.stringify(
      {
        topic: "Q4 Product Launch",
        audience: "Enterprise buyers",
        tone: "professional",
        sceneCount: 5,
        framesPerScene: 60,
      },
      null,
      2,
    ),
    invalidExample: JSON.stringify(
      {
        topic: "Q4 Product Launch",
        audience: "Enterprise buyers",
        tone: "bold",
        sceneCount: 0,
        framesPerScene: 60,
      },
      null,
      2,
    ),
    invalidError: "Tone must be professional, casual, or dramatic; sceneCount must be at least 1",
  },
  OverlaySchema: {
    subtitle: "Overlay content attached to a scene at runtime.",
    summary: "OverlaySchema models presentation copy and placement so scene overlays can remain declarative and easy to validate.",
    fields: [
      { name: "content", type: "string", description: "Overlay body copy" },
      { name: "position", type: "union", description: "top | center | bottom" },
      { name: "emphasis", type: "boolean", optional: true, description: "Enable stronger visual treatment" },
    ],
    validExample: JSON.stringify(
      {
        content: "Trusted by 1,200 teams",
        position: "bottom",
        emphasis: true,
      },
      null,
      2,
    ),
    invalidExample: JSON.stringify(
      {
        content: "",
        position: "left",
      },
      null,
      2,
    ),
    invalidError: "Overlay content cannot be empty and position must be top, center, or bottom",
  },
} satisfies Record<string, SchemaDefinition>;

const schemaKeys = Object.keys(schemaCatalog) as Array<keyof typeof schemaCatalog>;

const validationRules = [
  {
    title: "Frame continuity (section mode)",
    detail: "Adjacent scenes must share frame boundaries so one scene ends exactly where the next begins.",
  },
  {
    title: "Total frames consistency",
    detail: "meta.totalFrames must equal the last scene's end frame so playback budget and story metadata stay aligned.",
  },
  {
    title: "Unique IDs",
    detail: "All scene IDs must be unique to preserve stable navigation, anchors, and diagnostics.",
  },
  {
    title: "Frame range validity",
    detail: "Every frame range must satisfy start < end to avoid empty or negative-length scenes.",
  },
] as const;

function SchemaTab({
  label,
  active,
  onSelect,
}: {
  label: keyof typeof schemaCatalog;
  active: boolean;
  onSelect: (label: keyof typeof schemaCatalog) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`schema-panel-${label}`}
      id={`schema-tab-${label}`}
      onClick={() => onSelect(label)}
      className={[
        "group relative rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
        active ? "text-zinc-50" : "text-zinc-400 hover:text-zinc-200",
      ].join(" ")}
    >
      <span
        className={[
          "absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 transition-transform duration-300",
          active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-60",
        ].join(" ")}
        aria-hidden="true"
      />
      {label}
    </button>
  );
}

export default function ViewerSchemasPage() {
  const [activeSchema, setActiveSchema] = useState<(typeof schemaKeys)[number]>("StorySchema");
  const schema = useMemo(() => schemaCatalog[activeSchema], [activeSchema]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:gap-10">
      <section className="relative overflow-hidden rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 px-6 py-10 backdrop-blur-xl sm:px-8 lg:px-10 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.12),transparent_34%),radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_42%)]" />
        <div className="pointer-events-none absolute inset-0 viewer-grid opacity-40" />
        <div className="relative max-w-3xl">
          <span className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
            Sprint 10 • Schemas
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">Schema Explorer</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Zod validation schemas powering story configuration
          </p>
        </div>
      </section>

      <section className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-4 backdrop-blur-xl sm:p-6">
        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Schema selector">
          {schemaKeys.map((schemaKey) => (
            <SchemaTab key={schemaKey} label={schemaKey} active={schemaKey === activeSchema} onSelect={setActiveSchema} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article
          id={`schema-panel-${activeSchema}`}
          role="tabpanel"
          aria-labelledby={`schema-tab-${activeSchema}`}
          className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Schema detail</p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-100 sm:text-3xl">{activeSchema}</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-zinc-400">{schema.subtitle}</p>
          </div>
          <p className="mb-6 max-w-3xl text-sm leading-6 text-zinc-400">{schema.summary}</p>
          <SchemaTree fields={schema.fields} />
        </article>

        <article className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Validation rules</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Runtime guarantees</h2>
          </div>
          <div className="space-y-4">
            {validationRules.map((rule) => (
              <div key={rule.title} className="rounded-3xl border border-zinc-800/60 bg-zinc-950/70 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_16px_rgba(16,185,129,0.5)]" />
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">{rule.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{rule.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="rounded-[32px] border border-zinc-800/50 bg-zinc-900/50 p-6 backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">Live examples</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-100">Parse outcomes for {activeSchema}</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">Review a known-good payload beside a broken one to see how authoring mistakes surface before runtime.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <CodeBlock code={schema.validExample} language="json" status="valid" />
          <CodeBlock code={schema.invalidExample} language="json" status="invalid" error={schema.invalidError} />
        </div>
      </section>
    </div>
  );
}
