# Sprint 7 Tasks

## Implementation Tasks

1. **Create `src/lib/a11y/useReducedMotion.ts`** — Hook for prefers-reduced-motion
   - Returns boolean `prefersReducedMotion`
   - Listens for changes (mediaQuery.addEventListener)
   - Used by all stage components to disable/simplify animations

2. **Create `src/lib/a11y/useTouchTolerance.ts`** — Adaptive tolerance
   - Returns appropriate tolerance value: 20 on mobile, 10 on desktop
   - Detects via `navigator.maxTouchPoints > 0` or media query `(pointer: coarse)`
   - Used by SectionStage Observer config

3. **Create `src/components/SemanticLayer.tsx`** — Screen reader content
   - Renders semantic HTML (headings, paragraphs) for each scene's content
   - Visually hidden (sr-only) but accessible to screen readers
   - Includes scene labels and overlay content text
   - Props: `{ scenes: SceneConfig[], currentIndex: number }`

4. **Create `src/components/SkipToContent.tsx`** — Skip link
   - Standard a11y skip link, visible on focus
   - Targets main content area
   - "Skip to presentation content"

5. **Create `src/components/ProgressBar.tsx`** — Scroll progress indicator
   - Vertical bar showing overall progress
   - Scene markers at boundaries
   - aria-valuenow, aria-valuemin, aria-valuemax for a11y
   - Props: `{ progress: number, sceneCount: number, currentIndex: number }`

6. **Create `src/lib/a11y/useHashNavigation.ts`** — URL hash persistence
   - Writes `#scene-{index}` to URL on scene change
   - On mount, reads hash and returns initial scene index
   - Uses `replaceState` (not pushState) to avoid polluting history
   - Returns: `{ initialIndex: number, updateHash: (index: number) => void }`

7. **Create `src/lib/a11y/useNormalizeScroll.ts`** — Touch normalization
   - On touch devices, calls `ScrollTrigger.normalizeScroll(true)`
   - Cleanup: `ScrollTrigger.normalizeScroll(false)`
   - Only for snap/scrub modes (section uses Observer, not scroll)

8. **Update SectionStage** — Wire reduced-motion, tolerance, hash
   - Use `useReducedMotion()` — when true, skip Observer preventDefault, instant transitions
   - Use `useTouchTolerance()` — pass to Observer config
   - Use `useHashNavigation()` — update hash on scene change, init from hash

9. **Update Stage component** — Add SemanticLayer, SkipToContent, ProgressBar
   - Add SemanticLayer inside Stage (always rendered)
   - Add SkipToContent before Stage content
   - Add ProgressBar (driven by currentIndex/progress)

10. **Unit tests**
    - useReducedMotion: returns true/false based on matchMedia
    - useTouchTolerance: returns 20 for coarse, 10 for fine
    - useHashNavigation: reads/writes hash
    - ProgressBar: renders with correct aria attributes
    - SemanticLayer: renders scene content accessibly
    - SkipToContent: visible on focus, links to content

11. **Integration tests**
    - Keyboard-only navigation: Tab to dots, Enter to navigate, Arrow keys
    - Reduced-motion: Stage renders static fallback (no animations triggered)

## Dependencies
- All stage components (Sprints 3-5) ✅
- Pagination (Sprint 3) ✅
- Lenis integration (Sprint 6) ✅

## Verification
- `npm run type-check` passes
- `npm test` passes (all cumulative + new)
- `npm run build` passes
