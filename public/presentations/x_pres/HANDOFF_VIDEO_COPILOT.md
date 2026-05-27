# HANDOFF: Video Mode + Cinematic Transitions — x_pres
**Date:** 2026-05-26  
**Branch:** `master` — commit `76055f9`  
**Author:** Claude Sonnet 4.6 (via Claude Code)

---

## What Was Built

The x_pres intelligence briefing presentation (`/presentations/x_pres`) now has a **full video mode** that replaces static WebP background images with looping MP4 videos, plus **three distinct cinematic transition systems** selectable at runtime. Everything is live on GitHub Pages.

---

## User-Facing Changes

### New Controls (top-right pill cluster)

The existing two pills (scroll mode, language) now have two additions:

| Pill | Options | Behavior |
|---|---|---|
| **3rd pill** | 🖼 / 🎬 | Toggles image vs. video backgrounds |
| **4th pill** | A / B / C | Selects transition style (only visible in video mode) |

### Video Mode (🎬)
- Each of the 14 scenes now plays a looping MP4 video as its background instead of a static WebP frame
- Videos loop silently and continuously; they do not interrupt navigation
- Fallback: if a video fails to load, the static image is still there in the scene data

### Transition Versions (A / B / C)
All three run at 60fps and respect `prefers-reduced-motion` (collapse to a simple crossfade).

**A — Dead Drop** (1.2s): A cyan scan beam sweeps top→bottom, dividing the outgoing scene (above, degrading with chromatic aberration) from the incoming scene (below, printing in). Coordinate readout scrambles from hex noise to the scene's data line. Ends with an 80ms warm amber film flare.

**B — Orbital Descent** (1.4s): CSS 3D perspective at `1200px`. The current scene floors away at `translateZ(-1800px) rotateX(-12deg)`. The next scene rushes in from `translateZ(-3000px)`. Eight parallax motes streak past at different Z speeds. Camera bounce on settle. HUD label scrambles through random chars before resolving.

**C — Consensus Lock** (1.8s): A `requestAnimationFrame` canvas loop runs 600 typed-array particles across five phases — Perlin noise drift → three radar arcs triangulate → force-directed convergence toward anchor → crosshair lock flash → particle re-assembly. The slowest and most cinematic; use it sparingly.

---

## New Files

```
src/app/presentations/x_pres/
├── VideoBackground.tsx              # Dual <video> substrate (prev + current)
├── lib/
│   ├── particles.ts                 # Typed-array particle engine + inline 2D simplex noise
│   └── glyphAtlas.ts                # Offscreen-canvas glyph pre-render (hex + Katakana)
└── transitions/
    ├── types.ts                     # Shared VideoTransitionProps / SceneData interface
    ├── DeadDropTransition.tsx       # Version A
    ├── OrbitalTransition.tsx        # Version B
    └── ConsensusTransition.tsx      # Version C
```

## Modified Files

| File | What changed |
|---|---|
| `page.tsx` | Added `video?:` field to Scene interface + all 14 scene objects; added `mediaMode` + `transitionVersion` state; `doGsapTransition` now dispatches to `doVideoTransition` in video mode; new 3rd + 4th pills; lazy-imports all 3 transition components |
| `styles.css` | Added `.x-pres-video-bg`, `.x-pres-scanbeam`, `.x-pres-transition-canvas`, `.x-pres-orbital-stage`, `.x-pres-version-pill`, `.x-pres-version-btn` |

## New Assets

```
public/presentations/x_pres/videos/
├── 1.mp4    → Scene 1  (THE APPROACHING THREAT)
├── 2.mp4    → Scene 2  (THE COMMAND CENTER AWAKENS)
├── 3.mp4    → Scene 3  (INTEL RESEARCH SOFTWARE)
├── 4.mp4    → Scene 4  (COMMAND DECISION)
├── 5.mp4    → Scene 5  (DRONES DISPATCHED)
├── 6.mp4    → Scene 6  (CYBER ATTACK DETECTED)
├── 7.mp4    → Scene 7  (DEFENSIVE PLAYBOOK ACTIVATED)
├── 8.mp4    → Scene 8  (TARGET ACQUIRED)
├── 9.mp4    → Scene 9  (TARGET SURRENDERS)
├── 10.mp4   → Scene 10 (AI INVESTIGATION FRAMEWORK)
├── 11.mp4   → Scene 11 (AI FINDINGS DASHBOARD)
├── 12.mp4   → Scene 12 (RESPONSIBLE AI DEVELOPMENT)
└── 1.1.mp4  → Scene 13 (THANK YOU — ambient loop)
             (Scene 14 reuses 1.mp4)
```

