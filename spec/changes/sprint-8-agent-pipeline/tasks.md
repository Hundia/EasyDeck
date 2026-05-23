# Sprint 8 Tasks

## Implementation Tasks

1. **Define content brief schema** — `src/lib/pipeline/schemas.ts`
   - Zod schema for ContentBrief: title, slug, scenes (label, description, duration hint), global transition preference
   - This is what consumers provide to the pipeline

2. **NarrativeDesigner** — `src/lib/pipeline/narrativeDesigner.ts`
   - Interface: `designNarrative(brief: ContentBrief): NarrativeOutput`
   - NarrativeOutput: scenes with mode, duration, overlays (normalized 0-1 timing), transitionRationale
   - Logic: assigns frame ranges based on duration hints, picks appropriate mode, generates overlay timing
   - Pure function, deterministic

3. **SceneComposer** — `src/lib/pipeline/sceneComposer.ts`
   - Interface: `composeStory(narrative: NarrativeOutput): StorySchema`
   - Validates frame continuity (enforces contiguous frames for section mode)
   - Converts normalized overlay timing to scene-relative values
   - Returns a fully valid StorySchema (passes Zod validation)

4. **Pipeline orchestrator** — `src/lib/pipeline/pipeline.ts`
   - `createPresentation(brief: ContentBrief): StorySchema`
   - Chains: brief → designNarrative → composeStory → validate → return
   - Throws on invalid output with descriptive errors

5. **Frame continuity enforcement in SceneComposer**
   - If mode is "section": ensure scene[i].endFrame === scene[i+1].startFrame
   - Auto-fix: adjust startFrames to be contiguous if needed
   - Log rationale for any adjustments

6. **Overlay timing conversion**
   - NarrativeDesigner outputs normalized 0-1 fractions
   - SceneComposer keeps them as-is (OverlayConfig already uses 0-1 for enterAt/exitAt)
   - Add validation: enterAt < exitAt

7. **Barrel exports** — `src/lib/pipeline/index.ts`

8. **Unit tests: NarrativeDesigner**
   - Produces valid NarrativeOutput from minimal brief
   - Assigns frame ranges without gaps (section mode)
   - Includes transitionRationale per scene
   - Handles single-scene brief

9. **Unit tests: SceneComposer**
   - Produces valid StorySchema
   - Enforces frame continuity for section mode
   - Handles overlays with timing
   - Rejects invalid input (missing frames)

10. **Unit tests: Pipeline orchestrator**
    - End-to-end: brief → valid StorySchema
    - Output passes StorySchema.parse()
    - Handles edge cases (1 scene, many scenes)

11. **Integration test: full pipeline → Stage render**
    - Pipeline output can be passed to `<Stage story={...} />`
    - No runtime errors

## Dependencies
- StorySchema, SceneConfig, OverlayConfig, TransitionConfig (Sprint 1) ✅
- All stage components (Sprints 3-5) ✅

## Verification
- `npm run type-check` passes
- `npm test` passes
- `npm run build` passes
