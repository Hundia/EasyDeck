# Proposal: Sprint 3 — Section Mode (Default)

## Change ID
`sprint-3-section-mode`

## Why
Section mode is the DEFAULT and most important transition mode. It delivers the "presentation feel" where one gesture = one scene. This is the core UX that differentiates the framework from simple scroll-based animations. It must handle Observer gestures, tween-driven playhead, keyboard nav, pagination, accessibility, and the animating lock pattern.

## What Changes
- Create `SectionStage` component (Observer-driven, full-viewport pinned stage)
- Create `Pagination` component (accessible nav dots)
- Implement gotoScene() with GSAP timeline tweens driving the playhead
- Implement overlay cross-fade system
- Implement animating lock (gestures dropped during transitions)
- Implement wrap vs clamp behavior
- Implement full keyboard navigation
- Implement pagination with aria-current and direct-jump
- Unit tests for all logic
- Integration test: SectionStage + ImageSequenceCanvas

## Impact
- **New files**: ~5 source files, ~4 test files
- **Affected specs**: transition-modes, accessibility
- **Dependencies**: Sprint 2 (ImageSequenceCanvas, usePlayhead, Playhead)
- **Unlocks**: Sprint 5 (Stage switcher), Sprint 6 (Lenis pause/resume)
