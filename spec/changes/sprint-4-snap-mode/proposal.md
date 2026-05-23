# Proposal: Sprint 4 — Snap Mode

## Change ID
`sprint-4-snap-mode`

## Why
Snap mode is the hybrid transition that gives users the Apple AirPods Pro experience — continuous scrub while scrolling, with magnetic settling to scene boundaries when they stop. It uses ScrollTrigger with `scrub: 1` and `snap: "labelsDirectional"` for directional snapping. This is the secondary mode for scenes where exploration feel matters but structure is still important.

## What Changes
- Create `SnapStage` component with ScrollTrigger (pin, scrub, snap)
- Wire scene labels to GSAP timeline positions
- Configure snap parameters (duration min/max, delay, ease, inertia, directional)
- Wire playhead to ScrollTrigger progress
- Implement per-scene overlay timelines (positioned by timeline progress)
- Prepare Lenis Snap addon integration point (avoid issue #389)
- Unit and integration tests

## Impact
- **New files**: ~3 source files, ~3 test files
- **Affected specs**: transition-modes
- **Dependencies**: Sprint 2 (ImageSequenceCanvas, usePlayhead)
- **Unlocks**: Sprint 5 (Stage switcher), Sprint 6 (Lenis Snap addon wiring)
