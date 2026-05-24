# Gemini Code Assist — EasyDeck Instructions

> For the full presentation creation workflow, see `AGENTS.md` at the repository root.

## Project Context

**EasyDeck** is a ScrollyTelling Presentation Framework built with:
- Next.js 15 (App Router)
- TypeScript (strict mode)
- GSAP (Observer, ScrollTrigger)
- Lenis (smooth scrolling)
- Zod (schema validation)
- Canvas-based image sequence rendering

## How to Create a Presentation

1. Write a **ContentBrief** (see schema below)
2. Call `createPresentation(brief)` from `@/lib/pipeline`
3. Render with `<Stage story={story} />`
4. Preview with `npm run dev`

### ContentBrief Format

```typescript
{
  title: string,        // Presentation title
  slug: string,         // URL-safe identifier
  scenes: [             // At least 1 scene
    {
      label: string,        // Scene name (required)
      description?: string, // Purpose description
      durationHint?: number,// Duration in seconds (default: 5)
      overlayText?: string, // Text overlay content
    }
  ],
  mode?: "section" | "snap" | "scrub",  // Default: "section"
  fps?: number,         // 1-120, default: 30
  imagePattern?: string // Default: "/frames/frame-{index}.webp"
}
```

### Example

```typescript
import { createPresentation } from '@/lib/pipeline';
import { Stage } from '@/components/Stage';

const { story } = createPresentation({
  title: "Product Launch",
  slug: "product-launch",
  mode: "section",
  scenes: [
    { label: "Hero", durationHint: 6, overlayText: "Welcome" },
    { label: "Features", durationHint: 8, overlayText: "What we built" },
    { label: "CTA", durationHint: 4, overlayText: "Try it now" },
  ],
});

// Render: <Stage story={story} />
```

## Transition Modes

| Mode | Behavior | Best For |
|------|----------|----------|
| `section` | One gesture = one scene (no scrollbar) | Keynotes, guided narratives |
| `snap` | Scroll with magnetic snapping | Explorable content |
| `scrub` | Direct scroll-to-frame mapping | Parallax, data stories |

## AI Enhancement (Optional)

```bash
export EASYDECK_AI_PROVIDER=gemini
export GOOGLE_AI_KEY=your-key-here
```

```typescript
import { createEnhancedPresentation } from '@/lib/pipeline';
import { loadConfigFromEnv } from '@/lib/ai';

const result = await createEnhancedPresentation(brief, loadConfigFromEnv());
```

## Project Structure

- `src/components/Stage.tsx` — Main rendering component
- `src/lib/pipeline/` — ContentBrief → StorySchema pipeline
- `src/lib/schemas/` — Zod validation schemas
- `src/lib/ai/` — Multi-provider LLM abstraction
- `src/lib/a11y/` — Accessibility utilities
- `docs/` — Full documentation

## Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Production build
npm test             # Run all tests
npm run type-check   # TypeScript validation
```

## Key Rules

- Never bypass Zod validation
- Section mode requires frame-contiguous scenes
- Playhead is a ref (mutate `.frame`, don't replace)
- Support `prefers-reduced-motion`
- TypeScript strict — no `any` types

## More Info

See `AGENTS.md` for the complete workflow guide with full examples and project structure map.
