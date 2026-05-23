---
name: gsap
description: "GSAP patterns for EasyDeck — ScrollTrigger, Observer, useGSAP, Lenis sync, and playhead-driven canvas. Use whenever touching SectionStage, SnapStage, ScrubStage, ImageSequenceCanvas, or any scroll animation in this repo."
---

# GSAP — EasyDeck Patterns

GSAP 3.x + ScrollTrigger + Observer as used in this codebase.

## Registration (always required)

```typescript
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Observer, ScrollTrigger);
}
```

## Playhead Contract

`ImageSequenceCanvas` reads `playhead.current.frame` on every GSAP ticker tick.
All stages tween this value — never replace the ref object, only mutate `.frame`.

```typescript
// ✅ Correct — tween the property
gsap.to(playhead.current, { frame: targetFrame, duration, ease });

// ❌ Wrong — replacing the ref
playhead.current = { frame: targetFrame };
```

## Section Mode (Observer)

```typescript
// src/components/SectionStage.tsx
const observer = Observer.create({
  target: containerRef.current ?? window,
  type: "wheel,touch,pointer",
  wheelSpeed: -1,
  tolerance: transition.tolerance,
  preventDefault: true,
  onDown: () => gotoScene(currentIndexRef.current - 1, -1),
  onUp:   () => gotoScene(currentIndexRef.current + 1, 1),
});
return () => observer.kill();

// gotoScene: timeline tweens playhead + cross-fades overlays
const tl = gsap.timeline({ onComplete: () => { animating.current = false; } });
tl.to(playhead.current, { frame: targetFrame, duration, ease: transition.ease });
```

Key rules:
- `animating` ref = gesture lock while transitioning
- Lenis MUST be paused via `useLenisPause()` in `src/lib/lenis/useLenisPause.ts`
- Frame continuity: `scenes[i].endFrame === scenes[i+1].startFrame` (Zod enforces)

## Snap Mode (ScrollTrigger + labelsDirectional)

```typescript
ScrollTrigger.create({
  trigger: containerRef.current,
  start: "top top",
  end: `+=${totalFrames * pixelsPerFrame}`,
  scrub: 1,
  snap: { snapTo: "labelsDirectional", duration: { min: 0.2, max: 0.5 }, ease: "power1.inOut" },
  onUpdate: (st) => {
    playhead.current.frame = Math.round(st.progress * totalFrames);
  },
});
```

## Scrub Mode (pure ScrollTrigger)

```typescript
ScrollTrigger.create({
  trigger: containerRef.current,
  start: "top top",
  end: `+=${totalFrames * pixelsPerFrame}`,
  scrub: true,
  onUpdate: (st) => {
    playhead.current.frame = Math.round(st.progress * totalFrames);
  },
});
```

## GSAP Ticker Draw Loop (ImageSequenceCanvas)

```typescript
// src/components/ImageSequenceCanvas.tsx
const draw = () => {
  const frameIdx = clampFrame(playhead.current.frame, frameCount);
  if (frameIdx === lastDrawnFrame.current) return;
  const img = imagesRef.current[frameIdx];
  if (img) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    lastDrawnFrame.current = frameIdx;
  }
};
gsap.ticker.add(draw);
return () => gsap.ticker.remove(draw);
```

## Lenis ↔ ScrollTrigger Sync

```typescript
// src/lib/lenis/useLenisScrollTriggerSync.ts
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

Mode rules:
- `section` → `lenis.stop()` on mount, `lenis.start()` on unmount
- `snap` / `scrub` → keep Lenis active with the sync above

## Reduced Motion

```typescript
const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
const duration = mq.matches ? 0.01 : transition.duration;
```

## Cleanup (always)

```typescript
return () => {
  tl.kill();
  observer.kill();
  ScrollTrigger.getAll().forEach(t => t.kill());
};
```

## Anti-Patterns

```typescript
// ❌ Animate layout properties — transforms/opacity only
gsap.to(el, { left: 100, width: 200 });

// ❌ Skip cleanup
useEffect(() => { gsap.to(el, { x: 100 }); }, []); // no return = memory leak

// ❌ ScrollTrigger outside useEffect / useGSAP
```