---

## Architecture Notes (important for production)

### VideoBackground.tsx
- Renders two stacked `<video>` elements: `prev` (z-index 1, outgoing) and `current` (z-index 2, incoming)
- Exposes a `VideoBackgroundHandle` ref so transition components can read `.prevVideoEl` and `.currentVideoEl` as raw DOM elements
- **Dead Drop** directly mutates `video.style.clipPath` and `video.style.filter` on these elements during transitions — this is intentional and bypasses React for performance
- All style mutations are cleaned up on unmount

### Transition Dispatch Flow
```
user gesture / keyboard / autoplay
  → doGsapTransition(nextIndex, dir)
      ├─ image mode → doImageTransition()  (original GSAP logic, unchanged)
      └─ video mode → doVideoTransition()
            → sets activeTransition state → renders <DeadDrop|Orbital|Consensus>
                  ↓ at mid-point
            → onVideoSwitch() → setCurrentScene() + panel enter animation
                  ↓ at end
            → onComplete() → clears activeTransition, unlocks isTransitioningRef
```

### No New npm Dependencies
- `simplex-noise` was NOT added — a full 2D simplex noise is inlined in `particles.ts` (~70 lines, Gustavson's algorithm)
- `d3-delaunay` was NOT added — Voronoi hairlines in Consensus Lock rely on particle trails only
- Only uses: `gsap` (already installed), `framer-motion` (already installed), browser `requestAnimationFrame` + `canvas 2D API`

### Static Export Compatibility
All three transition components are marked `"use client"` and lazy-loaded via `React.lazy()` + `<Suspense>`. They produce no server-side output. The static export (`NEXT_OUTPUT=export npm run build`) completes cleanly.

---

## Production Deployment Checklist

The GitHub Actions workflow at `.github/workflows/deploy.yml` handles everything. It triggers on push to `master`.

**To deploy:**
```bash
# Already done in this session — master is current
# If you need to re-deploy from a clean state:
cd /opt/dept_pres
npm run type-check          # must be clean (it is)
npm test                    # 318/318 green (confirmed)
NEXT_OUTPUT=export npm run build
git push origin master
```

**Watch deploy:** https://github.com/Hundia/EasyDeck/actions  
**Live URL:** https://hundia.casa/presentations/x_pres

---

## Known Limitations / Future Work

1. **Videos are committed to git** — at ~5.5MB total this is fine for now, but if more videos are added consider Git LFS or a CDN. The `video.src` paths in `page.tsx` are relative public paths so swapping to absolute CDN URLs is a one-liner per scene.

2. **No video preloading** — videos start loading when the `<video>` element mounts. On slow connections the first frame may be black briefly. Add `<link rel="preload" as="video">` tags in `layout.tsx` for the first scene's video if this is a concern.

3. **Version C (Consensus Lock) on mobile** — the 600-particle canvas loop is intentionally lightweight but has not been profiled on low-end Android. If performance issues arise, reduce `N` in `particles.ts` from `600` to `300` and add `navigator.hardwareConcurrency < 4` detection to fall back to the reduced-motion path.

4. **Transition version is not persisted** — version A/B/C resets to A on page refresh. Add `localStorage.setItem("x-pres-transition", transitionVersion)` if persistence is needed (same pattern as the language toggle).

5. **Continuous scroll mode + video** — in continuous mode each scene renders its own independent `<video autoPlay loop>` element. This works but may cause high memory use with 14 simultaneous video decoders on low-RAM devices. Consider `IntersectionObserver`-based play/pause if this becomes an issue.

---

## Quick Verification After Deploy

```
1. Open https://hundia.casa/presentations/x_pres
2. Confirm image mode loads (scene 1, gold accent, static frame background)
3. Click 🎬 → background should switch to looping video
4. Click A → navigate scenes → scan beam + RGB split should fire
5. Click B → navigate → 3D Z-dive should fire  
6. Click C → navigate → particle canvas should fire (~1.8s)
7. Click 🖼 → confirm snap back to image mode, existing GSAP transitions unchanged
8. Test keyboard: ArrowDown / ArrowUp navigate correctly in all modes
```

---

*Authored by Claude Sonnet 4.6 via Claude Code on 2026-05-26*
