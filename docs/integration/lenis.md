# Lenis Integration

Lenis should be integrated differently depending on the active transition mode.
Smooth scrolling helps some experiences and harms others.

## Rules by mode

| Mode | Lenis rule | Reason |
| --- | --- | --- |
| `scrub` | Keep enabled | Smooth scrolling improves continuous playback |
| `snap` | Keep enabled, but prefer `lenis/snap` | Avoid ScrollTrigger snap vs inertia conflicts |
| `section` | Pause while active | Observer already owns gesture control |

## Recommended base hook

```ts
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function initLenis() {
  const lenis = new Lenis({ autoRaf: false, anchors: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}
```

## Section mode behavior

When entering a `section` stage, call `lenis.stop()`.
When exiting, restore with `lenis.start()`.
This prevents redundant smoothing loops and avoids awkward touch interactions.

## Snap mode behavior

ScrollTrigger snap can fight Lenis inertia.
If Lenis controls scroll, prefer the `lenis/snap` addon so snapping stays inside the same scroll system.
Useful addon capabilities include:

- `type: "mandatory" | "proximity" | "lock"`
- element alignment control
- imperative `next()`, `previous()`, and `goTo(index)`

## Scrub mode behavior

Keep Lenis active and feed updates into ScrollTrigger.
This is the most natural pairing because both systems support continuous scroll-driven motion.

## QA guidance

Test upward and downward snapping on trackpads and wheels.
Watch for asymmetry, overshoot, or snap fights, especially in hybrid timelines.

## Related docs

- [Transition Modes](../architecture/transition-modes.md)
- [SnapStage](../components/snap-stage.md)
- [SectionStage](../components/section-stage.md)
