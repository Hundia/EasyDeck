# Addendum: Snap & Section Transitions

> Append this to `ScrollyTelling_sprint.md`. It supersedes the “continuous scrub everywhere” assumption in Phases 2–4. **Section-based snap is the new default transition mode**; continuous scrub is retained as an opt-in.

-----

## TL;DR (decision row)

1. **Default transition mode = `"section"` (Observer-driven, one gesture = one scene).** It feels presentation-like, is what Eli described, and cleanly decouples canvas-frame playback from native scroll position. We pin a single full-viewport stage and play each scene’s image-sequence + overlay timeline as a timed GSAP timeline on each wheel/swipe/key gesture.
1. **`"snap"` (ScrollTrigger `scrub` + `snap: "labelsDirectional"`) is the secondary mode.** Use it when you want the cool continuous scrub *within* a scene but still want the page to settle to scene boundaries when the user stops. This is the closest match to the Apple AirPods Pro page behavior.
1. **`"scrub"` (the existing continuous mode) is retained as an opt-in for long, single-canvas scenes** (hero reveal, full-product 360, etc.) and for accessibility fallback (`prefers-reduced-motion: reduce` forces `scrub` with the timeline collapsed to instant transitions — see §6).

-----

## 1. Background: the three transition modes

|Mode     |Driver                                                                         |Frame playback                                                              |Feels like                                     |Default?                     |
|---------|-------------------------------------------------------------------------------|----------------------------------------------------------------------------|-----------------------------------------------|-----------------------------|
|`scrub`  |Native scroll position via `ScrollTrigger({ scrub })`                          |`tl.progress = scrollProgress`                                              |Free, continuous, “Apple-y”                    |No — opt-in for hero scenes  |
|`snap`   |Native scroll + `snap: "labelsDirectional"`                                    |Scrubbed continuously, settles to nearest label                             |Apple AirPods Pro page (scrub + magnetic stops)|No — opt-in for hybrid scenes|
|`section`|GSAP `Observer` intercepts wheel/touch/key; native scroll disabled while pinned|Each scene’s timeline plays on gesture via `gsap.to(playhead, { duration })`|fullPage.js / Keynote slide deck               |**YES, NEW DEFAULT**         |

The fundamental tension Eli identified is real: **frame-scrubbing wants scroll position to drive the playhead; presentation feel wants discrete gestures to drive the playhead.** The resolution is to detach the playhead from scroll position when in `section` mode and instead animate the playhead with a tween. The image-sequence canvas does not care where the playhead comes from — `ImageSequence.tsx` just needs to subscribe to a `frame` value.

-----

## 2. ScrollTrigger `snap` configuration — full reference

Authoritative shape from `types/scroll-trigger.d.ts`:

```ts
interface SnapVars {
  snapTo?: number | number[] | "labels" | "labelsDirectional" | SnapFunc;
  duration?: number | { min: number; max: number };
  delay?: number;        // seconds to wait after last scroll event before snapping
  ease?: string | gsap.EaseFunction;   // default "power3"
  inertia?: boolean;     // default true — honors current scroll velocity
  directional?: boolean; // default true — only snap in the direction of travel
  onInterrupt?: Callback;
  onStart?: Callback;
  onComplete?: Callback;
}
```

Key behaviors:

- `snap: 1 / (sections - 1)` — snaps to evenly-spaced progress points. Use for horizontal panel sliders where all panels are equal width.
- `snap: [0, 0.25, 0.6, 1]` — snap to specific progress values.
- `snap: "labels"` — snap to the closest GSAP timeline label (requires a label-tagged timeline). Use when scene boundaries are inside a timeline.
- `snap: "labelsDirectional"` — **prefer this for our pipeline.** It snaps to the *next* label in the scroll direction rather than the closest, so a small downward nudge near the end of a scene reliably advances to the next scene (rather than snapping back if you’re less than 50% through). Per the official `labelsDirectional` CodePen (GreenSock pen `GRjwPgx`): *“It snaps to the sections based on which direction you’re scrolling whereas the typical snap: ‘labels’ would require you to drag past halfway to snap to the next section.”* 
- `snap: (progress, self) => …` — custom function (e.g., `ScrollTrigger.snapDirectional()` of an array of trigger.start ratios — see GreenSock CodePen `qBXpMbP`).
- `duration: { min: 0.2, max: 3 }` — the snap tween auto-scales between these bounds based on scroll velocity.
- `inertia: false` disables velocity-based projection and snaps to the absolute closest point (fixes the “feels like overshoot” complaint on Mac trackpads).
- `onSnapComplete` is the right hook for things like “fire scene-entered analytics event.”

