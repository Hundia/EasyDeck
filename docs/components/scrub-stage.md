# ScrubStage

`ScrubStage` is the continuous-scroll stage implementation.
It ties animation progress directly to scroll progress through `ScrollTrigger({ scrub })`.

## Purpose

Use `ScrubStage` for long visual reveals, product spins, or other scenes where free exploration matters more than slide-like structure.
It is also the cleanest fallback when motion needs to be collapsed without trapping gestures.

## Responsibilities

- Create a scrubbed `ScrollTrigger` timeline.
- Map scroll progress to a shared playhead value.
- Position overlays by normalized progress fractions.
- Size the scroll range so the motion has enough physical distance.
- Cooperate with Lenis smooth scrolling.

## Interaction model

In scrub mode:

- native scroll remains the primary driver,
- there is no one-gesture-per-scene contract,
- scene boundaries can still exist conceptually, but the experience is continuous.

This makes scrub mode feel more exploratory and less prescriptive than `section` mode.

## GSAP pattern

Typical configuration includes:

- `trigger` bound to the stage element,
- `start: "top top"`,
- a computed `end` based on scene count or desired motion distance,
- `scrub: true` or a smoothing value,
- optional `pin: true` if the story should remain fixed while progress advances.

## Overlay timing

Overlay timing should use normalized scene fractions from the agent pipeline.
The runtime converts those fractions into ScrollTrigger timeline positions rather than absolute seconds.

## Accessibility notes

`ScrubStage` is generally friendlier than heavy gesture interception, but it still needs:

- semantic content beneath the stage,
- visible progress or scene cues where helpful,
- a reduced-motion path that can become nearly instant or fully static.

## Lenis behavior

Keep Lenis enabled here unless product constraints say otherwise.
Smooth scrolling usually improves the perceived quality of scrubbed motion.

## Related docs

- [Transition Modes](../architecture/transition-modes.md)
- [Lenis Integration](../integration/lenis.md)
- [Reduced Motion](../accessibility/reduced-motion.md)
- [SceneConfig and TransitionConfig](../schemas/scene-config.md)
