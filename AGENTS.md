# AGENTS.md — EasyDeck Universal Agent Guide

> This file provides context to any AI coding assistant (Claude Code, GitHub Copilot, Gemini Code Assist, Cursor, Windsurf, etc.) working with this repository.

## What is EasyDeck?

**EasyDeck** is a ScrollyTelling Presentation Framework. It turns a simple content brief into a full-viewport, scroll-driven presentation with canvas-based image sequences, GSAP-powered transitions, and three playback modes.

**One component does everything:**
```tsx
<Stage story={story} />
```

---

## Creating a Presentation (Step-by-Step)

### Step 1: Write a ContentBrief

The ContentBrief is your input. Create a JSON/TS object:

```typescript
const brief = {
  title: "My Presentation",          // Required: presentation title
  slug: "my-presentation",           // Required: URL-safe identifier
  scenes: [                          // Required: at least 1 scene
    {
      label: "Introduction",         // Required: scene name
      description: "Welcome slide",  // Optional: scene purpose
      durationHint: 5,               // Optional: seconds (default: 5)
      overlayText: "Welcome to...",  // Optional: text overlay content
    },
    {
      label: "Key Features",
      durationHint: 8,
      overlayText: "Here's what makes us different",
    },
    {
      label: "Call to Action",
      durationHint: 4,
      overlayText: "Get started today",
    },
  ],
  mode: "section",                   // Optional: "section" | "snap" | "scrub"
  fps: 30,                           // Optional: frames per second (default: 30)
  imagePattern: "/frames/frame-{index}.webp",  // Optional: image path pattern
};
```

### Step 2: Run the Pipeline

```typescript
import { createPresentation } from '@/lib/pipeline';

const { story, log } = createPresentation(brief);
// story is a validated StorySchema ready to render
// log.adjustments shows any frame corrections made
```

For AI-enhanced content (richer descriptions, transition rationale):
```typescript
import { createEnhancedPresentation } from '@/lib/pipeline';
import { loadConfigFromEnv } from '@/lib/ai';

const { story, log, aiEnhancements } = await createEnhancedPresentation(brief, loadConfigFromEnv());
```

### Step 3: Render

```tsx
import { Stage } from '@/components/Stage';

export default function PresentationPage() {
  return <Stage story={story} />;
}
```

### Step 4: Preview

```bash
npm run dev    # Open http://localhost:3000
```

---

## Mode Selection Guide

| Mode | Use When | Behavior |
|------|----------|----------|
| `section` (default) | Guided presentations, keynotes, product launches | One gesture = one scene. Like fullpage.js. No scrollbar. |
| `snap` | Explorable content with natural settling | Continuous scroll with magnetic snap to scenes. Scrollbar visible. |
| `scrub` | Long visual reveals, parallax, data stories | Direct 1:1 scroll-to-frame mapping. Fully continuous. |

**Rule of thumb:** If your audience should follow a fixed narrative → `section`. If they should explore freely → `snap` or `scrub`.

---

## ContentBrief Schema Reference

```typescript
// Required fields
title: string         // Min 1 char
slug: string          // Min 1 char, URL-safe
scenes: SceneBrief[]  // Min 1 scene

// Optional fields
mode: "section" | "snap" | "scrub"  // Default: "section"
fps: number           // 1-120, default: 30
imagePattern: string  // Default: "/frames/frame-{index}.webp"

// SceneBrief
{
  label: string           // Required: scene name
  description: string     // Default: ""
  durationHint: number    // Positive number, default: 5 (seconds)
  overlayText?: string    // Optional text overlay
}
```

---

## Common Tasks

### Add a scene
Add an entry to the `scenes` array. The pipeline handles frame calculation automatically.

### Change transition mode
Set `mode` in the ContentBrief: `"section"`, `"snap"`, or `"scrub"`.

### Customize overlay timing
Overlays are auto-generated at `enterAt: 0.2, exitAt: 0.8` (normalized within scene). To customize, modify the NarrativeDesigner output or post-process.

### Adjust timing
Change `durationHint` per scene (in seconds). Frames = `durationHint × fps`.

### Prepare image sequences
1. Export frames as `.webp`: `frame-0000.webp`, `frame-0001.webp`, etc.
2. Place in `public/frames/`
3. Set `imagePattern: "/frames/frame-{index}.webp"`