**Important: snap can coexist with `scrub`.** That’s the whole point of the `snap` mode in our schema. The animation scrubs continuously, then settles to the nearest label when the user stops scrolling. From the official ScrollTrigger documentation (gsap.com/docs/v3/Plugins/ScrollTrigger/, under “Is ScrollTrigger scroll-jacking?”): *“The closest thing to ‘scroll-jacking’ would be the [optional] snapping behavior but even that merely animates the native scroll position and it automatically relinquishes control the moment the user attempts to scroll.”* 

-----

## 3. The Observer-based section pattern (NEW DEFAULT)

This is the pattern from the canonical GreenSock CodePen `XWzRraJ` (Animated Sections, vertical), adapted for our image-sequence pipeline. It is **not** ScrollTrigger snap — it disables native scroll inside the stage and uses `Observer` to count discrete gestures.

### Anatomy (vanilla, condensed from `XWzRraJ`)

```js
gsap.registerPlugin(Observer);

let sections     = document.querySelectorAll("section"),
    outerWraps   = gsap.utils.toArray(".outer"),
    innerWraps   = gsap.utils.toArray(".inner"),
    currentIndex = -1,
    wrap         = gsap.utils.wrap(0, sections.length),
    animating;

gsap.set(outerWraps, { yPercent: 100 });
gsap.set(innerWraps, { yPercent: -100 });

function gotoSection(index, direction) {
  index = wrap(index);
  animating = true;
  const dFactor = direction === -1 ? -1 : 1;
  const tl = gsap.timeline({
    defaults: { duration: 1.25, ease: "power1.inOut" },
    onComplete: () => animating = false,
  });
  if (currentIndex >= 0) {
    gsap.set(sections[currentIndex], { zIndex: 0 });
    tl.to(images[currentIndex], { yPercent: -15 * dFactor })
      .set(sections[currentIndex], { autoAlpha: 0 });
  }
  gsap.set(sections[index], { autoAlpha: 1, zIndex: 1 });
  tl.fromTo(
    [outerWraps[index], innerWraps[index]],
    { yPercent: i => i ? -100 * dFactor : 100 * dFactor },
    { yPercent: 0 }, 0,
  );
  currentIndex = index;
}

Observer.create({
  type: "wheel,touch,pointer",
  wheelSpeed: -1,
  onDown: () => !animating && gotoSection(currentIndex - 1, -1),
  onUp:   () => !animating && gotoSection(currentIndex + 1,  1),
  tolerance: 10,
  preventDefault: true,
});

gotoSection(0, 1);
```

Key knobs (all defaults from the canonical demo):

- `tolerance: 10` — ignore < 10px gestures (prevents accidental advances on Mac trackpads). 
- `wheelSpeed: -1` — inverts wheel delta so wheel-down advances forward; aligns with the “natural scrolling” mental model. 
- `preventDefault: true` — stops native scroll while the stage is active.
- `animating` flag — gestures during a transition are dropped (not queued). This is the right behavior — queuing creates the “scroll fatigue” NN/g warns about. Sara Paul writes in “Scrolljacking 101” (August 6, 2023): *“a too-slow scroll rate means they could experience scroll fatigue”*  (nngroup.com/articles/scrolljacking-101/).
- `gsap.utils.wrap(0, sections.length)` — wraps indices end-to-start. To make the last/first sections terminal (linear narrative), **clamp instead**: `Math.max(0, Math.min(index, sections.length - 1))`. Expose as `wrapEnabled` in our schema.

