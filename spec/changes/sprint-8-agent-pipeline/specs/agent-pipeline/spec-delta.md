# Spec Delta: Agent Pipeline

## EARS Requirements

### Content Brief
- **THE SYSTEM SHALL** accept a ContentBrief containing: title, slug, an array of scene descriptions (label, description, durationHint), and an optional global transition mode preference.
- **THE SYSTEM SHALL** validate the ContentBrief using Zod before processing.

### NarrativeDesigner
- **WHEN** a valid ContentBrief is provided, **THE SYSTEM SHALL** produce a NarrativeOutput containing scene configurations with: id, label, startFrame, endFrame, transition mode, overlays with normalized timing (0-1), and a transitionRationale string.
- **THE SYSTEM SHALL** assign frame ranges based on scene durationHint values proportionally.
- **THE SYSTEM SHALL** default to 30fps and 5 seconds per scene when no durationHint is provided.
- **THE SYSTEM SHALL** include a transitionRationale explaining the mode choice for each scene.

### SceneComposer
- **WHEN** a NarrativeOutput is provided, **THE SYSTEM SHALL** produce a valid StorySchema that passes `StorySchema.parse()`.
- **WHEN** the transition mode is "section", **THE SYSTEM SHALL** enforce frame continuity (scene[i].endFrame === scene[i+1].startFrame).
- **WHEN** frame continuity is violated, **THE SYSTEM SHALL** auto-adjust startFrame values to be contiguous and log the adjustment.
- **THE SYSTEM SHALL** validate that all overlay enterAt < exitAt values.

### Pipeline
- **THE SYSTEM SHALL** export a `createPresentation(brief: ContentBrief): StorySchema` function that orchestrates NarrativeDesigner → SceneComposer.
- **WHEN** any pipeline step produces invalid output, **THE SYSTEM SHALL** throw a descriptive error including the step name and validation issues.

## Constraints
- All pipeline functions must be pure (no side effects, deterministic)
- Output must always pass StorySchema Zod validation
- Frame assignment: 30fps default, proportional to duration hints
- No LLM/AI calls — this is a deterministic transformation pipeline
