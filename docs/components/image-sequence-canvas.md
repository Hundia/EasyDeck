# ImageSequenceCanvas

`ImageSequenceCanvas` is the shared media renderer for the framework.
It draws image frames into a canvas based on a mutable playhead reference.

## Purpose

The component exists so stage implementations can share one rendering path.
It should not know whether frames are being driven by Observer gestures, ScrollTrigger scrub, or plain GSAP tweens.

## Core API

```ts
interface Playhead {
  frame: number;
}

type Props = {
  playhead: MutableRefObject<Playhead>;
  pattern: string;
  frameCount: number;
};
```

## Responsibilities

- Preload or progressively load image frames from a pattern.
- Clamp frame reads to the declared frame count.
- Draw the current frame onto a full-stage canvas.
- Resize cleanly with the viewport.
- Subscribe and unsubscribe from the GSAP ticker or equivalent draw loop.

## Design rule: playhead first

The most important architectural rule is that the canvas reads `playhead.frame`, not scroll progress.
That allows it to work with all three transition modes.

## Expected render flow

1. Resolve the image URL from the frame pattern.
2. Load or decode the image.
3. Round `playhead.frame` to the nearest valid frame index.
4. Draw the image into the canvas context.
5. Repeat as the playhead changes.

## Performance notes

- Avoid recreating image arrays on every render.
- Use a single draw path for all modes.
- Clamp aggressively to prevent invalid array access.
- Consider DPR-aware canvas sizing to avoid blur.
- Clear ticker subscriptions during cleanup.

## Failure cases

Watch for:

- missing or malformed frame patterns,
- frame counts that do not match actual assets,
- stories that jump between unrelated frame ranges,
- duplicate draw loops after React remounts.

## Related docs

- [Image Sequence Pipeline](../architecture/image-sequence-pipeline.md)
- [SectionStage](section-stage.md)
- [SnapStage](snap-stage.md)
- [ScrubStage](scrub-stage.md)