### Integrating the frame-sequence canvas

The canonical demo only animates clip-path wrappers. For our pipeline, each `gotoScene(index, direction)` call must also drive the **per-scene image-sequence playhead** as a tween:

```ts
function gotoScene(index, direction) {
  index = clampOrWrap(index);
  animating = true;
  const scene = scenes[index];                   // from Zod config
  const dFactor = direction === -1 ? -1 : 1;
  const dur = scene.transition.duration ?? globalTransition.duration ?? 1.0;
  const ease = scene.transition.ease ?? globalTransition.ease ?? "power2.inOut";

  const tl = gsap.timeline({
    defaults: { duration: dur, ease },
    onComplete: () => { animating = false; lastIndex = index; },
  });

  // 1. Drive the canvas image-sequence playhead from prevFrame → scene.endFrame
  tl.to(playhead, {
    frame: direction === 1 ? scene.endFrame : scene.startFrame,
    duration: dur, ease,
    onUpdate: () => imageSequence.drawFrame(Math.round(playhead.frame)),
  }, 0);

  // 2. Run the per-scene overlay timeline in parallel (text in/out, masks, etc.)
  tl.add(buildOverlayTimeline(scene, dFactor), 0);

  // 3. Cross-fade outgoing scene's overlays
  if (lastIndex !== null) {
    tl.to(overlayRefs[lastIndex].current, { autoAlpha: 0, duration: dur * 0.5 }, 0);
  }
  currentIndex = index;
}
```

This is the heart of the architectural decision: **the playhead is a plain JS number that GSAP tweens.** The canvas draw call is identical to today’s `ImageSequence.tsx` — it just reads from `playhead.frame` instead of `scrollTrigger.progress * frameCount`.

-----

## 4. Decision matrix: which mode for which scene?

|Scene type                                                         |Recommended mode                  |Why                                                              |
|-------------------------------------------------------------------|----------------------------------|-----------------------------------------------------------------|
|Hero “product spins in from black”                                 |`section` (default)               |One bold gesture, full reveal                                    |
|Product feature breakdown (5 callouts)                             |`section` (default)               |Each callout = one snap unit; matches Eli’s “presentation” intent|
|Long 360 turntable (60+ frames, exploration)                       |`scrub`                           |User wants to inspect, free-scrub feels right                    |
|Apple AirPods Pro hero (continuous scrub but stops on text moments)|`snap` (scrub + labelsDirectional)|The AirPods hero is exactly this hybrid                          |
|Final CTA / “scroll to read more”                                  |none (native scroll resumes)      |Don’t trap the user at the bottom                                |

The agent pipeline should pick mode per scene; default to `section` if NarrativeDesigner doesn’t specify.

-----

## 5. Lenis integration

### The conflict (documented)

