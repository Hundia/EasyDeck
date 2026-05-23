# Sprint 6 Tasks

## Implementation Tasks

1. **Create `src/lib/lenis/initLenis.ts`** — Factory function
   - Creates Lenis instance with default options
   - Integrates with GSAP ticker: `gsap.ticker.add((time) => lenis.raf(time * 1000))`
   - Sets `gsap.ticker.lagSmoothing(0)` for consistency
   - Returns Lenis instance for context storage
   - Exports `LenisOptions` type for consumer customization

2. **Create `src/lib/lenis/LenisProvider.tsx`** — React context
   - `LenisContext` with value: `{ lenis: Lenis | null, stop: () => void, start: () => void }`
   - `LenisProvider` component that calls `initLenis()` on mount, destroys on unmount
   - `useLenis()` hook for consumers
   - Children rendered inside provider

3. **Implement auto-pause in section mode**
   - `useLenisPause()` hook — calls `lenis.stop()` on mount, `lenis.start()` on unmount
   - SectionStage uses this hook (or Stage passes a flag)
   - Alternative: Stage component manages pause/resume based on resolved mode
   - Implementation: in Stage.tsx, when mode is "section", call context.stop()

4. **Lenis Snap addon for snap mode**
   - When mode is "snap", configure Lenis with snap behavior
   - Use `lenis.options.syncTouch = true` for touch normalization
   - The actual snap is handled by ScrollTrigger's snap config (already in SnapStage)
   - Lenis just provides smooth scroll input — keep active, don't configure snap addon directly
   - Note: the "Lenis Snap addon" from requirements means Lenis stays active to provide
     smooth inertial scroll that feeds into ScrollTrigger's snap — NOT replacing ST snap

5. **Keep Lenis active in scrub mode**
   - Scrub + Lenis is a proven combo — smooth scroll feeds ScrollTrigger progress
   - No special handling needed, just ensure Lenis is running

6. **Handle Lenis ↔ ScrollTrigger refresh lifecycle**
   - On Lenis scroll event, call `ScrollTrigger.update()` if needed
   - On resize/layout change, call both `lenis.resize()` and `ScrollTrigger.refresh()`
   - Create `useLenisScrollTriggerSync()` hook or include in LenisProvider

7. **Unit test: initLenis**
   - Returns Lenis instance
   - Integrates with gsap.ticker
   - Destroy cleans up ticker listener

8. **Unit test: LenisProvider + useLenis**
   - Provides context with lenis instance
   - stop() calls lenis.stop()
   - start() calls lenis.start()
   - Cleanup destroys instance

9. **Unit test: useLenisPause**
   - Calls stop on mount
   - Calls start on unmount

10. **Integration test: Lenis pauses during section stage**
    - Mount Stage with section mode inside LenisProvider
    - Verify lenis.stop() was called
    - Unmount → verify lenis.start() called

## Dependencies
- Lenis ^1.3.4 (already installed)
- GSAP with ScrollTrigger (Sprint 4-5) ✅
- Stage component (Sprint 5) ✅
- SectionStage (Sprint 3) ✅

## Verification
- `npm run type-check` passes
- `npm test` passes (all cumulative + new)
- `npm run build` passes
