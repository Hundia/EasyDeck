# Sprint 5 Tasks

## Implementation Tasks

1. **Create `ScrubStage` component** — ScrollTrigger with `scrub: true`, NO snap config
   - Pattern follows SnapStage but removes snap entirely
   - Playhead driven by `self.progress * totalFrames`
   - Pin container, scrub: 1 (smooth)
   - File: `src/components/ScrubStage.tsx`

2. **Wire playhead to progress × totalFrames**
   - onUpdate callback: `playhead.current.frame = Math.round(self.progress * totalFrames)`
   - totalFrames = max endFrame across all scenes
   - No scene index tracking needed (continuous)

3. **Implement overlay positioning by progress fraction**
   - Each overlay has `enterAt`/`exitAt` (0-1 fraction within its scene)
   - Use timeline `fromTo` with autoAlpha at correct progress points
   - Same pattern as SnapStage overlays

4. **Create `<Stage story={...} />` switcher component**
   - File: `src/components/Stage.tsx`
   - Reads `story.transition.mode` and renders appropriate stage
   - Props: `{ story: StorySchema }`
   - Default mode: "section" (as per TransitionConfig default)

5. **Route to SectionStage/SnapStage/ScrubStage based on mode**
   - switch on `story.transition.mode`:
     - "section" → `<SectionStage story={story} />`
     - "snap" → `<SnapStage story={story} />`
     - "scrub" → `<ScrubStage story={story} />`

6. **Per-scene mode override support**
   - If scene has `transition.mode` override, Stage must handle mixed modes
   - For MVP: if ALL scenes share same override, use that mode
   - If mixed: fallback to story-level mode (document as known limitation)
   - Export utility: `resolveTransitionMode(story): TransitionMode`

7. **Unit tests: ScrubStage**
   - Renders without error
   - Creates ScrollTrigger with scrub: true and NO snap
   - Playhead updates on scroll progress
   - Overlays animate at correct progress points
   - Reduced motion: disable animations

8. **Unit tests: Stage switcher**
   - Routes to SectionStage for mode="section"
   - Routes to SnapStage for mode="snap"
   - Routes to ScrubStage for mode="scrub"
   - Default mode routes to SectionStage
   - resolveTransitionMode utility works correctly

9. **Integration test: scrub continuous scroll**
   - Full scroll through ScrubStage renders all frames continuously
   - No magnetic stops (unlike snap mode)

## Dependencies
- SnapStage (Sprint 4) ✅
- SectionStage (Sprint 3) ✅
- Schemas (Sprint 1) ✅
- Canvas + Playhead (Sprint 2) ✅

## Verification
- `npm run type-check` passes
- `npm test` passes (all cumulative + new)
- `npm run build` passes