darkroom-engineering/lenis issue [#389](https://github.com/darkroomengineering/lenis/issues/389), filed by DominickVale on Oct 1, 2024: when Lenis smooth scroll is combined with ScrollTrigger `snap`, *“to go down you only have to scroll a small percentage of the wheel. Whereas to go up you need a full scroll, basically you need to land almost on the snap point. … Removing lenis solves the snapping issue.”*  The asymmetry comes from Lenis’s inertia continuing to feed scroll deltas into ScrollTrigger after the user has stopped, fighting the snap tween.

### Rules per mode

|Mode     |Lenis?                                                                      |Why                                                                                                                                             |
|---------|----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------|
|`scrub`  |**Yes** — keep current Lenis setup, well-tested combo                       |Smooth scroll improves the scrub feel                                                                                                           |
|`snap`   |**Yes, but** swap ScrollTrigger snap for the Lenis Snap addon (`lenis/snap`)|Avoids issue #389 asymmetry                                                                                                                     |
|`section`|**No — disable Lenis while the stage is pinned**                            |Observer’s `preventDefault: true` already kills native scroll; Lenis on top is overhead with no benefit and causes touch event quirks on iOS<16 |

### Recommended global hook (`lib/lenis.ts`)

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

// Pause Lenis when entering a section-mode stage:
export function pauseLenisForSection(lenis: Lenis) {
  lenis.stop();                    // stops the smooth-scroll loop
  return () => lenis.start();      // restore on stage exit
}
```

### Using the Lenis Snap addon (alternative path for `snap` mode)

Lenis ships `lenis/snap` as a sibling package. The full documented API (from `github.com/darkroomengineering/lenis/blob/main/packages/snap/README.md`):

```ts
import Snap from "lenis/snap";

const snap = new Snap(lenis, {
  type: "mandatory",          // "proximity" (default) | "mandatory" | "lock"
  distanceThreshold: "50%",   // string|number, ignored when type === "mandatory"
  debounce: 500,              // ms after last scroll event (default 500)
  // duration, easing, lerp inherit from Lenis by default
  onSnapStart: () => {},
  onSnapComplete: () => {},
});

snap.addElements(document.querySelectorAll(".scene"), { align: "start" });
// Imperative API: add(value), addElement(el, opts), addElements(els, opts),
//                 next(), previous(), goTo(index),
//                 start(), stop(), resize()
```

`type: "lock"` is the closest analog to fullPage.js (one gesture = one section); `type: "mandatory"` is the closest analog to CSS `scroll-snap-type: mandatory`.   Element `align` accepts `"start" | "center" | "end"` or an array like `["start", "end"]`.  Use `lenis/snap` instead of ScrollTrigger snap when you want Lenis to own the snapping (cleaner for the `snap` mode; avoids the #389 asymmetry).

-----

## 6. Accessibility & UX

### Hard requirements (must implement before merge)

1. **`prefers-reduced-motion: reduce` → collapse transition duration to ~0 and skip `Observer.preventDefault`**, allowing native scroll. Equivalent to fullPage.js’s `autoScrolling: false`.
   
   ```ts
   const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   const effectiveMode = reducedMotion ? "scrub-instant" : config.transition.mode;
   ```
1. **Keyboard navigation in `section` mode** — Observer’s `type` does *not* include keyboard. Add a separate listener:
   
   ```ts
   const onKey = (e: KeyboardEvent) => {
     if (animating) return;
     if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
       e.preventDefault(); gotoScene(currentIndex + 1, 1);
     } else if (e.key === "ArrowUp" || e.key === "PageUp") {
       e.preventDefault(); gotoScene(currentIndex - 1, -1);
     } else if (e.key === "Home") { gotoScene(0, -1); }
     else if (e.key === "End")    { gotoScene(scenes.length - 1, 1); }
   };
   window.addEventListener("keydown", onKey);
   ```
1. **Skip-to-content link** for screen readers — render the full narrative content semantically beneath the canvas stage at all times; the visual stage is a progressive enhancement layered on top.
1. **Pagination dots** (`<nav aria-label="scene navigation">` with one `<button>` per scene, current scene gets `aria-current="step"`) — these are *required*, not optional, for full-page snap UX. They double as direct-jump anchors. SitePoint’s “Scrolljacking and Accessibility” review specifically called out Apple’s iPhone 5C demo for getting this right via tab-through anchors. 
1. **Mobile touch tolerance** — set `tolerance: 20` on phones (default 10 fires too eagerly with thumb scrolls). Use `matchMedia` to swap. Also call `ScrollTrigger.normalizeScroll(true)` on touch devices to dodge the iOS Safari address-bar collapse glitch.

### NN/g caveats — when scroll-jacking is OK

NN/g’s “Scrolljacking 101” (Sara Paul, August 6, 2023) explicitly identifies the use case where it’s *appropriate*: *“Scrolljacking is used to break down complex or information-dense topics and visuals into digestible chunks. For example, in the above example of the Apple Watch Ultra, the scrolljack enables a granular, step-by-step visual breakdown of eight physical features on the watch.”*  That’s exactly our pipeline’s use case (product/feature scrollytelling). The harmful uses are content-dense reading pages and sites where users came to skim. **Rule of thumb: if the page has more text than imagery, do not use `section` mode.**

### Soft requirements (nice to have)

- Visible scroll-progress indicator (vertical bar with scene markers) reassures users that “scroll still works.”
- Persist scene index in URL hash (`#scene-3`) so deep-linking and back-button work.
- Honor system “natural scrolling” direction; expose `wheelSpeed: -1 | 1` as a per-deployment knob.

