# Component Catalog

This catalog describes the major runtime components in the scrollytelling presentation framework.
Components are organized around a small set of contracts: story data, playhead updates, overlays, and accessibility controls.

## Top-level stage pattern

A top-level stage switcher typically selects one of three implementations based on `story.transition.mode`:

- `SectionStage`
- `SnapStage`
- `ScrubStage`

Each stage renders the same story model but drives motion differently.

## Shared component responsibilities

### Stage components

Stage components are responsible for:

- pinning or sizing the viewport region,
- choosing the GSAP interaction driver,
- mutating the shared playhead,
- coordinating overlays,
- integrating pagination, keyboard support, and reduced-motion behavior.

### Media components

`ImageSequenceCanvas` is the key media renderer.
It should stay agnostic to whether motion comes from Observer, ScrollTrigger scrub, or a direct tween.

### Navigation components

Pagination dots make full-page narrative motion understandable and directly navigable.
They are especially important in `section` mode.

## Catalog

- [SectionStage](section-stage.md) — gesture-driven presentation mode.
- [SnapStage](snap-stage.md) — hybrid scrub-plus-snap mode.
- [ScrubStage](scrub-stage.md) — fully continuous scroll mode.
- [ImageSequenceCanvas](image-sequence-canvas.md) — shared canvas renderer.
- [Pagination](pagination.md) — scene navigation UI.

## Shared props and data

Most runtime components depend on some portion of:

- `StorySchema`
- `SceneConfig`
- `TransitionConfig`
- a mutable `Playhead`
- overlay refs or render functions

## Design rules

- Keep animation orchestration in stages, not in the canvas.
- Avoid duplicating transition logic across components.
- Treat accessibility helpers as part of the component contract.
- Prefer explicit cleanup of GSAP observers, triggers, and ticker subscriptions.

## Suggested reading order

1. [ImageSequenceCanvas](image-sequence-canvas.md)
2. [SectionStage](section-stage.md)
3. [SnapStage](snap-stage.md)
4. [ScrubStage](scrub-stage.md)
5. [Pagination](pagination.md)

See also: [Transition Modes](../architecture/transition-modes.md) and [Schema Overview](../schemas/README.md).
