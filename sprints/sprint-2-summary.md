# Sprint 2 Summary: Canvas Engine & Playhead

## Metadata
- **Sprint**: 2
- **Goal**: Build the playhead-agnostic ImageSequenceCanvas component
- **Status**: ✅ Complete
- **Date**: 2026-05-22
- **Agent Used**: Claude Sonnet 4.6
- **Duration**: ~4 minutes

## Tasks Completed
| # | Task | Status | Tests |
|---|------|--------|-------|
| 1 | Create Playhead interface | ✅ Done | 1 unit (type check) |
| 2 | Create usePlayhead hook | ✅ Done | 2 unit |
| 3 | Implement frame preloader | ✅ Done | 5 unit |
| 4 | Implement DPR-aware canvas sizing | ✅ Done | 4 unit |
| 5 | Implement frame clamping | ✅ Done | 5 unit |
| 6 | Implement ImageSequenceCanvas component | ✅ Done | 4 unit |
| 7-11 | Unit tests for all utilities | ✅ Done | 21 tests |
| 12 | Integration test: playhead → canvas draw | ✅ Done | 2 integration |
| 13 | Update regression runner | ✅ Done | — |

## Test Coverage
- **Unit tests added**: 25 (across 2 test files)
- **Integration tests added**: 2
- **Total test count (cumulative)**: 63 (Sprint 1: 33 + Sprint 2: 30)
- **Regression status**: ✅ All 63 tests passing

## Files Created
- `src/lib/types/playhead.ts` — Playhead interface
- `src/lib/types/index.ts` — type barrel export
- `src/lib/hooks/usePlayhead.ts` — ref-based playhead hook
- `src/lib/hooks/index.ts` — hooks barrel export
- `src/lib/canvas/preloader.ts` — frame URL resolution + async preloading
- `src/lib/canvas/sizing.ts` — DPR-aware canvas dimensions
- `src/lib/canvas/clamp.ts` — frame index clamping
- `src/lib/canvas/index.ts` — canvas barrel export
- `src/components/ImageSequenceCanvas.tsx` — main canvas component
- `src/components/index.ts` — components barrel export
- `src/__tests__/unit/sprint-2/canvas-engine.test.ts` — utility unit tests
- `src/__tests__/unit/sprint-2/image-sequence-canvas.test.tsx` — component tests
- `src/__tests__/integration/sprint-2/canvas-playhead-integration.test.tsx` — integration

## Key Decisions
- **GSAP ticker for draw loop** (not requestAnimationFrame) — ensures sync with GSAP timeline tweens
- **Redundant draw skipping** — `lastDrawnFrame` ref prevents unnecessary canvas redraws when frame hasn't changed
- **ResizeObserver for sizing** — responsive to container changes without window resize listener
- **Null tolerance in preloader** — failed frames return null, component skips null frames gracefully
- **No ScrollTrigger dependency** — canvas is fully playhead-driven as specified

## Known Issues / Tech Debt
- React `act()` warnings in component tests (non-critical, cosmetic)
- Preloader doesn't support abort/cancellation yet (future optimization)

## Next Sprint Preview
- Sprint 3: Section Mode (Default) — Observer-driven transitions
- Dependencies resolved: ImageSequenceCanvas + usePlayhead ready for SectionStage to drive
