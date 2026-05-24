# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Creating presentations?** See [AGENTS.md](./AGENTS.md) for the full step-by-step workflow, ContentBrief format, and examples.

## Project

**EasyDeck** — a scrollytelling presentation engine. One `<Stage story={...} />` component drives canvas-based image-sequence playback across three transition modes.

## Commands

```bash
npm run dev              # Next.js dev server (localhost:3000)
npm run build            # Production build
npm run type-check       # TypeScript strict check (no emit)

npm test                 # Vitest unit + integration (all)
npm run test:watch       # Vitest interactive watch
npm run test:integration # Integration tests only
npm run test:e2e         # Playwright (requires dev server running)
npm run test:e2e:ui      # Playwright with UI

# Run a single test file
npx vitest run src/__tests__/unit/sprint-2/canvas-engine.test.ts
```

E2E tests need `npm run dev` running first unless `CI=true` (Playwright auto-starts dev server in non-CI).

## Architecture

### Data flow

```
ContentBrief (raw input)
  → createPresentation()            src/lib/pipeline/pipeline.ts
      → NarrativeDesigner           src/lib/pipeline/narrativeDesigner.ts
      → SceneComposer               src/lib/pipeline/sceneComposer.ts
      → StorySchema (Zod-validated) src/lib/schemas/story.ts
  → <Stage story={story} />        src/components/Stage.tsx
      → resolveTransitionMode()    src/lib/stage/resolveTransitionMode.ts
      → <SectionStage>  |  <SnapStage>  |  <ScrubStage>
            ↓                    ↓               ↓
      <ImageSequenceCanvas playhead={...} />   src/components/ImageSequenceCanvas.tsx
```

### ImageSequenceCanvas

Entirely playhead-driven — it knows nothing about scroll or scenes. It runs a **GSAP ticker draw loop** that reads `playhead.current.frame` on every tick and skips redundant draws. Stages tween `playhead.current.frame` to control what gets rendered.

`usePlayhead()` returns a `MutableRefObject<{ frame: number }>`. Using a ref (not state) keeps frame updates outside React's render cycle.

### Transition modes

| Mode | Mechanism | Lenis |
|------|-----------|-------|
| `section` (default) | GSAP Observer — one gesture = one scene, fullpage.js-style | **Paused** via `useLenisPause()` |
| `snap` | GSAP ScrollTrigger + `snap: "labelsDirectional"` | Active + ScrollTrigger sync |
| `scrub` | GSAP ScrollTrigger scrub, continuous | Active + ScrollTrigger sync |

`Stage` reads `story.transition.mode`, falls back to `section`.

### Schemas (Zod)

- `StorySchema` — top-level; includes a `superRefine` that enforces **frame continuity** in section mode: `scenes[i].endFrame === scenes[i+1].startFrame`.
- `SceneConfig` — per-scene; `endFrame > startFrame` enforced.
- `TransitionConfig`, `OverlayConfig` — supporting schemas.
- Fixture for tests: `src/lib/schemas/__fixtures__/sample-story.ts`

### Lenis

`LenisProvider` wraps the app (in `layout.tsx`). Access via `useLenis()` hook. `useLenisPause()` calls `stop()`/`start()` on mount/unmount — call it inside any stage that requires controlled paging (i.e., `SectionStage`).

### Accessibility

All a11y utilities live under `src/lib/a11y/`:
- `useReducedMotion` — gates animation duration (collapses to `0.01s`)
- `useHashNavigation` — URL hash persistence per scene (`#scene-N`)
- `useTouchTolerance` — adaptive swipe threshold
- `useNormalizeScroll` — cross-device scroll delta normalization
- `SemanticLayer` — visually hidden ARIA live region with scene text
- `SkipToContent` — skip link targeting `#main-stage`

## Key invariants

1. **Always parse with Zod** before passing data to `<Stage>`. Never bypass `StorySchema.parse()`.
2. **Frame continuity**: in section mode, adjacent scenes must share their boundary frame. Enforced by `StorySchema.superRefine`; also tested in `src/__tests__/unit/sprint-1/schema-validation.test.ts`.
3. **Lenis pause**: `SectionStage` calls `useLenisPause()`. Any new controlled-paging stage must do the same.
4. **Playhead is a ref, not state**: never replace `playhead.current` with a new object — mutate `.frame` in place.
5. **Reduced motion**: `SectionStage.getEffectiveDuration()` collapses duration to `0.01` when `prefers-reduced-motion: reduce` is set. New animation code must follow this pattern.

## Development workflow

Uses **OpenSpec** (spec-driven development):
- Specs live in `spec/specs/` (living specs) and `spec/changes/` (sprint proposals).
- Use `openspec-proposal-creation` skill before new features, `openspec-implementation` to execute tasks.
- `backlog.md` is the canonical sprint tracker.

## Agent delegation

- **Opus 4.7**: Architecture decisions, complex reasoning
- **Sonnet 4.6**: Implementation tasks (default)
- **Haiku 4.5**: Quick lookups, simple edits
