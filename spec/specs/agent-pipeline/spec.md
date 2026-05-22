# Agent Pipeline Specification

## Overview
Defines the AI-assisted authoring pipeline that turns a content brief into a validated `StorySchema` ready for rendering.

## ADDED Requirements

### Requirement: NarrativeDesigner Scene Planning
WHEN a content brief is submitted to `NarrativeDesigner`,
the system SHALL produce scene configurations suitable for story composition.

#### Scenario: Generating scene-level transition plans
GIVEN a narrative content brief
WHEN `NarrativeDesigner` completes its planning pass
THEN each proposed scene SHALL include mode, duration, and overlay definitions
AND the output SHALL be structured for downstream schema validation.

### Requirement: NarrativeDesigner Timing And Rationale
WHEN `NarrativeDesigner` emits scene plans,
the system SHALL express timing in normalized scene-local coordinates and explain transition choices.

#### Scenario: Emitting normalized overlay timing
GIVEN a generated scene with overlays
WHEN overlay timing is authored
THEN `enterAt` and `exitAt` style values SHALL be normalized from `0` to `1`
AND the agent SHALL avoid absolute seconds or raw scroll pixels.

#### Scenario: Emitting transition rationale
GIVEN a generated scene proposal
WHEN its transition mode is selected
THEN the output SHALL include `transitionRationale` for that scene
AND reviewers SHALL be able to inspect why the mode was chosen.

### Requirement: NarrativeDesigner Section-Mode Limits
WHEN `NarrativeDesigner` chooses `section` mode for a story,
the system SHALL constrain the story to a presentation-friendly number of scenes.

#### Scenario: Limiting discrete scene count
GIVEN the planned story is primarily section-driven
WHEN the scene list is finalized
THEN the designer SHALL target no more than `5-7` scenes
AND it SHALL avoid trapping the user in excessive gesture steps.

### Requirement: SceneComposer Validation And Conversion
WHEN `SceneComposer` composes a story from agent output,
the system SHALL validate continuity and convert normalized timing into mode-specific runtime values.

#### Scenario: Validating frame continuity
GIVEN adjacent section-mode scenes from `NarrativeDesigner`
WHEN `SceneComposer` assembles the story
THEN it SHALL validate contiguous frame boundaries
AND it SHALL reject discontinuous scene ranges before render.

#### Scenario: Converting normalized timing for section and snap
GIVEN a composed scene with normalized overlay timing
WHEN the target mode is section or snap
THEN `SceneComposer` SHALL convert timing to seconds based on scene duration
AND composed overlays SHALL align with the scene timeline.

#### Scenario: Preserving normalized timing for scrub
GIVEN a composed scene with normalized overlay timing
WHEN the target mode is scrub
THEN `SceneComposer` SHALL preserve timing as progress-based values
AND scrub overlays SHALL remain tied to continuous scene progress.

### Requirement: Valid StorySchema Output
WHEN the full pipeline completes,
the system SHALL produce a valid `StorySchema` document.

#### Scenario: Producing a renderable story
GIVEN a valid content brief and successful agent passes
WHEN pipeline output is finalized
THEN the resulting document SHALL validate against `StorySchema`
AND it SHALL be ready for the renderer without manual schema repair.