-----

## 7. Zod schema additions

Append to `lib/schemas/scene.ts`:

```ts
import { z } from "zod";

export const TransitionMode = z.enum(["scrub", "snap", "section"]);

export const EaseId = z.enum([
  "none", "power1.inOut", "power2.inOut", "power2.out",
  "power3.inOut", "power4.inOut", "expo.inOut", "circ.inOut",
]);

export const TransitionConfig = z.object({
  mode: TransitionMode.default("section"),          // ← NEW DEFAULT
  duration: z.number().min(0).max(5).default(1.0),  // seconds for section/snap tween
  ease: EaseId.default("power2.inOut"),
  directional: z.boolean().default(true),           // labelsDirectional vs labels
  inertia: z.boolean().default(true),               // snap mode: honor scroll velocity
  // Section-mode-only:
  wrapEnabled: z.boolean().default(false),          // wrap-around at first/last
  tolerance: z.number().int().min(1).max(200).default(10),
  showPagination: z.boolean().default(true),
  enableKeyboard: z.boolean().default(true),
  // Snap-mode-only:
  snapDelay: z.number().min(0).max(2).default(0.1), // ScrollTrigger snap.delay
  snapDurationMin: z.number().default(0.2),
  snapDurationMax: z.number().default(1.5),
});

export const SceneConfig = z.object({
  id: z.string(),
  label: z.string(),
  startFrame: z.number().int(),
  endFrame: z.number().int(),
  imageSequence: z.object({
    pattern: z.string(),    // e.g. "/frames/hero/{idx:0000}.jpg"
    frameCount: z.number().int(),
  }),
  overlays: z.array(OverlayConfig).default([]),
  // Per-scene override; falls back to global if undefined:
  transition: TransitionConfig.partial().optional(),
});

export const StorySchema = z.object({
  meta: z.object({ title: z.string(), slug: z.string() }),
  transition: TransitionConfig,                     // global defaults
  scenes: z.array(SceneConfig).min(1),
  pauseLenisInSection: z.boolean().default(true),
  reducedMotionFallback: z.enum(["disable", "scrub-instant", "static"])
                          .default("scrub-instant"),
})
.superRefine((s, ctx) => {
  // Frame continuity: when in section mode, adjacent scenes should share frame boundary
  if (s.transition.mode === "section") {
    for (let i = 0; i < s.scenes.length - 1; i++) {
      if (s.scenes[i].endFrame !== s.scenes[i + 1].startFrame) {
        ctx.addIssue({
          code: "custom",
          path: ["scenes", i + 1, "startFrame"],
          message: `Section-mode scenes must be frame-contiguous (scene ${i}.endFrame !== scene ${i+1}.startFrame)`,
        });
      }
    }
  }
});
```

Key design choices:

- **Global `transition` is required, per-scene `transition` is `.partial().optional()`.** Common case (uniform feel across scenes) is one-line; per-scene overrides still work.
- **`mode` defaults to `"section"`** — this is the behavior change Eli asked for.
- **Snap points map to scene boundaries.** Within-scene overlay reveal points are *not* snap points; they animate inside the scene’s timeline. For sub-scene snapping (rare), promote that overlay to its own scene.
- The `superRefine` enforces frame continuity in `section` mode — without it, reverse-scrolling will jump frames visibly.

-----

## 8. React + useGSAP code patterns

### Pattern A — Section mode (default, drop-in replacement for current `ScrollStage.tsx`)

