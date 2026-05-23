# Sprint 5 Summary: Scrub Mode & Stage Switcher

## Metadata
- **Sprint**: 5
- **Goal**: Implement pure scrub mode and the unified `<Stage>` component
- **Status**: ✅ Complete
- **Date**: 2026-05-23
- **Agent Used**: Sonnet 4.6
- **Duration**: ~45s

## Tasks Completed
| # | Task | Status | Tests |
|---|------|--------|-------|
| 1 | Create ScrubStage component | ✅ Done | 5 unit |
| 2 | Wire playhead to progress × totalFrames | ✅ Done | (in ScrubStage tests) |
| 3 | Overlay positioning by progress | ✅ Done | (in ScrubStage tests) |
| 4 | Create Stage switcher component | ✅ Done | 7 unit |
| 5 | Route to correct stage by mode | ✅ Done | (in switcher tests) |
| 6 | Per-scene mode override | ✅ Done | (in switcher tests) |
| 7 | Test: free scrub no magnetic stops | ✅ Done | 4 integration |
| 8 | Test: switcher routes by config | ✅ Done | (in switcher tests) |

## Test Coverage
- **Unit tests added**: 12
- **Integration tests added**: 4
- **Total test count (cumulative)**: 124
- **Regression status**: ✅ All passing

## Files Created/Modified
- `src/components/ScrubStage.tsx` (created)
- `src/components/Stage.tsx` (created)
- `src/lib/stage/resolveTransitionMode.ts` (created)
- `src/lib/stage/index.ts` (created)
- `src/components/index.ts` (modified — new exports)
- `src/__tests__/unit/sprint-5/scrub-stage.test.tsx` (created)
- `src/__tests__/unit/sprint-5/stage-switcher.test.tsx` (created)
- `src/__tests__/integration/sprint-5/scrub-continuous.test.tsx` (created)
- `src/__tests__/regression.test.ts` (modified)

## Key Decisions
- **ScrubStage removes snap entirely** — pure continuous scroll, no magnetic stops
- **Stage is the public API** — consumers use `<Stage story={...} />`, not individual stages
- **resolveTransitionMode** — unanimous scene override wins; mixed overrides fall back to story-level (documented limitation)
- **Playhead formula**: `Math.round(progress * totalFrames)` for smooth continuous frame progression

## Architecture
```
<Stage story={...}>
├── resolveTransitionMode(story) → "section" | "snap" | "scrub"
├── mode="section" → <SectionStage>  (Observer-driven, Sprint 3)
├── mode="snap"    → <SnapStage>     (ScrollTrigger+snap, Sprint 4)
└── mode="scrub"   → <ScrubStage>    (ScrollTrigger, no snap, Sprint 5)
```

## Known Issues / Tech Debt
- Mixed per-scene overrides not fully supported (falls back to story-level)
- Pre-existing React `act()` warning from Sprint 2 test (non-blocking)

## Next Sprint Preview
- Sprint 6: Lenis Integration & Smoothing
- Dependencies resolved: All three modes now exist, Lenis can integrate with each
