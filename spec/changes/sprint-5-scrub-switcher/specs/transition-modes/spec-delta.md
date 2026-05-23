# Spec Delta: Transition Modes — Scrub Mode & Stage Switcher

## EARS Requirements

### ScrubStage Component
- **WHEN** the story transition mode is "scrub", **THE SYSTEM SHALL** render a ScrubStage that pins the container and drives the playhead continuously via ScrollTrigger progress.
- **WHEN** the user scrolls within a ScrubStage, **THE SYSTEM SHALL** update `playhead.current.frame` to `Math.round(progress * totalFrames)` with no discrete stops.
- **WHEN** a scene has overlays with `enterAt`/`exitAt` fractions, **THE SYSTEM SHALL** animate overlay visibility at the corresponding progress positions using GSAP autoAlpha.
- **WHEN** the user has reduced-motion preference active, **THE SYSTEM SHALL** disable scrub animations and show a static fallback.

### Stage Switcher
- **THE SYSTEM SHALL** export a `<Stage story={...} />` component that renders the appropriate stage component based on `story.transition.mode`.
- **WHEN** `story.transition.mode` is "section", **THE SYSTEM SHALL** render `<SectionStage>`.
- **WHEN** `story.transition.mode` is "snap", **THE SYSTEM SHALL** render `<SnapStage>`.
- **WHEN** `story.transition.mode` is "scrub", **THE SYSTEM SHALL** render `<ScrubStage>`.

### Per-Scene Override
- **WHEN** all scenes in a story share the same `scene.transition.mode` override, **THE SYSTEM SHALL** use that mode instead of the story-level mode.
- **WHEN** scenes have mixed mode overrides, **THE SYSTEM SHALL** fallback to the story-level `transition.mode`.

## Constraints
- ScrubStage MUST NOT include any snap configuration
- Stage switcher MUST be the only public-facing component (consumers use `<Stage>`, not individual stages)
- TypeScript strict, all exports typed
- Accessibility: reduced-motion support required
