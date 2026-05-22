# Reduced Motion

The framework must honor `prefers-reduced-motion: reduce` as a hard requirement.
Scrollytelling can be visually rich without forcing animated transitions on everyone.

## Primary rule

When reduced motion is requested:

- collapse transition durations toward zero,
- avoid `Observer.preventDefault` when possible,
- preserve native scroll and semantic content access,
- choose a fallback mode defined by `StorySchema.reducedMotionFallback`.

## Supported fallback strategies

### `scrub-instant`

Keep the story in a scroll-based structure, but remove most animation duration.
This is the recommended default because it preserves reading flow while minimizing motion.

### `static`

Render the narrative as conventional content with little or no enhanced stage behavior.
Use when the animated layer is not essential for comprehension.

### `disable`

Disable enhanced interaction and rely on a simpler presentation path.
This is useful when a story cannot degrade safely through animated runtime components.

## Mode-specific guidance

- `section`: do not aggressively trap gestures; scene transitions should become instant or the stage should degrade.
- `snap`: collapse snap timing and avoid long magnetic settling.
- `scrub`: keep progress mapping simple and minimize visual interpolation.

## Implementation notes

A common pattern is:

```ts
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const effectiveMode = reducedMotion ? "scrub-instant" : config.transition.mode;
```

The exact runtime branching can differ, but the user outcome should remain predictable and comfortable.

## Content rule

The semantic story must remain available even if the animated layer is bypassed entirely.
Reduced-motion support is not complete if important content only appears inside animated overlays.

## Related docs

- [Accessibility Guidelines](README.md)
- [StorySchema](../schemas/story-schema.md)
- [Transition Modes](../architecture/transition-modes.md)
