# EasyDeck

![Build](https://github.com/Hundia/EasyDeck/actions/workflows/deploy.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Tests](https://img.shields.io/badge/tests-235%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
[![Live Docs](https://img.shields.io/badge/docs-live-brightgreen)](https://hundia.github.io/EasyDeck/)

**A scrollytelling presentation engine built with React, GSAP, Lenis & canvas-based image sequences.**

> Three transition modes. One `<Stage>` component. Buttery smooth.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎬 **Three Transition Modes** | Section (fullpage.js-like), Snap (magnetic stops), Scrub (continuous) |
| 🖼️ **Image Sequence Canvas** | Playhead-agnostic, GSAP ticker-driven, DPR-aware |
| 🧈 **Lenis Smooth Scroll** | Per-mode integration — pauses in section, active in snap/scrub |
| ♿ **WCAG 2.1 AA** | Reduced motion, semantic layer, skip links, keyboard nav |
| 🔗 **Deep Linking** | URL hash persistence (`#scene-N`) with replaceState |
| 🤖 **Content Pipeline** | `createPresentation(brief)` → validated StorySchema |
| 📐 **Zod Schemas** | Full runtime validation with frame continuity checks |
| 🎯 **TypeScript Strict** | Every export typed, zero `any` |

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  <Stage story={...} />                       │
│                                              │
│  ┌─────────────┐ ┌──────────┐ ┌───────────┐ │
│  │ SectionStage│ │ SnapStage│ │ ScrubStage│ │
│  │  (Observer) │ │(ST+Snap) │ │ (ST only) │ │
│  └──────┬──────┘ └────┬─────┘ └─────┬─────┘ │
│         └──────────────┼─────────────┘       │
│                        ▼                     │
│         ┌──────────────────────────┐         │
│         │  ImageSequenceCanvas     │         │
│         │  (GSAP ticker draw loop) │         │
│         └──────────────────────────┘         │
│                        ▲                     │
│                   playhead.current.frame      │
└─────────────────────────────────────────────┘

┌──────────────────────────────────────┐
│  Lenis (app-level)                    │
│  • Section mode → PAUSED              │
│  • Snap/Scrub → ACTIVE + ST sync     │
└──────────────────────────────────────┘
```

---

## Quick Start

```bash
git clone https://github.com/Hundia/EasyDeck
cd EasyDeck
npm install
npm run dev
```

Open http://localhost:3000

---

## Usage

### Minimal Example

```tsx
import { Stage } from "@/components";
import { StorySchema } from "@/lib/schemas";

const story = StorySchema.parse({
  meta: { title: "My Presentation", slug: "demo" },
  transition: { mode: "section" },
  scenes: [
    { id: "intro", label: "Intro", startFrame: 0, endFrame: 150,
      imageSequence: { pattern: "/frames/intro-{index}.webp", frameCount: 150 } },
    { id: "chapter-1", label: "Chapter 1", startFrame: 150, endFrame: 300,
      imageSequence: { pattern: "/frames/ch1-{index}.webp", frameCount: 150 } },
  ],
});

export default function Page() {
  return <Stage story={story} />;
}
```

### Content Pipeline (no manual JSON)

```tsx
import { createPresentation } from "@/lib/pipeline";

const { story } = createPresentation({
  title: "Product Launch",
  slug: "launch-2026",
  scenes: [
    { label: "Hero", durationHint: 3, overlayText: "Welcome to the future" },
    { label: "Features", durationHint: 5, overlayText: "Built for speed" },
    { label: "Pricing", durationHint: 4 },
  ],
  mode: "snap",
});

// story is a fully validated StorySchema — pass directly to <Stage>
```

---

## Transition Modes

| Mode | Behavior | Use Case |
|------|----------|----------|
| `section` | One gesture = one scene (Observer-driven) | Narrative storytelling, controlled pacing |
| `snap` | Free scroll with magnetic stops at boundaries | Product showcases, guided browsing |
| `scrub` | Continuous scroll-driven playback | Video-like experiences, data visualization |

```tsx
// Global mode
{ transition: { mode: "snap" } }

// Per-scene override (unanimous)
scenes: [
  { ..., transition: { mode: "scrub" } },
  { ..., transition: { mode: "scrub" } },
]
```

---

## Accessibility

| WCAG Criterion | Implementation |
|----------------|----------------|
| 1.3.1 Info & Relationships | `<SemanticLayer>` with aria-live |
| 2.1.1 Keyboard | Arrow keys, Home/End, Tab navigation |
| 2.4.1 Bypass Blocks | `<SkipToContent>` link |
| 2.5.1 Pointer Gestures | Adaptive tolerance (20px touch / 10px mouse) |
| prefers-reduced-motion | Detected + honored (static fallback) |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── Stage.tsx           # ← Public API (use this)
│   ├── SectionStage.tsx    # Observer-driven transitions
│   ├── SnapStage.tsx       # ScrollTrigger + snap
│   ├── ScrubStage.tsx      # Pure continuous scroll
│   ├── ImageSequenceCanvas.tsx  # GSAP ticker canvas
│   ├── Pagination.tsx      # Accessible nav dots
│   ├── ProgressBar.tsx     # Vertical scroll progress
│   ├── SemanticLayer.tsx   # Screen reader content
│   └── SkipToContent.tsx   # Skip link
├── lib/
│   ├── schemas/            # Zod schemas (transition, scene, story, overlay)
│   ├── hooks/              # usePlayhead
│   ├── canvas/             # Preloader, sizing, clamp
│   ├── section/            # computeNextIndex (wrap/clamp)
│   ├── snap/               # buildSnapConfig
│   ├── stage/              # resolveTransitionMode
│   ├── lenis/              # initLenis, LenisProvider, useLenisPause, sync
│   ├── a11y/               # useReducedMotion, useTouchTolerance, useHash, normalize
│   └── pipeline/           # NarrativeDesigner, SceneComposer, createPresentation
└── __tests__/
    ├── unit/sprint-{1..8}/ # Per-sprint unit tests
    ├── integration/        # Cross-component integration tests
    └── regression.test.ts  # Cumulative regression runner
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Animation | GSAP (ScrollTrigger, Observer, useGSAP) |
| Smooth Scroll | Lenis |
| Canvas | HTML5 Canvas + GSAP ticker |
| Validation | Zod |
| Styling | Tailwind CSS |
| Testing | Vitest + Testing Library |
| Language | TypeScript (strict) |

---

## Testing

```bash
# Run all 235 tests
npm test

# Type check
npm run type-check

# Build
npm run build
```

Tests are organized by sprint and accumulate into a regression suite that runs after every change.

---

## Development Methodology

Built with **OpenSpec** — spec-driven development across 8 sprints:

| Sprint | Deliverable | Tests |
|--------|-------------|-------|
| 1 | Project Bootstrap & Zod Schemas | 33 |
| 2 | Canvas Engine & Playhead | 63 |
| 3 | Section Mode (Observer) | 86 |
| 4 | Snap Mode (ScrollTrigger) | 108 |
| 5 | Scrub Mode & Stage Switcher | 124 |
| 6 | Lenis Integration | 141 |
| 7 | Accessibility & UX | 170 |
| 8 | Agent Pipeline | 235 |

Each sprint has a detailed summary in [`sprints/`](./sprints/).

---

## One-Click Deploy

| Platform | Deploy |
|----------|--------|
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Hundia/EasyDeck) |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Hundia/EasyDeck) |
| **Codespaces** | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Hundia/EasyDeck) |

---

## Contributing

PRs welcome. See [`CLAUDE.md`](./CLAUDE.md) for development conventions, [`backlog.md`](./backlog.md) for the sprint plan, and [`spec/`](./spec/) for OpenSpec specifications.

---

## License

MIT — use it for any presentation, product, or demo.

---

*Built with [OpenSpec](https://github.com/Hundia/autospec) methodology — spec-driven development with AI agent orchestration.*
