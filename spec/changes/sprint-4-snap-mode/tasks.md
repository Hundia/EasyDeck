# Implementation Tasks — Sprint 4: Snap Mode

1. Create `SnapStage` component shell with full-viewport pinned stage
2. Implement GSAP timeline with one label per scene (scene.id as label name)
3. Implement ScrollTrigger with pin, scrub:1, and snap:"labelsDirectional" configuration
4. Configure snap parameters from TransitionConfig (duration min/max, delay, ease, inertia, directional)
5. Wire playhead.frame to ScrollTrigger progress (progress * total frames per scene segment)
6. Implement per-scene overlay sub-timelines (positioned by normalized timeline progress)
7. Add Lenis Snap addon integration point (preparatory — full wiring in Sprint 6)
8. Wire reduced-motion fallback (disable snap, allow free scrub)
9. Export SnapStage from components/index.ts
10. Unit test: timeline labels are created at correct positions
11. Unit test: snap config maps from TransitionConfig correctly
12. Unit test: playhead frame calculation from progress
13. Unit test: reduced-motion disables snapping
14. Integration test: SnapStage renders with ScrollTrigger + canvas
15. Update regression test runner for sprint-4
