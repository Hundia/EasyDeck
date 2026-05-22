# Image Sequence Pipeline

The image sequence system is a canvas-based renderer designed to work across all transition modes.
Its most important design rule is that frame playback is **playhead-agnostic**.

## Goals

- Render frame sequences efficiently on a `<canvas>`.
- Support both tween-driven and scroll-driven frame updates.
- Keep the canvas component isolated from GSAP trigger semantics.
- Allow stories to define frame ranges per scene without rewriting the renderer.

## Core contract

The shared API is a mutable playhead object:

```ts
interface Playhead {
  frame: number;
}
```

A stage owns how `playhead.frame` changes.
`ImageSequenceCanvas` only reads the current frame and draws the right image.

## Why playhead-agnostic matters

Without this abstraction, the canvas would be coupled to `ScrollTrigger.progress`.
That would break `section` mode, where the playhead is advanced by a tween rather than native scroll.
With the abstraction in place:

- `section` can tween between frame boundaries.
- `snap` can scrub during scroll and then settle to labels.
- `scrub` can map progress directly from scroll.

## Render lifecycle

1. Preload images based on the scene or story frame pattern.
2. Initialize a canvas sized to the stage viewport.
3. Read `Math.round(playhead.frame)` on every ticker tick or relevant update.
4. Clamp the frame index to `[0, frameCount - 1]`.
5. Draw the decoded image into the canvas.

## Scene frame boundaries

Scene configs define `startFrame` and `endFrame`.
In `section` mode, adjacent scenes should be frame-contiguous so reverse navigation looks seamless.
That rule is enforced in schema validation through `superRefine()`.

## Overlay synchronization

The canvas is only one part of the composition.
Overlays are authored separately and synchronized by mode:

- `section` and `snap` map normalized timings into scene timeline seconds.
- `scrub` maps normalized timings into scroll progress fractions.

This keeps agents authoring one timing model while renderers translate it appropriately.

## Performance considerations

- Draw only the current frame, not the entire sequence.
- Reuse a single canvas per stage when possible.
- Avoid layout work during draw loops.
- Keep image dimensions and DPR strategy explicit to prevent blurry or oversized renders.
- Clean up GSAP tickers on unmount.

## Failure modes to guard against

- Missing frames or invalid patterns.
- Non-contiguous frame ranges in section stories.
- Stage swaps that leave multiple tickers attached.
- Drawing before images are decoded.

## Recommended ownership

- Stage components own motion and playhead mutation.
- Canvas owns image loading and drawing.
- Schema owns frame validity rules.
- Agents own scene segmentation and rationale, not rendering internals.

See also: [ImageSequenceCanvas](../components/image-sequence-canvas.md), [SceneConfig](../schemas/scene-config.md), and [Transition Modes](transition-modes.md).
