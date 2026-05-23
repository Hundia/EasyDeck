# Architecture Overview

The framework is a React/Next.js scrollytelling presentation engine designed around scene-based storytelling.
It separates narrative structure, playback mechanics, and accessibility behavior so the same story can render through multiple transition models.

## Architectural layers

1. **Story definition** — Zod schemas describe story metadata, scenes, frame ranges, overlays, and transition defaults.
2. **Agent pipeline** — NarrativeDesigner proposes scenes and timing; SceneComposer validates and normalizes them.
3. **Stage runtime** — a stage component chooses `section`, `snap`, or `scrub` playback.
4. **Canvas engine** — a playhead-driven image-sequence renderer paints the current frame.
5. **UX shell** — pagination, keyboard handling, reduced-motion logic, and semantic content keep the experience usable.

## Runtime data flow

```text
Agent output -> StorySchema parse -> Stage selection -> Playhead updates -> Canvas draw -> Overlay sync
```

The important boundary is between **playhead production** and **playhead consumption**.
Stages produce frame progress in different ways, but `ImageSequenceCanvas` only consumes a `playhead.frame` value.

## Core subsystems

### Transition engine

- `section`: GSAP `Observer` captures wheel, touch, and pointer gestures.
- `snap`: `ScrollTrigger` scrubs continuously and settles to scene labels.
- `scrub`: `ScrollTrigger` maps native scroll position directly to progress.

Read more: [Transition Modes](transition-modes.md).

### Media engine

- Uses a canvas to draw image sequences efficiently.
- Decouples frame playback from native scroll so it can be driven by a tween or scrubber.
- Allows scene boundaries to align with frame ranges validated in schema.

Read more: [Image Sequence Pipeline](image-sequence-pipeline.md).

### Validation layer

- Zod enforces sane defaults and catches invalid combinations early.
- `TransitionConfig` defines mode defaults and behavior knobs.
- `StorySchema.superRefine()` enforces frame continuity in `section` mode.

Read more: [Schema Overview](../schemas/README.md).

### Design system

- Defines token architecture from primitives to semantic and component tokens.
- Sets visual hierarchy rules for scene composition, hero treatments, and UI chrome.
- Establishes animation patterns that align GSAP motion with presentation intent.

Read more: [Design System Overview](../design/README.md).

### Accessibility layer

- Keyboard navigation is mandatory for section-style stages.
- `prefers-reduced-motion` must bypass gesture trapping and collapse motion.
- Pagination uses ARIA patterns so scene state remains perceivable.
- Semantic narrative content exists below the visual stage as progressive enhancement.

Read more: [Accessibility Guidelines](../accessibility/README.md).

## Architectural decisions

- **Default mode is `section`** because the framework is presentation-first.
- **Lenis is mode-dependent** because smooth scrolling helps scrub interactions but conflicts with pinned Observer stages.
- **Agents emit normalized timing** so rendering can convert it into time-based or progress-based animation later.
- **The canvas is reusable across modes** because the playhead API is agnostic to scroll source.

## Recommended mental model

Treat a story as a stack of scenes, each with:

- a frame range,
- a visual overlay timeline,
- a transition mode or inherited mode,
- a rationale for why that motion model fits the narrative.

## Related docs

- [Transition Modes](transition-modes.md)
- [Agent Pipeline](agent-pipeline.md)
- [SectionStage](../components/section-stage.md)
- [Lenis Integration](../integration/lenis.md)
