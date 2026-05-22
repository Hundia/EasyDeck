# SnapStage

`SnapStage` is the hybrid stage implementation.
It preserves continuous scrub feel within a pinned timeline while still settling to authored scene boundaries.

## Purpose

Use `SnapStage` when a story should feel fluid during scrolling but should still land on recognizable beats.
It is the closest match to Apple-style product storytelling with magnetic stops.

## Responsibilities

- Build a GSAP timeline with one label per scene.
- Pin the stage with `ScrollTrigger`.
- Scrub timeline progress during native scroll.
- Snap to the next scene label after scrolling stops.
- Keep the shared image playhead and overlays synchronized.

## Recommended ScrollTrigger shape

Key options typically include:

- `pin: true`
- `scrub: 1` or similar smoothing
- `invalidateOnRefresh: true`
- `snap.snapTo: "labelsDirectional"`
- `snap.duration: { min, max }`
- `snap.delay`
- `snap.directional`
- `snap.inertia`

`labelsDirectional` is preferred over plain `labels` because it respects direction of travel.
That makes small downward nudges reliably advance instead of snapping backward.

## Scene timeline structure

A common pattern is one label per scene index.
Each scene adds:

- a playhead tween toward its `endFrame`,
- an overlay sub-timeline,
- an optional analytics hook on snap completion.

## Lenis behavior

`SnapStage` is the mode most sensitive to Lenis integration.
Standard ScrollTrigger snapping can fight Lenis inertia, producing asymmetric up/down behavior.
When Lenis owns scrolling, prefer the `lenis/snap` addon so snapping stays inside the same system.

## Accessibility requirements

- Do not rely only on snap motion to communicate structure.
- Preserve semantic scene content outside the visual stage.
- Keep focus order logical when the stage is pinned.
- Honor reduced-motion fallback by collapsing or bypassing snapping.

## When not to use it

Avoid `SnapStage` if the story is basically discrete slides; use `SectionStage` instead.
Avoid it for extremely long continuous heroes where snapping becomes unnecessary friction; use `ScrubStage` instead.

## Related docs

- [Transition Modes](../architecture/transition-modes.md)
- [Lenis Integration](../integration/lenis.md)
- [GSAP Integration](../integration/gsap.md)
- [Image Sequence Pipeline](../architecture/image-sequence-pipeline.md)
