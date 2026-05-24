# Creating Presentations with EasyDeck

This guide walks through creating scroll-driven presentations using EasyDeck's pipeline.

## Prerequisites

```bash
npm install
npm run dev    # Start dev server at localhost:3000
```

## The ContentBrief

Every presentation starts with a ContentBrief — a simple description of what you want.

### Minimal Example

```typescript
import { createPresentation } from '@/lib/pipeline';

const { story } = createPresentation({
  title: "Hello World",
  slug: "hello-world",
  scenes: [
    { label: "Welcome" },
    { label: "Goodbye" },
  ],
});
```

This creates a 2-scene section-mode presentation with default timing (5s per scene at 30fps = 150 frames each).

### Standard Example

```typescript
const { story } = createPresentation({
  title: "Quarterly Review",
  slug: "q4-review",
  mode: "section",
  fps: 30,
  scenes: [
    { label: "Opening", durationHint: 4, overlayText: "Q4 2025 in Review" },
    { label: "Metrics", durationHint: 8, overlayText: "Revenue up 23% YoY" },
    { label: "Highlights", durationHint: 10, overlayText: "Key achievements" },
    { label: "Challenges", durationHint: 6, overlayText: "What we learned" },
    { label: "Next Quarter", durationHint: 5, overlayText: "Q1 2026 Goals" },
  ],
});
```

### Advanced Example (with AI Enhancement)

```typescript
import { createEnhancedPresentation } from '@/lib/pipeline';
import { loadConfigFromEnv } from '@/lib/ai';

// Set env: EASYDECK_AI_PROVIDER=claude, ANTHROPIC_API_KEY=...
const config = loadConfigFromEnv();

const { story, aiEnhancements } = await createEnhancedPresentation({
  title: "Product Launch",
  slug: "product-launch-2025",
  mode: "section",
  fps: 30,
  imagePattern: "/frames/launch/frame-{index}.webp",
  scenes: [
    { label: "Hero", durationHint: 6, overlayText: "The future of presentations" },
    { label: "Problem", durationHint: 8, overlayText: "Static slides don't engage" },
    { label: "Solution", durationHint: 10, overlayText: "Scroll-driven storytelling" },
    { label: "Demo", durationHint: 12, description: "Live product demonstration" },
    { label: "Pricing", durationHint: 5, overlayText: "Free and open source" },
    { label: "CTA", durationHint: 4, overlayText: "Start building today" },
  ],
}, config);

console.log(aiEnhancements);
// → ["enriched scene descriptions", "generated transition rationale"]
```

## Choosing a Mode

### Section Mode (Default)

Best for: **Keynotes, product launches, guided narratives**

```typescript
mode: "section"
```

- One gesture (scroll/swipe/arrow key) = one scene transition
- No visible scrollbar
- Lenis smooth scrolling is paused (not needed)
- Frame continuity enforced between scenes

### Snap Mode

Best for: **Explorable content, portfolios, feature tours**

```typescript
mode: "snap"
```

- Continuous scroll with magnetic snapping to scene boundaries
- Scrollbar visible
- Lenis active for smooth feel
- User can scrub between scenes but always settles on one

### Scrub Mode

Best for: **Data visualizations, long parallax reveals, cinematic sequences**

```typescript
mode: "scrub"
```

- Direct 1:1 mapping: scroll position → frame progress
- Fully continuous (no snapping)
- Ideal for reduced-motion fallback
- Best with longer scenes and more frames

## Image Sequences

### Preparing Frames

1. Export your animation/video as individual frames:
   ```
   frame-0000.webp
   frame-0001.webp
   frame-0002.webp
   ...
   ```

2. Place them in `public/frames/` (or a subdirectory):
   ```
   public/frames/my-deck/frame-0000.webp
   ```

3. Set the pattern in your ContentBrief:
   ```typescript
   imagePattern: "/frames/my-deck/frame-{index}.webp"
   ```

### Frame Count

Total frames = sum of all `durationHint × fps` across scenes.

Example: 5 scenes × 6s average × 30fps = 900 frames.

### Recommended Formats

- **WebP**: Best compression/quality ratio (recommended)
- **AVIF**: Even smaller but slower decode
- **PNG**: Lossless but large
- **JPEG**: Legacy fallback

### Without Image Sequences

If you don't have images yet, the framework still works — it renders the canvas with solid frames and overlays. Image sequences are optional.

## Overlays

Overlays are text layers displayed on top of the canvas during a scene.

```typescript
scenes: [
  {
    label: "Welcome",
    overlayText: "This text appears during the scene",
  },
]
```

Overlay timing is automatic:
- **Enter**: 20% into the scene
- **Exit**: 80% into the scene
- **Position**: Centered

## Rendering the Presentation

```tsx
// src/app/my-deck/page.tsx
'use client';

import { createPresentation } from '@/lib/pipeline';
import { Stage } from '@/components/Stage';

const brief = { /* your ContentBrief */ };
const { story } = createPresentation(brief);

export default function MyDeckPage() {
  return <Stage story={story} />;
}
```

The `<Stage>` component handles everything:
- Chooses the correct mode component (Section/Snap/Scrub)
- Sets up the canvas and playhead
- Manages accessibility (keyboard nav, reduced motion, semantic layer)
- Handles pagination indicators

## AI Enhancement

EasyDeck supports optional AI enhancement via three providers:

| Provider | Env Variable | Default Model |
|----------|-------------|---------------|
| GitHub Copilot / OpenAI | `OPENAI_API_KEY` | gpt-4o |
| Claude (Anthropic) | `ANTHROPIC_API_KEY` | claude-sonnet-4-20250514 |
| Gemini (Google) | `GOOGLE_AI_KEY` | gemini-2.0-flash |

### Setup

```bash
export EASYDECK_AI_PROVIDER=claude
export ANTHROPIC_API_KEY=sk-ant-api03-...
```

### What AI Enhances

- **Scene descriptions**: More engaging overlay text
- **Transition rationale**: Explains why the mode fits each scene
- **Timing suggestions**: Advisory adjustments (within 20% of original)

### Graceful Fallback

If no provider is configured or if the API is unreachable, the pipeline silently falls back to deterministic mode. Your presentation always works.

## Deployment

### Static Export (GitHub Pages, Netlify, etc.)

```bash
NEXT_OUTPUT=export npm run build
# Output in ./out/ directory
```

### Vercel

```bash
npm run build
# Deploy normally — Vercel handles the rest
```

## Troubleshooting

### "Section-mode scenes must be frame-contiguous"

In section mode, each scene must start exactly where the previous one ends. This is enforced by Zod validation. Fix: ensure `durationHint` values create continuous frame ranges (the pipeline does this automatically from ContentBrief).

### "endFrame must be greater than startFrame"

A scene has zero or negative duration. Fix: ensure `durationHint > 0`.

### Canvas is blank

Image sequence files not found. Check:
1. Files exist at the path specified by `imagePattern`
2. Path is relative to `public/`
3. Frame indices match (zero-padded)
