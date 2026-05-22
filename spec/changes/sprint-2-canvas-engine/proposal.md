# Proposal: Sprint 2 — Canvas Engine & Playhead

## Change ID
`sprint-2-canvas-engine`

## Why
The ImageSequenceCanvas is the core rendering component shared by all three transition modes. It must be completely decoupled from scroll position — reading only from a mutable playhead ref. This enables section mode (tween-driven), snap mode (ScrollTrigger-driven), and scrub mode (progress-driven) to all use the same canvas.

## What Changes
- Create `Playhead` interface and `usePlayhead` hook
- Implement `ImageSequenceCanvas` component with GSAP ticker draw loop
- Implement frame preloading with progress callback
- Implement DPR-aware canvas sizing with resize handling
- Implement frame clamping (0 to frameCount-1)
- Unit tests for all canvas logic
- Integration test: playhead changes → canvas draws correct frame

## Impact
- **New files**: ~6 source files, ~3 test files
- **Affected specs**: canvas-engine
- **Dependencies**: gsap (ticker), @gsap/react (useGSAP)
- **Unlocks**: Sprint 3 (SectionStage), Sprint 4 (SnapStage), Sprint 5 (ScrubStage)
