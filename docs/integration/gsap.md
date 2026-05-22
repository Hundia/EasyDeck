# GSAP Integration

GSAP is the motion backbone of the framework.
The main plugins used here are `ScrollTrigger`, `Observer`, and optionally `@gsap/react` for lifecycle-safe setup.

## Plugin registration

Register every plugin before use in client-side runtime code:

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, Observer, useGSAP);
```

## Core usage patterns

### Observer for `section`

Use Observer to convert gestures into discrete scene transitions.
Keep an `animating` guard so extra gestures are ignored during playback.

### ScrollTrigger for `snap`

Use a pinned timeline with labels and directional snap.
Prefer `labelsDirectional` over plain `labels` for scene-based narratives.

### ScrollTrigger for `scrub`

Use scrubbed progress for continuous playback.
Decide whether pinning is needed based on the story layout.

## React lifecycle guidance

- scope GSAP work to a stage ref,
- clean up triggers and observers on unmount,
- avoid duplicate ticker subscriptions,
- refresh only when layout or story inputs change.

## Useful patterns

- use timeline labels for scene boundaries,
- keep playhead mutation separate from draw logic,
- call `ScrollTrigger.normalizeScroll(true)` on touch devices when needed,
- attach analytics or scene-enter hooks to snap completion or scene change boundaries.

## Anti-patterns

- binding the canvas directly to `ScrollTrigger.progress`,
- mixing Lenis and native snap without testing,
- relying on motion alone for scene comprehension,
- leaving observers active across route transitions.

## Related docs

- [Transition Modes](../architecture/transition-modes.md)
- [ImageSequenceCanvas](../components/image-sequence-canvas.md)
- [Lenis Integration](lenis.md)
