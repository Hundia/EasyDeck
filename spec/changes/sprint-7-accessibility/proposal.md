# Sprint 7 Proposal: Accessibility & UX Polish

## Why
WCAG 2.1 AA compliance is a hard requirement. All presentation content must be accessible via screen readers, keyboard, and reduced-motion preferences. Mobile UX must feel natural with appropriate touch tolerances.

## What
1. Reduced-motion detection + static fallback (no animations, no Observer preventDefault)
2. Semantic content layer (screen reader accessible content beneath visual canvas)
3. Skip-to-content link
4. Mobile touch tolerance (20px on phones, 10px on desktop)
5. ScrollTrigger.normalizeScroll(true) on touch devices
6. URL hash persistence + deep-linking (#scene-N)
7. Scroll-progress indicator bar
8. Unit + integration tests for a11y

## Impact
- WCAG 2.1 AA compliance achieved
- Screen readers can access all content
- Keyboard-only users can fully navigate
- Mobile users get natural touch interactions
- Deep-linking enables sharing specific scenes

## Agent
- Model: Sonnet 4.6 (medium complexity, well-defined a11y patterns)
