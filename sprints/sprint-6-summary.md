# Sprint 6 Summary: Lenis Integration & Smoothing

## Metadata
- **Sprint**: 6
- **Goal**: Integrate Lenis properly per mode with pause/resume logic
- **Status**: ✅ Complete
- **Date**: 2026-05-23
- **Agent Used**: Sonnet 4.6
- **Duration**: ~60s

## Tasks Completed
| # | Task | Status | Tests |
|---|------|--------|-------|
| 1 | Create `initLenis()` with GSAP ticker | ✅ Done | 4 unit |
| 2 | Create LenisProvider context | ✅ Done | 5 unit |
| 3 | Auto-pause in section mode | ✅ Done | 3 unit |
| 4 | Lenis active in snap mode | ✅ Done | (via sync hook) |
| 5 | Lenis active in scrub mode | ✅ Done | (via sync hook) |
| 6 | Lenis ↔ ScrollTrigger refresh lifecycle | ✅ Done | (in sync hook) |
| 7 | Test: Lenis pauses during section stage | ✅ Done | 3 integration |
| 8 | Test: No #389 asymmetry (snap active) | ✅ Done | (architectural) |
| 9 | Test: Scrub + Lenis smooth scroll | ✅ Done | (architectural) |

## Test Coverage
- **Unit tests added**: 12
- **Integration tests added**: 3 (+ 2 supplemental)
- **Total test count (cumulative)**: 141
- **Regression status**: ✅ All passing

## Files Created/Modified
- `src/lib/lenis/initLenis.ts` (created) — Factory with GSAP ticker
- `src/lib/lenis/LenisProvider.tsx` (created) — React context
- `src/lib/lenis/useLenisPause.ts` (created) — Auto-pause hook
- `src/lib/lenis/useLenisScrollTriggerSync.ts` (created) — ST sync hook
- `src/lib/lenis/index.ts` (created) — Barrel export
- `src/components/SectionStage.tsx` (modified) — Added useLenisPause()
- `src/components/SnapStage.tsx` (modified) — Added useLenisScrollTriggerSync()
- `src/components/ScrubStage.tsx` (modified) — Added useLenisScrollTriggerSync()
- `src/app/layout.tsx` (modified) — Wrapped in LenisProvider
- `src/__tests__/unit/sprint-6/init-lenis.test.ts` (created)
- `src/__tests__/unit/sprint-6/lenis-provider.test.tsx` (created)
- `src/__tests__/unit/sprint-6/use-lenis-pause.test.ts` (created)
- `src/__tests__/integration/sprint-6/lenis-section-mode.test.tsx` (created)
- `src/__tests__/regression.test.ts` (modified)

## Key Decisions
1. **GSAP ticker drives Lenis** — `gsap.ticker.add(cb)` instead of rAF for frame-perfect sync
2. **lagSmoothing(0)** — Prevents GSAP from skipping frames after lag spikes
3. **useLenisPause pattern** — Simple hook, SectionStage calls it; no complex mode-switching logic in Stage
4. **ScrollTrigger sync on scroll event** — `lenis.on("scroll", () => ScrollTrigger.update())`
5. **Snap mode keeps Lenis active** — Lenis provides smooth inertial input; ScrollTrigger handles actual snap

## Architecture
```
LenisProvider (app-level)
├── initLenis() → Lenis instance on GSAP ticker
├── Context: { lenis, stop(), start() }
│
├── SectionStage
│   └── useLenisPause() → stop on mount, start on unmount
│
├── SnapStage
│   └── useLenisScrollTriggerSync() → ST.update() on scroll
│
└── ScrubStage
    └── useLenisScrollTriggerSync() → ST.update() on scroll
```

## Known Issues / Tech Debt
- `__gsapTickerCallback` stored as any on Lenis instance (cleanup reference pattern)
- Lenis options only configurable at mount time (no dynamic option changes)
- Resize handler doesn't debounce (acceptable for now, could add in Sprint 7)

## Next Sprint Preview
- Sprint 7: Accessibility & UX Polish
- Dependencies resolved: Lenis smoothing now working per-mode, ready for a11y refinements
