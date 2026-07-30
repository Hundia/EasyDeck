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

## Presentation Modes & Architectures

| Mode/Type | Behavior | Best For | Location |
|------|----------|----------|----------|
| `section` | One gesture = one scene (no scrollbar) | Keynotes, guided narratives | `<Stage story={story} />` |
| `snap` | Scroll with magnetic snapping | Explorable content | `<Stage story={story} />` |
| `scrub` | Direct scroll-to-frame mapping | Parallax, data stories | `<Stage story={story} />` |
| `x_pres` / Custom | Cinematic bilingual scrollytelling with video/image toggle, edit toolbar, HUD | Full interactive briefings | `src/app/presentations/<slug>/page.tsx` |

## Creating New Presentations (e.g. `hativa`)

When building a new presentation under `public/presentations/<name>`:
1. Inspect images in `public/presentations/<name>/frames/` and videos in `public/presentations/<name>/videos/`.
2. Define scene metadata in `src/app/presentations/<name>/page.tsx` with bilingual (EN/HE) titles and descriptions.
3. Configure smart panel positions (`bottom-left`, `bottom-right`, `bottom-center`, etc.) so text overlays do not cover primary visual focal points.
4. Include top-right controls for language (`EN`, `HE`, `Both`), scroll mode (`GSAP`, `Continuous`, `Autoplay`), and media mode (`Image`, `Video`).
5. Run validation:
```bash
npm run type-check   # Must pass without TypeScript errors
npm test             # Verify existing pipeline tests
```

## Key Rules

- Never bypass Zod validation when using `createPresentation` / `createEnhancedPresentation`
- Section mode requires frame-contiguous scenes
- Playhead is a ref (mutate `.frame`, don't replace)
- Support `prefers-reduced-motion`
- TypeScript strict — no `any` types
- Hebrew support must use proper RTL styling and military/technical terminology

## Production Environment & Deployment (`hundia.casa`)

- **Public URL Pattern**: `https://hundia.casa/presentations/<slug>`
- **Local Proxy Port**: `http://127.0.0.1:3848`
- **Systemd Service**: `easydeck-pres.service`
- **Nginx Config**: `/etc/nginx/sites-enabled/hundia.casa`
  - Routes `location ^~ /presentations/` directly to Next.js on port `3848`.
- **Deploying Updates**:
  1. `npm run type-check`
  2. `npm run build`
  3. `systemctl restart easydeck-pres`
  4. Verify: `curl -I https://hundia.casa/presentations/<slug>`

## More Info

See `AGENTS.md` and `.agents/skills/easydeck-presentation/SKILL.md` for complete reference.