```tsx
"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { useGSAP } from "@gsap/react";
import { ImageSequenceCanvas, type Playhead } from "@/components/ImageSequence";
import type { StorySchema } from "@/lib/schemas/scene";
import { useLenis } from "@/lib/lenis-context";

gsap.registerPlugin(Observer, useGSAP);

export function SectionStage({ story }: { story: StorySchema }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const playhead = useRef<Playhead>({ frame: story.scenes[0].startFrame });
  const indexRef = useRef(-1);
  const animatingRef = useRef(false);
  const lenis = useLenis();

  useGSAP(() => {
    const t = story.transition;
    const reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (story.pauseLenisInSection) lenis?.stop();

    const clamp = (i: number) =>
      t.wrapEnabled
        ? gsap.utils.wrap(0, story.scenes.length)(i)
        : Math.max(0, Math.min(i, story.scenes.length - 1));

    const gotoScene = (i: number, dir: 1 | -1) => {
      i = clamp(i);
      if (i === indexRef.current) return;
      animatingRef.current = true;
      const scene = story.scenes[i];
      const sceneT = { ...t, ...scene.transition };
      const dur = reducedMotion ? 0.01 : sceneT.duration;

      const tl = gsap.timeline({
        defaults: { duration: dur, ease: sceneT.ease },
        onComplete: () => { animatingRef.current = false; },
      });

      // Frame playhead
      tl.to(playhead.current, {
        frame: dir === 1 ? scene.endFrame : scene.startFrame,
        ease: sceneT.ease, duration: dur,
      }, 0);

      // Overlay cross-fade
      if (indexRef.current >= 0) {
        tl.to(overlayRefs.current[indexRef.current], { autoAlpha: 0 }, 0);
      }
      tl.to(overlayRefs.current[i], { autoAlpha: 1 }, 0);

      indexRef.current = i;
    };

    const obs = Observer.create({
      target: stageRef.current!,
      type: "wheel,touch,pointer",
      wheelSpeed: -1,
      tolerance: t.tolerance,
      preventDefault: !reducedMotion,
      onDown: () => !animatingRef.current && gotoScene(indexRef.current - 1, -1),
      onUp:   () => !animatingRef.current && gotoScene(indexRef.current + 1,  1),
    });

    const onKey = (e: KeyboardEvent) => {
      if (!t.enableKeyboard || animatingRef.current) return;
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault(); gotoScene(indexRef.current + 1, 1);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault(); gotoScene(indexRef.current - 1, -1);
      } else if (e.key === "Home") gotoScene(0, -1);
      else if (e.key === "End")    gotoScene(story.scenes.length - 1, 1);
    };
    window.addEventListener("keydown", onKey);

    gotoScene(0, 1);

    return () => {
      obs.kill();
      window.removeEventListener("keydown", onKey);
      if (story.pauseLenisInSection) lenis?.start();
    };
  }, { scope: stageRef, dependencies: [story] });

  return (
    <div ref={stageRef} className="relative h-screen w-screen overflow-hidden">
      <ImageSequenceCanvas
        playhead={playhead}
        pattern={story.scenes[0].imageSequence.pattern}
        frameCount={story.scenes.reduce((m, s) => Math.max(m, s.imageSequence.frameCount), 0)}
      />
      {story.scenes.map((s, i) => (
        <div
          key={s.id}
          ref={(el) => { overlayRefs.current[i] = el; }}
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0 }}
          aria-hidden={indexRef.current !== i}
        >
          {/* render scene.overlays */}
        </div>
      ))}
      <Pagination scenes={story.scenes} currentIndex={indexRef.current} />
    </div>
  );
}
```

### Pattern B — Snap mode (scrub + labelsDirectional, hybrid)

```tsx
useGSAP(() => {
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stageRef.current!,
      pin: true,
      start: "top top",
      end: () => `+=${story.scenes.length * window.innerHeight * 1.2}`,
      scrub: 1,
      snap: {
        snapTo: "labelsDirectional",
        duration: { min: t.snapDurationMin, max: t.snapDurationMax },
        delay: t.snapDelay,
        ease: t.ease,
        directional: t.directional,
        inertia: t.inertia,
      },
      invalidateOnRefresh: true,
    },
  });

  story.scenes.forEach((scene, i) => {
    tl.addLabel(scene.id, i);                          // one label per scene
    tl.to(playhead.current, {
      frame: scene.endFrame,
      ease: "none",
      duration: 1,
      onUpdate: () => imageSeqRef.current?.draw(Math.round(playhead.current.frame)),
    }, i);
    tl.add(buildOverlayTimeline(scene, overlayRefs.current[i]), i);
  });
  tl.addLabel("end", story.scenes.length);
}, { scope: stageRef, dependencies: [story] });
```

