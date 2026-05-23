"use client";

import { Fragment } from "react";

export interface DocEntry {
  id: string;
  section: string;
  item: string;
  heading: string;
  summary: string;
  bullets: string[];
  code?: { lang: string; text: string };
}

export const docsTree: DocEntry[] = [
  {
    id: "architecture-overview",
    section: "Architecture",
    item: "Overview",
    heading: "Architecture Overview",
    summary:
      "Story definition, agent pipeline, stage runtime, canvas engine, and UX shell stay separated so the same validated story can render through multiple transition models.",
    bullets: [
      "Stories are Zod-validated before any stage component receives them.",
      "Three transition modes — section, snap, scrub — share the same scene schema and canvas.",
      "The playhead API decouples frame production from scroll source.",
      "Lenis integration is mode-dependent: paused in section mode, active in scrub mode.",
      "Accessibility and keyboard handling are first-class, not add-ons.",
    ],
    code: {
      lang: "text",
      text: `Agent output → StorySchema parse → Stage selection
          → Playhead updates → Canvas draw → Overlay sync`,
    },
  },
  {
    id: "architecture-transition-modes",
    section: "Architecture",
    item: "Transition Modes",
    heading: "Transition Modes",
    summary:
      "Three runtime modes share the same canvas and schema contract but drive the playhead differently — section for discrete slides, snap for magnetic storytelling, scrub for continuous reveals.",
    bullets: [
      "section: GSAP Observer captures gestures; one gesture advances one scene.",
      "snap: ScrollTrigger scrubs continuously then settles to directional labels.",
      "scrub: ScrollTrigger maps native scroll progress directly to timeline.",
      "section is the default because the framework is presentation-first.",
      "Reduced-motion should collapse heavy motion and fall back to scrub-instant or static.",
    ],
    code: {
      lang: "ts",
      text: `type TransitionMode = "section" | "snap" | "scrub";

// Per-story default, per-scene override
const effective = { ...story.transition, ...scene.transition };`,
    },
  },
  {
    id: "architecture-image-sequence-pipeline",
    section: "Architecture",
    item: "Image Sequence Pipeline",
    heading: "Image Sequence Pipeline",
    summary:
      "The canvas engine is playhead-first — it consumes a frame number and draws the matching image, staying agnostic to whether that frame came from a scroll event or a GSAP tween.",
    bullets: [
      "Images are preloaded into an off-screen cache before playback begins.",
      "The canvas component accepts a playhead ref, not a scroll progress value.",
      "Frame continuity in section mode is enforced by StorySchema superRefine.",
      "Adjacent scenes must share frame boundaries so cuts are invisible.",
      "Scrub mode drives the playhead through ScrollTrigger progress; section mode uses tweens.",
    ],
    code: {
      lang: "ts",
      text: `// Playhead-first API
<ImageSequenceCanvas
  frames={scene.frames}
  playhead={playheadRef}  // { frame: number }
  width={1920}
  height={1080}
/>`,
    },
  },
  {
    id: "architecture-agent-pipeline",
    section: "Architecture",
    item: "Agent Pipeline",
    heading: "Agent Pipeline",
    summary:
      "NarrativeDesigner breaks briefs into scenes with mode rationale; SceneComposer validates structure, enforces frame continuity, and emits runtime-ready config.",
    bullets: [
      "NarrativeDesigner proposes scenes, assigns transition modes, and emits normalized overlay timing.",
      "SceneComposer validates the draft against StorySchema before any render.",
      "Agents emit configuration data — not hardcoded GSAP calls.",
      "A review loop checks accessibility and mode choices before engineering picks up.",
      "The runtime owns all animation APIs; agents stay portable and reviewable.",
    ],
    code: {
      lang: "text",
      text: `brief → NarrativeDesigner → draft scenes
      → SceneComposer → validated StorySchema → stage runtime`,
    },
  },
  {
    id: "components-overview",
    section: "Components",
    item: "Overview",
    heading: "Components Overview",
    summary:
      "Five stage components and a canvas renderer form the visual engine, each with a strict single responsibility and a shared playhead contract.",
    bullets: [
      "SectionStage: pinned, gesture-driven, one-scene-at-a-time.",
      "SnapStage: continuous scrub that settles on directional labels.",
      "ScrubStage: direct scroll-to-progress mapping.",
      "ImageSequenceCanvas: frame-accurate renderer decoupled from scroll source.",
      "Pagination: ARIA-compliant scene indicator with keyboard support.",
    ],
  },
  {
    id: "components-section-stage",
    section: "Components",
    item: "Section Stage",
    heading: "Section Stage",
    summary:
      "SectionStage pins the viewport, captures wheel/touch/pointer via GSAP Observer, and tweens the playhead to each scene's end frame on a single gesture.",
    bullets: [
      "Observer type covers wheel, touch, and pointer; extra gestures drop while animating.",
      "A separate keydown listener handles ArrowUp/ArrowDown and PageUp/PageDown.",
      "Calls lenis.stop() on mount and lenis.start() on unmount.",
      "Supports onSceneChange callback for pagination sync.",
      "wheelSpeed defaults to -1 so scroll-down advances the story forward.",
    ],
    code: {
      lang: "ts",
      text: `Observer.create({
  type: "wheel,touch,pointer",
  wheelSpeed: -1,
  onDown: () => !animating && gotoScene(current - 1),
  onUp:   () => !animating && gotoScene(current + 1),
  tolerance: 10,
  preventDefault: true,
});`,
    },
  },
  {
    id: "components-snap-stage",
    section: "Components",
    item: "Snap Stage",
    heading: "Snap Stage",
    summary:
      "SnapStage builds a label-tagged GSAP timeline and uses ScrollTrigger directional snap to settle scroll position on scene boundaries after free-form scrubbing.",
    bullets: [
      "One label per scene in the timeline; snapTo: 'labelsDirectional' honors direction of travel.",
      "snapDelay, snapDurationMin, and snapDurationMax come from the schema override.",
      "Works best with the Lenis snap addon to prevent snap-vs-inertia conflicts.",
      "Suits Apple-style product storytelling where motion feels fluid but lands on authored beats.",
      "Overlay timing is time-based relative to scene duration.",
    ],
  },
  {
    id: "components-scrub-stage",
    section: "Components",
    item: "Scrub Stage",
    heading: "Scrub Stage",
    summary:
      "ScrubStage ties timeline progress directly to scroll position — no discrete jumps, just continuous motion that makes Lenis feel natural.",
    bullets: [
      "ScrollTrigger scrub value maps native scroll to timeline progress.",
      "No labels required; the whole timeline is one continuous animation.",
      "Recommended for long hero reveals, product spins, and single-canvas narratives.",
      "Safest reduced-motion fallback: set scrub to instant (scrub: 0).",
      "Lenis should remain active in this mode for best feel.",
    ],
  },
  {
    id: "components-image-sequence-canvas",
    section: "Components",
    item: "Image Sequence Canvas",
    heading: "Image Sequence Canvas",
    summary:
      "A pure canvas renderer that accepts a playhead ref and draws the matching pre-cached frame on every animation tick.",
    bullets: [
      "Accepts frames array and a playhead ref ({ frame: number }).",
      "Preloads all images into an HTMLImageElement cache before first paint.",
      "Draws are synchronous and performed inside a GSAP ticker or rAF loop.",
      "Width and height props keep canvas resolution independent of CSS display size.",
      "Zero dependency on ScrollTrigger — reusable across all three stage modes.",
    ],
    code: {
      lang: "ts",
      text: `// Minimal usage
const playhead = useRef({ frame: 0 });

<ImageSequenceCanvas
  frames={frames}
  playhead={playhead}
  width={1920}
  height={1080}
  className="w-full h-full object-cover"
/>`,
    },
  },
  {
    id: "components-pagination",
    section: "Components",
    item: "Pagination",
    heading: "Pagination",
    summary:
      "A slim ARIA-compliant scene indicator that reflects current position and provides accessible navigation for keyboard and assistive technology users.",
    bullets: [
      "Renders one button per scene; active scene gets aria-current='page'.",
      "Keyboard: ArrowUp/ArrowDown move focus; Enter/Space confirm.",
      "Controlled externally via currentScene and onSceneChange props.",
      "Visual dots scale on active to communicate position without color alone.",
      "Screen-reader label includes scene index and total count.",
    ],
  },
  {
    id: "schemas-overview",
    section: "Schemas",
    item: "Overview",
    heading: "Schemas Overview",
    summary:
      "Zod schemas are the contract between agent output, engineering, and stage runtime — they validate story config early and reject invalid combinations before render.",
    bullets: [
      "TransitionMode: 'section' | 'snap' | 'scrub' — enforced enum.",
      "TransitionConfig: global or per-scene motion knobs with sane defaults.",
      "SceneConfig: frame range, image sequence, overlays, and transition overrides.",
      "StorySchema: top-level definition with superRefine for frame continuity.",
      "pauseLenisInSection and reducedMotionFallback are schema-level flags.",
    ],
    code: {
      lang: "ts",
      text: `const TransitionMode = z.enum(["section", "snap", "scrub"]);

const SceneConfig = z.object({
  id: z.string(),
  startFrame: z.number().int().nonnegative(),
  endFrame: z.number().int().positive(),
  transition: TransitionConfig.partial().optional(),
  overlays: z.array(OverlayConfig).optional(),
});`,
    },
  },
  {
    id: "schemas-story-schema",
    section: "Schemas",
    item: "Story Schema",
    heading: "Story Schema",
    summary:
      "StorySchema is the top-level Zod shape that ties together global metadata, a default transition config, and an ordered array of scenes.",
    bullets: [
      "title, id, and imagePattern are required string fields.",
      "transition field sets story-wide defaults for mode, duration, and easing.",
      "scenes array must contain at least one SceneConfig.",
      "superRefine enforces frame continuity: each scene.startFrame must equal previous endFrame in section mode.",
      "Parsing at app start catches authoring errors before any GSAP code runs.",
    ],
  },
  {
    id: "schemas-scene-config",
    section: "Schemas",
    item: "Scene Config",
    heading: "Scene Config",
    summary:
      "SceneConfig holds per-scene frame boundaries, image reference, overlay timing, and an optional transition override that merges with the story default.",
    bullets: [
      "startFrame and endFrame define which images the canvas renders for this scene.",
      "transition is a partial override: missing keys fall back to story.transition.",
      "overlays use normalized 0-1 enterAt/exitAt so they work across time and progress modes.",
      "transitionRationale is an optional string that agents and reviewers use to audit mode choices.",
      "SceneComposer validates the merged config after all overrides are applied.",
    ],
  },
  {
    id: "accessibility-overview",
    section: "Accessibility",
    item: "Overview",
    heading: "Accessibility Overview",
    summary:
      "Accessibility is a first-class delivery requirement — keyboard navigation, reduced-motion support, ARIA semantics, and visible focus states are all mandatory.",
    bullets: [
      "Semantic narrative content lives below the canvas as progressive enhancement.",
      "prefers-reduced-motion collapses or bypasses heavy animation.",
      "Focus must be visible at all times; color alone never conveys state.",
      "Pagination ARIA patterns keep scene position perceivable without visual context.",
      "Touch tolerance tuning prevents accidental scene changes on mobile.",
    ],
  },
  {
    id: "accessibility-keyboard-navigation",
    section: "Accessibility",
    item: "Keyboard Navigation",
    heading: "Keyboard Navigation",
    summary:
      "Section mode requires explicit keyboard handling because GSAP Observer does not capture keyboard input — a separate listener handles navigation keys.",
    bullets: [
      "ArrowDown, ArrowRight, and PageDown advance to the next scene.",
      "ArrowUp, ArrowLeft, and PageUp return to the previous scene.",
      "Home and End jump to first and last scenes respectively.",
      "Enter and Space activate focused pagination dots.",
      "Focus is trapped within the stage while it is active and released on exit.",
    ],
  },
  {
    id: "accessibility-reduced-motion",
    section: "Accessibility",
    item: "Reduced Motion",
    heading: "Reduced Motion",
    summary:
      "When prefers-reduced-motion: reduce is active, gesture-driven stages should collapse motion, disable tweens, and fall back to instant cuts or static content.",
    bullets: [
      "Detect via window.matchMedia('(prefers-reduced-motion: reduce)').",
      "Section mode: skip tween, jump playhead to endFrame immediately.",
      "Scrub mode: set scrub to 0 (instant) instead of a smoothing value.",
      "Overlay animations: use opacity cuts, not position slides.",
      "reducedMotionFallback flag in StorySchema lets authors specify a static fallback scene.",
    ],
    code: {
      lang: "ts",
      text: `const prefersReduced =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (prefersReduced) {
  gsap.set(playhead, { frame: scene.endFrame });
} else {
  gsap.to(playhead, { frame: scene.endFrame, duration, ease });
}`,
    },
  },
  {
    id: "design-overview",
    section: "Design",
    item: "Overview",
    heading: "Design Overview",
    summary:
      "The design system uses deep zinc surfaces, glass panels, and restrained accent lighting to match the premium dark aesthetic of tools like Linear, Vercel, and Stripe.",
    bullets: [
      "Primitive tokens: zinc scale, cyan/purple accent palette, spacing scale.",
      "Semantic tokens: surface, border, text, and interactive state mappings.",
      "Component tokens: specific card, button, panel, and overlay treatments.",
      "Glass panels use backdrop-blur-xl with zinc-900/50 background.",
      "Accent gradients are radial, subtle, and never the sole source of meaning.",
    ],
  },
  {
    id: "design-animation-patterns",
    section: "Design",
    item: "Animation Patterns",
    heading: "Animation Patterns",
    summary:
      "Animations should be purposeful — entrance, exit, and transition curves communicate narrative structure, not decoration.",
    bullets: [
      "Entrance: power2.out easing, short duration (0.4–0.6s) for overlays.",
      "Exit: power2.in easing, slightly shorter than entrance.",
      "Scene transitions in section mode: 0.8–1.2s with power3.inOut.",
      "Stagger children with 0.05–0.1s delay to convey hierarchy.",
      "All timing values should live in TransitionConfig, not hard-coded in components.",
    ],
  },
  {
    id: "design-scene-composition",
    section: "Design",
    item: "Scene Composition",
    heading: "Scene Composition",
    summary:
      "Each scene should have a single visual anchor — hero treatment, product shot, or data reveal — with overlays that reinforce rather than compete.",
    bullets: [
      "Canvas image is the hero; overlays are secondary.",
      "Text overlays use large tracking-tight headings and zinc-50 color.",
      "Supporting text is zinc-300 at body size with relaxed line height.",
      "Accent badges use the purple or cyan palette at /10 fill and /20 border.",
      "Never stack more than two overlay elements in the primary viewport zone.",
    ],
  },
  {
    id: "integration-overview",
    section: "Integration",
    item: "Overview",
    heading: "Integration Overview",
    summary:
      "GSAP and Lenis are the two external motion dependencies; both are integrated in a mode-aware way to avoid conflicts and provide the smoothest possible experience.",
    bullets: [
      "GSAP provides Observer, ScrollTrigger, and the ticker — registered once at app root.",
      "Lenis provides smooth scroll inertia and anchors for non-section modes.",
      "Both are initialised server-side safely by checking typeof window.",
      "gsap.ticker.lagSmoothing(0) prevents frame drops causing scroll jank.",
      "No other animation libraries should be added without explicit mode-conflict review.",
    ],
  },
  {
    id: "integration-lenis",
    section: "Integration",
    item: "Lenis",
    heading: "Lenis Integration",
    summary:
      "section mode pauses Lenis because Observer already owns gesture control — running both simultaneously causes redundant smoothing loops and awkward touch interactions.",
    bullets: [
      "scrub mode: keep Lenis enabled; smooth scroll improves continuous playback.",
      "snap mode: prefer lenis/snap addon to avoid ScrollTrigger snap vs inertia conflicts.",
      "section mode: call lenis.stop() on stage mount, lenis.start() on unmount.",
      "Feed Lenis scroll events into ScrollTrigger.update for timeline sync.",
      "Use gsap.ticker.add((t) => lenis.raf(t * 1000)) instead of Lenis autoRaf.",
    ],
    code: {
      lang: "ts",
      text: `export function initLenis() {
  const lenis = new Lenis({ autoRaf: false, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}`,
    },
  },
  {
    id: "integration-gsap",
    section: "Integration",
    item: "GSAP",
    heading: "GSAP Integration",
    summary:
      "GSAP powers all three transition modes via different plugin configurations — Observer for section, ScrollTrigger with labels for snap, and ScrollTrigger scrub for continuous modes.",
    bullets: [
      "Register ScrollTrigger and Observer once: gsap.registerPlugin(ScrollTrigger, Observer).",
      "Use useGSAP hook from @gsap/react for cleanup-safe animations inside components.",
      "ScrollTrigger.refresh() must be called after layout changes or Lenis resize.",
      "In section mode, gsap.to(playhead) drives the canvas with configured ease and duration.",
      "Context-based cleanup prevents animation leaks when components unmount.",
    ],
    code: {
      lang: "ts",
      text: `import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";

// Register once at app root
gsap.registerPlugin(ScrollTrigger, Observer);`,
    },
  },
  {
    id: "development-overview",
    section: "Development",
    item: "Overview",
    heading: "Development Overview",
    summary:
      "The project uses openspec-driven sprints where architectural decisions and implementation tasks are explicitly tracked and validated before merge.",
    bullets: [
      "backlog.md tracks sprint items with phase labels and acceptance criteria.",
      "Each feature starts with an openspec proposal before implementation.",
      "Tests are written before implementation in TDD style.",
      "Static export constraint means no runtime filesystem reads or server actions.",
      "Agent orchestration uses model tiers: Opus for architecture, Sonnet for implementation, Haiku for lookups.",
    ],
  },
  {
    id: "development-sprint-workflow",
    section: "Development",
    item: "Sprint Workflow",
    heading: "Sprint Workflow",
    summary:
      "Sprints are phase-structured: canvas engine first, then scene composition, then smoothing polish, then validation — each phase has explicit acceptance criteria.",
    bullets: [
      "Phase 2 (canvas): ImageSequenceCanvas consumes playhead ref, not scroll progress.",
      "Phase 3 (scenes): SectionStage, SnapStage, ScrubStage behind a single stage switcher.",
      "Phase 4 (polish): Lenis pause/resume, pagination, keyboard, reduced-motion.",
      "Phase 5 (validation): default mode = section, override merging, superRefine tests.",
      "QA matrix covers trackpad, wheel, iPad, iPhone Safari, keyboard-only, and VoiceOver.",
    ],
  },
  {
    id: "development-agent-orchestration",
    section: "Development",
    item: "Agent Orchestration",
    heading: "Agent Orchestration",
    summary:
      "Main context stays as orchestrator only — heavy implementation is delegated to typed sub-agents to keep the planning thread clean and context-efficient.",
    bullets: [
      "Opus 4.x: architecture decisions and complex cross-cutting reasoning.",
      "Sonnet 4.x: standard component and hook implementation (200k context).",
      "GPT Codex 5.3: large file generation and bulk schema work (400k context).",
      "Haiku 4.x: quick lookups, file searches, and simple targeted edits.",
      "Each agent prompt must include project path, tech stack, file dependencies, and acceptance criteria.",
    ],
  },
];