### Enable AI enhancement
```bash
export EASYDECK_AI_PROVIDER=claude   # or copilot, gemini
export ANTHROPIC_API_KEY=sk-ant-...  # or OPENAI_API_KEY, GOOGLE_AI_KEY
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   └── viewer/            # Framework viewer/docs app
├── components/
│   ├── Stage.tsx          # Entry point — routes to correct mode
│   ├── SectionStage.tsx   # Observer-driven (one gesture = one scene)
│   ├── SnapStage.tsx      # ScrollTrigger + snap
│   ├── ScrubStage.tsx     # ScrollTrigger continuous scrub
│   └── ImageSequenceCanvas.tsx  # Playhead-driven canvas renderer
├── lib/
│   ├── ai/                # Multi-provider LLM abstraction
│   │   ├── providers/     # Copilot, Claude, Gemini adapters
│   │   ├── enhancer.ts    # AI narrative enhancement
│   │   └── config.ts      # Provider configuration
│   ├── pipeline/          # Content → Presentation pipeline
│   │   ├── pipeline.ts    # createPresentation / createEnhancedPresentation
│   │   ├── narrativeDesigner.ts  # Brief → narrative structure
│   │   ├── sceneComposer.ts     # Narrative → validated story
│   │   └── schemas.ts    # ContentBrief, SceneBrief Zod schemas
│   ├── schemas/           # Core Zod schemas
│   │   ├── story.ts      # StorySchema (top-level)
│   │   ├── scene.ts      # SceneConfig
│   │   ├── transition.ts # TransitionConfig, modes, easing
│   │   └── overlay.ts    # OverlayConfig
│   ├── stage/             # Stage utilities
│   ├── lenis/             # Lenis smooth scroll integration
│   └── a11y/              # Accessibility utilities
└── __tests__/             # Vitest tests organized by sprint
```

---

## Commands

```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Production build
npm run type-check       # TypeScript strict
npm test                 # All tests (310+ passing)
npm run test:watch       # Interactive watch mode
npm run test:e2e         # Playwright E2E (needs dev server)
```

---

## Key Constraints

1. **Always validate with Zod** — never bypass `StorySchema.parse()`
2. **Frame continuity** — in section mode, scene boundaries must be contiguous
3. **Playhead is a ref** — mutate `playhead.current.frame`, never replace the object
4. **Accessibility first** — `prefers-reduced-motion` collapses animation duration
5. **TypeScript strict** — no `any` types, all exports typed

---

## Examples

### Minimal Presentation

```typescript
import { createPresentation } from '@/lib/pipeline';

const { story } = createPresentation({
  title: "Quick Demo",
  slug: "quick-demo",
  scenes: [
    { label: "Hello", overlayText: "Welcome!" },
    { label: "World", overlayText: "Let's go." },
  ],
});
// → <Stage story={story} />
```

### Full Presentation

```typescript
const { story } = createPresentation({
  title: "Product Launch 2025",
  slug: "product-launch-2025",
  mode: "section",
  fps: 30,
  imagePattern: "/frames/launch/frame-{index}.webp",
  scenes: [
    { label: "Hero", durationHint: 6, overlayText: "Introducing EasyDeck" },
    { label: "Problem", durationHint: 8, overlayText: "Presentations are broken" },
    { label: "Solution", durationHint: 10, overlayText: "Scroll-driven storytelling" },
    { label: "Features", durationHint: 8, overlayText: "Three modes. One component." },
    { label: "Demo", durationHint: 12, description: "Live demo section" },
    { label: "Pricing", durationHint: 5, overlayText: "Free and open source" },
    { label: "CTA", durationHint: 4, overlayText: "Get started now" },
  ],
});
```

### Snap Mode (Explorable)

```typescript
const { story } = createPresentation({
  title: "Feature Explorer",
  slug: "feature-explorer",
  mode: "snap",
  scenes: [
    { label: "Overview", durationHint: 6 },
    { label: "Feature A", durationHint: 8 },
    { label: "Feature B", durationHint: 8 },
    { label: "Feature C", durationHint: 8 },
  ],
});
```

### Scrub Mode (Continuous)

```typescript
const { story } = createPresentation({
  title: "Data Story",
  slug: "data-story",
  mode: "scrub",
  scenes: [
    { label: "Chapter 1", durationHint: 15 },
    { label: "Chapter 2", durationHint: 20 },
    { label: "Chapter 3", durationHint: 10 },
  ],
});
```

---

## Documentation

- Full docs: `docs/` directory
- Live viewer: https://hundia.casa/viewer
- API reference: `docs/API.md`
- Getting started: `docs/GETTING_STARTED.md`

---

## Development (Agent Orchestration)

When developing EasyDeck itself (not creating presentations):

| Task Type | Recommended Model |
|-----------|------------------|
| Schema work (Zod) | Sonnet 4.6 |
| Component implementation | Sonnet 4.6 |
| Large bulk generation | GPT Codex 5.3 (400k context) |
| Architecture decisions | Opus 4.6 (use sparingly) |
| Quick lookups | Haiku 4.5 |

Sprint workflow uses OpenSpec methodology. See `backlog.md` for sprint tracker, `spec/` for specifications.