### Pattern C — `ImageSequence.tsx` modification

The existing component currently subscribes to a `ScrollTrigger` progress. Refactor to a **playhead-agnostic** API:

```tsx
export interface Playhead { frame: number; }

export function ImageSequenceCanvas({
  playhead,
  pattern,
  frameCount,
}: { playhead: MutableRefObject<Playhead>; pattern: string; frameCount: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const images = useRef<HTMLImageElement[]>([]);

  useGSAP(() => {
    // preload (existing logic stays)
    const ctx = canvasRef.current!.getContext("2d")!;
    const draw = () => {
      const idx = Math.max(0, Math.min(frameCount - 1, Math.round(playhead.current.frame)));
      const img = images.current[idx];
      if (img?.complete) ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);
    };
    // Drive draw from GSAP ticker — works for BOTH scrub-driven and tween-driven playheads
    gsap.ticker.add(draw);
    return () => gsap.ticker.remove(draw);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
}
```

**This is the critical refactor.** Decoupling from `ScrollTrigger.progress` to a ref-based `playhead` lets the same canvas serve all three transition modes.

-----

## 9. Sprint plan deltas

Insert/modify in `ScrollyTelling_sprint.md`:

### Phase 2 (Canvas Engine) — modify

- **Task 2.4** (renamed): “Refactor `ImageSequenceCanvas` to playhead-ref API” — was previously “ScrollTrigger-bound canvas.” Acceptance: same canvas component works with both ScrollTrigger-driven and tween-driven playheads.

### Phase 3 (Scene Composition) — insert before “Overlay timing”

- **Task 3.0 (NEW): Transition mode selection.** Implement `SectionStage`, `SnapStage`, `ScrubStage` as three React components behind a single `<Stage story={…} />` switcher keyed on `story.transition.mode`. Default is `SectionStage`.
- **Task 3.1**: Overlay timelines must be **mode-aware**:
  - In `section` and `snap` modes, overlays are positioned by absolute time within the scene’s timeline (e.g., `tl.from(overlay, { y: 40 }, 0.2)`).
  - In `scrub` mode, overlays are positioned by ScrollTrigger progress fraction.
  - The NarrativeDesigner agent should output `enterAt: number /* 0–1 */, exitAt: number` and the composer multiplies by scene duration in section/snap mode.

### Phase 4 (Smoothing & Polish) — modify

- **Task 4.1**: Lenis init now reads `story.pauseLenisInSection`. Add `LenisContext` with `stop()`/`start()` exposed.
- **Task 4.3 (NEW)**: Pagination component, keyboard handler, `prefers-reduced-motion` fallback, `aria-current` wiring, `ScrollTrigger.normalizeScroll(true)` on touch.

### Phase 5 (Validation) — add

- Add tests: `transition.mode` defaults to `"section"`; per-scene override merges shallowly; reduced-motion users get a working static page; `superRefine` rejects non-contiguous frames in section mode.
- Manual QA matrix: trackpad (Mac), mouse wheel (Win), iPad swipe, iPhone Safari, keyboard-only, VoiceOver, JAWS.

-----

## 10. Copilot vs Claude Code task split

