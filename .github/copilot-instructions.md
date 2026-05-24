# GitHub Copilot Instructions — EasyDeck

> For the full presentation creation workflow, see [AGENTS.md](../AGENTS.md) at the repository root.

## Overview

EasyDeck is a ScrollyTelling Presentation Framework (React/Next.js + GSAP + Lenis). You create presentations by writing a `ContentBrief` and passing it through `createPresentation()`.

## Quick Reference

### Create a presentation
```typescript
import { createPresentation } from '@/lib/pipeline';

const { story } = createPresentation({
  title: "My Deck",
  slug: "my-deck",
  scenes: [
    { label: "Intro", overlayText: "Hello world" },
    { label: "Main", durationHint: 8, overlayText: "Key content" },
    { label: "End", overlayText: "Thanks!" },
  ],
  mode: "section",  // or "snap" or "scrub"
});
```

### Render it
```tsx
import { Stage } from '@/components/Stage';
<Stage story={story} />
```

### Preview
```bash
npm run dev
```

## Architecture at a Glance

```
ContentBrief → createPresentation() → StorySchema → <Stage story={story} />
                                                         ↓
                                            SectionStage | SnapStage | ScrubStage
                                                         ↓
                                              ImageSequenceCanvas (playhead-driven)
```

## Key Files

| Purpose | Path |
|---------|------|
| Pipeline entry | `src/lib/pipeline/pipeline.ts` |
| ContentBrief schema | `src/lib/pipeline/schemas.ts` |
| Stage component | `src/components/Stage.tsx` |
| Story schema | `src/lib/schemas/story.ts` |
| AI providers | `src/lib/ai/` |
| Transition modes | `src/lib/schemas/transition.ts` |

## Mode Selection

- **`section`** — One gesture = one scene (presentations, keynotes)
- **`snap`** — Scroll with magnetic snapping (explorable content)
- **`scrub`** — 1:1 scroll-to-frame (parallax, long reveals)

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm test             # 310+ tests
npm run type-check   # TypeScript strict
```

## Constraints

- TypeScript strict — no `any`
- Always validate through Zod (`StorySchema.parse()`)
- Frame continuity required in section mode
- Accessibility: `prefers-reduced-motion` support mandatory

## Full Documentation

See `AGENTS.md` in the repo root for complete guide including:
- Step-by-step workflow
- Full ContentBrief schema reference
- All mode examples
- AI enhancement setup
- Project structure map
