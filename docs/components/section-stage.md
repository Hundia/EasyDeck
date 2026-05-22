# SectionStage

`SectionStage` is the default stage implementation.
It creates a presentation-like experience where one gesture advances one scene.

## Purpose

Use `SectionStage` when the story should feel like a guided deck rather than a free-scrolling article.
It works best for dense visual narratives with limited text per scene.

## Responsibilities

- Pin or occupy a full-viewport stage.
- Capture wheel, touch, and pointer gestures with GSAP `Observer`.
- Map each accepted gesture to `gotoScene(nextIndex, direction)`.
- Tween the shared image playhead to the target scene frame boundary.
- Cross-fade or sequence overlays for the active scene.
- Expose pagination state and optional direct scene jumps.
- Restore normal behavior on cleanup.

## Core interaction pattern

Recommended Observer configuration:

- `type: "wheel,touch,pointer"`
- `wheelSpeed: -1`
- `tolerance: 10` on desktop, about `20` on phones
- `preventDefault: true` unless reduced motion is active

Extra input is dropped while `animating` is true.
This avoids queued gestures that can make scroll-jacked experiences feel hostile.

## Keyboard support

Observer does not handle keyboard navigation.
`SectionStage` must add a separate key handler for:

- `ArrowDown`, `PageDown`, and `Space` -> next scene
- `ArrowUp` and `PageUp` -> previous scene
- `Home` -> first scene
- `End` -> last scene

This behavior is required, not optional.

## Lenis behavior

If the app uses Lenis globally, `SectionStage` should pause it while active.
Lenis adds no value here because Observer is already preventing native scrolling.
Re-enable Lenis on stage exit.

## Reduced-motion behavior

When `prefers-reduced-motion: reduce` is active:

- collapse transition duration to nearly zero,
- skip gesture trapping where possible,
- allow semantic content below the stage to remain usable.

See [Reduced Motion](../accessibility/reduced-motion.md).

## Accessibility requirements

- Render pagination with `aria-current="step"`.
- Preserve semantic narrative content below the stage.
- Keep current scene state perceivable without relying only on motion.
- Provide a skip-to-content path.

## Related docs

- [Transition Modes](../architecture/transition-modes.md)
- [Pagination](pagination.md)
- [Keyboard Navigation](../accessibility/keyboard-navigation.md)
- [Lenis Integration](../integration/lenis.md)