|Task                                               |Tool           |Rationale                                                                                                                                  |
|---------------------------------------------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------|
|Schema additions (§7)                              |**Copilot**    |Mechanical Zod work, documented patterns                                                                                                   |
|`ImageSequenceCanvas` playhead refactor (Pattern C)|**Copilot**    |Local refactor, clear acceptance                                                                                                           |
|`SectionStage` component (Pattern A)               |**Claude Code**|Cross-cutting: Observer + Lenis pause + keyboard + a11y; many interaction points where the official demo’s exact behavior must be preserved|
|`SnapStage` component (Pattern B)                  |**Copilot**    |Direct adaptation of documented `snap: "labelsDirectional"` pattern                                                                        |
|Lenis pause/resume hook integration                |**Claude Code**|Subtle bug surface (Lenis #389), needs judgment                                                                                            |
|Pagination dots + `aria-current`                   |**Copilot**    |Standard a11y pattern                                                                                                                      |
|Reduced-motion fallback wiring                     |**Claude Code**|Has to reason about which mode degrades to what                                                                                            |
|Decision: which mode each existing demo scene uses |**Claude Code**|Architectural                                                                                                                              |
|Boilerplate ScrollTrigger snap config copy-paste   |**Copilot**    |Documented                                                                                                                                 |
|Touch tolerance / `normalizeScroll(true)` tuning   |**Claude Code**|Empirical, device-dependent                                                                                                                |

**Rule: Claude Code owns the mode boundary and a11y. Copilot owns the GSAP boilerplate inside each mode.**

-----

## 11. Agent pipeline implications

- **NarrativeDesigner** should now output, per scene: `mode?: "scrub" | "snap" | "section"` plus `duration?: number`. If omitted, inherits the story’s global `transition`.
- **NarrativeDesigner** should express overlay timing as **normalized 0–1 within the scene**, never in absolute seconds and never in scroll pixels. The composer converts to seconds (section/snap) or progress fraction (scrub) at render time.
- **SceneComposer** must validate that, in `section` mode, no two scenes share the same key visual frame range — because the user only sees `endFrame` of the previous scene if they reverse-scroll out of the next one; abrupt frame jumps look broken. The `superRefine` in §7 enforces `scenes[i].endFrame === scenes[i+1].startFrame`.
- **NarrativeDesigner** should emit a `transitionRationale: string` per scene explaining why this mode was chosen — useful for review and for the agent self-critique loop.
- **NarrativeDesigner** should err on the side of fewer scenes with `section` mode (5–7 max for a product page); each scene is a discrete gesture and beyond ~7 the user starts feeling trapped.

-----

## 12. Key references

- ScrollTrigger snap docs: `gsap.com/docs/v3/Plugins/ScrollTrigger/` (search “snap”)
- `SnapVars` TypeScript definition: `github.com/greensock/GSAP/blob/master/types/scroll-trigger.d.ts`
- Observer plugin docs: `gsap.com/docs/v3/Plugins/Observer/`
- Canonical Observer “Animated Sections” demo (vertical): `codepen.io/GreenSock/pen/XWzRraJ`
- `labelsDirectional` snap demo: `codepen.io/GreenSock/pen/GRjwPgx`
- Directional snap via `snapDirectional()`: `codepen.io/GreenSock/pen/qBXpMbP`
- Full-page snap via ScrollTrigger + ScrollTo (no Observer): `codepen.io/urbgimtam/pen/XWXdypQ`
- Mixed scrub + Observer (one section “intercepts” inside a normal page): `codepen.io/GreenSock/pen/ExEOeJQ`
- Lenis Snap addon README: `github.com/darkroomengineering/lenis/blob/main/packages/snap/README.md`
- Lenis + ScrollTrigger snap issue (DominickVale, Oct 2024): `github.com/darkroomengineering/lenis/issues/389`
- NN/g “Scrolljacking 101” (Sara Paul, Aug 6, 2023): `nngroup.com/articles/scrolljacking-101/`
- Apple AirPods Pro original reference: CSS-Tricks, “Let’s Make One of Those Fancy Scrolling Animations Used on Apple Product Pages” — `css-tricks.com/lets-make-one-of-those-fancy-scrolling-animations-used-on-apple-product-pages/`
- SitePoint “Scrolljacking and Accessibility”: `sitepoint.com/scrolljacking-accessibility/`
- Chrome for Developers / NRK case study on accessible scroll-driven animations: `developer.chrome.com/blog/nrk-casestudy`

— end addendum —
