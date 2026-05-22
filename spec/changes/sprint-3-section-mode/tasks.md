# Implementation Tasks — Sprint 3: Section Mode

1. Create `SectionStage` component shell with full-viewport pinned stage
2. Implement GSAP Observer (wheel, touch, pointer) with tolerance and wheelSpeed config
3. Implement `gotoScene(index, direction)` with GSAP timeline tweens driving playhead
4. Wire playhead to ImageSequenceCanvas (tween-based frame driving)
5. Implement overlay cross-fade system (autoAlpha transitions)
6. Implement `animating` lock — drop gestures during active transitions
7. Implement `wrapEnabled` (gsap.utils.wrap) vs clamp (Math.max/min) behavior
8. Implement keyboard navigation handler (ArrowDown/Up, PageDown/Up, Home, End, Space)
9. Create `Pagination` component (nav with aria-label, buttons with aria-current="step")
10. Implement direct-jump from pagination button click
11. Wire reduced-motion detection (collapse duration, skip preventDefault)
12. Unit test: gotoScene advances index correctly
13. Unit test: animating lock drops rapid gestures
14. Unit test: keyboard navigation maps keys to scene changes
15. Unit test: Pagination renders correct number of dots with aria attributes
16. Unit test: wrapEnabled wraps vs clamp behavior
17. Integration test: SectionStage + ImageSequenceCanvas (gesture → playhead → draw)
18. Update regression test runner for sprint-3
