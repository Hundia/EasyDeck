# Transition Modes

The framework supports three runtime transition modes: `section`, `snap`, and `scrub`.
All three share the same scene schema and image-sequence canvas, but they differ in how they drive the playhead.

## Comparison table

| Mode | Driver | Playback model | Best for | Default |
| --- | --- | --- | --- | --- |
| `section` | GSAP `Observer` | One gesture triggers one scene transition | Guided presentations | Yes |
| `snap` | `ScrollTrigger` + directional snap | Continuous scrub, then settle to labels | Hybrid storytelling | No |
| `scrub` | `ScrollTrigger({ scrub })` | Continuous mapping from scroll to progress | Long visual reveals | No |

## Section mode

`section` is the framework default because it feels closest to a slide deck.
The stage is pinned, native scroll is effectively suppressed, and gestures are turned into explicit `gotoScene()` calls.

Key behaviors:

- Uses `Observer.create({ type: "wheel,touch,pointer" })`.
- Usually sets `wheelSpeed: -1` so wheel-down advances forward.
- Drops extra gestures while `animating` is true instead of queuing them.
- Tweens the playhead to `scene.endFrame` using configured duration and easing.
- Needs a separate keyboard listener because Observer does not handle keyboard input.

Section mode is best when scenes are discrete, short, and visually dominant.
It should not be used for text-heavy reading flows.

## Snap mode

`snap` is the hybrid mode.
Users scrub continuously through a pinned timeline, but when input stops, scroll position settles to the next label in the direction of travel.

Key behaviors:

- Uses a label-tagged GSAP timeline with one label per scene.
- Uses `snapTo: "labelsDirectional"` to favor the next scene in scroll direction.
- Honors `snapDelay`, `snapDurationMin`, `snapDurationMax`, `directional`, and `inertia` from schema.
- Pairs well with Apple-style product storytelling where motion should feel fluid but still land on authored beats.

Snap mode is the closest match to the AirPods Pro style of continuous-yet-magnetic storytelling.

## Scrub mode

`scrub` keeps the relationship between scroll and animation direct.
The timeline's progress tracks native scroll progress, so there is no discrete scene jump.

Key behaviors:

- Uses `ScrollTrigger` scrub without directional labels.
- Works well for long hero reveals, product spins, and single-canvas narratives.
- Keeps Lenis active because smooth scroll improves the feel.
- Is also the safest motion fallback when reduced motion is requested.

## Choosing a mode

Use this rubric:

- Choose `section` when each scene should feel like a presentation slide.
- Choose `snap` when users should scrub within a scene but still land on authored stops.
- Choose `scrub` when the experience is mainly exploratory or continuous.

NarrativeDesigner should choose per-scene mode only when there is a clear storytelling reason.
If no rationale exists, inherit the story default and keep the system simpler.

## Accessibility implications

- `section` requires explicit keyboard handling and pagination.
- `snap` and `scrub` must still preserve semantic content outside the canvas.
- `prefers-reduced-motion: reduce` should collapse or bypass heavy motion, typically by falling back to `scrub-instant` or static content.
- Touch tolerance should be raised on phones to reduce accidental scene changes.

## Integration notes

- Lenis should pause in `section` mode.
- Lenis should usually stay active in `scrub` mode.
- For `snap`, prefer the Lenis Snap addon when Lenis owns scroll to avoid asymmetry issues.

See also: [Lenis Integration](../integration/lenis.md), [SectionStage](../components/section-stage.md), [SnapStage](../components/snap-stage.md), and [Reduced Motion](../accessibility/reduced-motion.md).
