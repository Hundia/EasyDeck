# Sprint 5 Proposal: Scrub Mode & Stage Switcher

## Why
Complete the three transition modes by adding pure scrub (continuous scroll-driven playback with no magnetic stops) and unify all modes behind a single `<Stage>` component that routes based on story config.

## What
1. `ScrubStage` component — ScrollTrigger scrub without snap
2. `<Stage>` switcher — routes to SectionStage/SnapStage/ScrubStage based on `story.transition.mode`
3. Per-scene mode override support (scene-level `transition.mode` overrides story-level)
4. Overlay positioning by progress fraction in scrub mode
5. Unit + integration tests

## Impact
- Completes the three core transition modes (section ✅, snap ✅, scrub)
- Provides the public API surface (`<Stage story={...} />`) that consumers will use
- Per-scene override enables mixed-mode presentations

## Tasks
See tasks.md for implementation breakdown.

## Agent
- Model: Sonnet 4.6 (standard implementation, well-defined patterns from SnapStage)