export const defaultDocId = "architecture-overview";

const syntaxKeywords = new Set([
  "const",
  "export",
  "function",
  "if",
  "import",
  "interface",
  "return",
  "type",
  "else",
  "from",
  "true",
  "false",
]);

const syntaxTokenPattern = /(\"[^\"\\]*(?:\\.[^\"\\]*)*\"|'[^'\\]*(?:\\.[^'\\]*)*'|`[^`]*`|\b(?:const|export|function|if|import|interface|return|type|else|from|true|false)\b|\b\d+(?:\.\d+)?\b)/g;

export function getDoc(id: string): DocEntry {
  return docsTree.find((d) => d.id === id) ?? docsTree[0];
}

function getTokenClass(token: string) {
  if (syntaxKeywords.has(token)) {
    return "text-cyan-300";
  }

  if (token.startsWith("\"") || token.startsWith("'") || token.startsWith("`")) {
    return "text-emerald-300";
  }

  if (/^\d/.test(token)) {
    return "text-amber-300";
  }

  return "text-zinc-300";
}

interface CodeBlockProps {
  code: { lang: string; text: string };
}

function CodeBlock({ code }: CodeBlockProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-900/90 shadow-inner shadow-black/20">
      <div className="flex items-center justify-between border-b border-zinc-800/70 bg-zinc-950/80 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">Example</span>
        <span className="font-mono text-xs text-zinc-500">{code.lang}</span>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-relaxed text-zinc-300">
        <code>
          {code.text.split("\n").map((line, lineIndex) => (
            <Fragment key={`${code.lang}-${lineIndex}`}>
              {line.split(syntaxTokenPattern).map((part, partIndex) =>
                part.length === 0 ? null : (
                  <span key={`${code.lang}-${lineIndex}-${partIndex}`} className={getTokenClass(part)}>
                    {part}
                  </span>
                ),
              )}
              {lineIndex < code.text.split("\n").length - 1 ? "\n" : null}
            </Fragment>
          ))}
        </code>
      </pre>
    </div>
  );
}

interface DocViewProps {
  entry: DocEntry;
}

export function DocView({ entry }: DocViewProps) {
  return (
    <article className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
          {entry.section}
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
          {entry.heading}
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-400">{entry.summary}</p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {entry.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3 text-sm leading-6 text-zinc-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
            {bullet}
          </li>
        ))}
      </ul>

      {entry.code && <CodeBlock code={entry.code} />}
    </article>
  );
}
