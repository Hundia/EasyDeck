# Sprint 9 Tasks

## Implementation Tasks

1. **Install & configure Playwright** — `playwright.config.ts`
   - Install: `@playwright/test`
   - Configure: chromium, firefox, webkit
   - Base URL: localhost:3000
   - Output: `e2e-results/`
   - Add npm scripts: `test:e2e`

2. **E2E test: full navigation flow** — `e2e/navigation.spec.ts`
   - Load page with Stage component
   - Verify initial scene renders
   - Keyboard navigation (ArrowDown, ArrowUp)
   - Verify scene transitions work
   - Verify pagination dots update

3. **E2E test: mode switching** — `e2e/modes.spec.ts`
   - Test section mode (Observer-driven)
   - Test snap mode (scroll-based)
   - Test scrub mode (continuous)
   - Verify correct components render per mode

4. **E2E test: accessibility** — `e2e/accessibility.spec.ts`
   - Tab navigation flow
   - Skip link functionality
   - aria-current updates on pagination
   - Semantic layer present in DOM

5. **Integration test: pipeline to render** — `src/__tests__/integration/sprint-9/`
   - createPresentation → Stage render full flow
   - Multiple modes through pipeline
   - Error handling (invalid brief → descriptive error)

6. **Performance utilities** — `src/lib/perf/`
   - `FPSMonitor`: tracks frame rate via requestAnimationFrame delta
   - `MemoryMonitor`: tracks JS heap size (if available via performance.memory)
   - Export as utilities for development/profiling

7. **Memory leak detection tests**
   - Mount/unmount Stage — verify no lingering event listeners
   - Mount/unmount with Lenis — verify ticker cleanup
   - Canvas cleanup on unmount
   - ScrollTrigger cleanup

8. **Bundle size audit script** — `scripts/bundle-audit.mjs`
   - Run after build, parse `.next/` or `out/` sizes
   - Report total JS, CSS, per-route sizes
   - Fail if total exceeds budget (e.g., 200KB gzipped JS)
   - Add npm script: `audit:bundle`

9. **Documentation final polish**
   - Verify all docs/*.md files are up to date
   - Add `docs/GETTING_STARTED.md` — quick start guide
   - Add `docs/API.md` — public API reference (Stage, pipeline, schemas)
   - Update main README if needed

10. **Update regression test runner**
    - Add Sprint 9 integration test imports
    - Ensure all 235+ previous tests still pass

## Dependencies
- All sprints 1-8 complete ✅
- Framework fully functional

## Verification
- `npm run type-check` passes
- `npm test` passes (unit + integration, all cumulative)
- `npm run build` passes
- Playwright installs and config validates
- Bundle audit runs without errors
