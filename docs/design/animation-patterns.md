# Animation Patterns

This framework uses GSAP as the primary motion system.
`gsap` defines the baseline timeline, lifecycle, and easing patterns, while `gsap-framer-scroll-animation` contributes reusable scroll-reveal, parallax, and pinning heuristics adapted to the stage model.

## Framework motion model

Use motion patterns that match the active transition mode.

| Mode | Primary pattern | Notes |
| --- | --- | --- |
| `section` | discrete timeline segments driven by `Observer` | one gesture should map to one authored transition |
| `snap` | scrubbed timeline with labeled stops | continuous movement, then directional settling |
| `scrub` | direct scroll-to-progress mapping | best for long reveals and reduced-motion fallbacks |

For transition semantics, see [Transition Modes](../architecture/transition-modes.md).

## GSAP patterns

### Timeline composition

- Build one timeline per stage or pinned scene group.
- Use labels for scene boundaries and hook points.
- Keep playhead mutation separate from canvas drawing and semantic content.
- Scope timelines, observers, and triggers to component lifecycle.

### Component boundaries

- Keep `ImageSequenceCanvas` playhead-driven rather than trigger-driven.
- Let stages own `Observer` and `ScrollTrigger` setup.
- Keep pagination, overlays, and progress UI synchronized from scene state, not from duplicated animation logic.

### Route and lifecycle safety

- Register plugins before use in client code.
- Clean up observers, triggers, and tickers on unmount or route change.
- Refresh layout-dependent triggers only when dimensions or story inputs change.

See also [GSAP Integration](../integration/gsap.md).

## Scroll-driven recipes

### Parallax

Use parallax for depth cues, not for primary narrative content.

- Move background layers more slowly than the main focal layer.
- Keep text and controls on stable layers where possible.
- Avoid large parallax offsets in `section` mode because the scene change itself already carries motion.

### Reveals

Use reveals when a scene needs staged emphasis.

- Prefer opacity and translate combinations over layout-changing animation.
- Reveal supporting elements after the primary focal point is already readable.
- Use stagger sparingly; the message should still scan quickly.

### Pinning

Use pinning to hold the scene while motion completes.

- `section` stages are effectively pinned by design.
- `snap` and `scrub` should pin only when the canvas or composition needs stable framing.
- Release the pin as soon as the scene has delivered its main beat.

### Progress-linked overlays

When overlay copy or diagrams need to track motion:

- map state from timeline labels or normalized progress,
- avoid deriving layout directly from raw scroll position,
- keep semantic content readable even if motion is disabled.

## Easing selection guide

Choose easing based on narrative role.

| Use case | Recommended easing direction |
| --- | --- |
| Scene-to-scene presentation movement | smooth ease-out or ease-in-out |
| Small overlay reveals | short ease-out |
| Mechanical or data-focused motion | restrained linear or low-curve ease |
| Chapter openers and hero transitions | more expressive ease, used sparingly |

Guidelines:

- Default to restrained easing for repeated transitions.
- Use more characterful easing only on high-value beats.
- Keep adjacent scene transitions consistent unless contrast is intentional.
- Avoid bounce or elastic easing for core navigation because it weakens presentation clarity.

## Performance considerations

- Animate transforms and opacity before layout-affecting properties.
- Preload or predecode image sequences before heavy pinned sections begin.
- Keep the number of simultaneous animated layers low on mobile.
- Do not tie React rerenders to every scroll tick.
- Reuse timelines where practical and tear them down cleanly.
- Test on touch devices where pinning, inertia, and smooth scroll can conflict.

When reduced motion is requested, collapse decorative motion and preserve narrative order with simpler state changes.
See [Reduced Motion](../accessibility/reduced-motion.md).

## Skill integration

- `gsap` sets the default patterns for timelines, plugin lifecycle, and easing discipline.
- `gsap-framer-scroll-animation` informs reusable reveal, parallax, and pinning recipes for stage components.
- `nextjs` informs where motion code belongs: client components, scoped effects, and route-safe cleanup.

## Related docs

- [Design System Overview](README.md)
- [Scene Composition](scene-composition.md)
- [GSAP Integration](../integration/gsap.md)
- [Lenis Integration](../integration/lenis.md)
