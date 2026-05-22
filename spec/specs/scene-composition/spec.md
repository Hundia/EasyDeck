# Scene Composition Specification

## Overview
Defines the schemas and validation rules that describe stories, scenes, overlays, and transition behavior for the presentation framework.

## ADDED Requirements

### Requirement: Transition Configuration Schema
WHEN transition defaults are declared,
the system SHALL validate them with a `TransitionConfig` schema containing mode and motion controls.

#### Scenario: Validating transition fields
GIVEN a story transition object
WHEN it is parsed
THEN the schema SHALL support `mode`, `duration`, `ease`, `directional`, `inertia`, `wrapEnabled`, and `tolerance`
AND it SHALL support additional stage controls such as keyboard, pagination, and snap timing fields.

#### Scenario: Applying the default mode
GIVEN transition mode is omitted
WHEN the story is validated
THEN `TransitionConfig.mode` SHALL default to `section`
AND the remaining transition defaults SHALL stay available to all scenes.

### Requirement: Scene Configuration Schema
WHEN a scene is declared,
the system SHALL validate it with a `SceneConfig` schema.

#### Scenario: Validating required scene fields
GIVEN a candidate scene definition
WHEN it is parsed
THEN the schema SHALL require `id`, `label`, `startFrame`, `endFrame`, `imageSequence`, and `overlays`
AND `imageSequence` SHALL include at least a frame pattern and frame count.

#### Scenario: Supporting per-scene transition override
GIVEN a scene defines a transition override
WHEN the schema is validated
THEN the scene SHALL accept a partial `TransitionConfig`
AND missing transition fields SHALL continue to inherit from the story-level transition.

### Requirement: Story Schema
WHEN a story is assembled,
the system SHALL validate it with `StorySchema`.

#### Scenario: Validating story structure
GIVEN a candidate story document
WHEN it is parsed
THEN `StorySchema` SHALL require `meta`, `transition`, and `scenes`
AND it SHALL include `pauseLenisInSection` and `reducedMotionFallback` as story-level controls.

#### Scenario: Requiring at least one scene
GIVEN a story with no scenes
WHEN validation runs
THEN the story SHALL be rejected
AND the resulting error SHALL indicate that at least one scene is required.

### Requirement: Frame Continuity Validation
WHEN section-mode stories are validated,
the system SHALL enforce frame continuity with `superRefine`.

#### Scenario: Accepting contiguous boundaries
GIVEN two adjacent section-mode scenes where `sceneA.endFrame === sceneB.startFrame`
WHEN `StorySchema` validation runs
THEN the continuity check SHALL pass
AND reverse navigation SHALL preserve visual continuity.

#### Scenario: Rejecting discontinuous boundaries
GIVEN two adjacent section-mode scenes where the end and next start frame differ
WHEN `superRefine` evaluates the story
THEN validation SHALL fail
AND the issue SHALL point to the non-contiguous scene boundary.

### Requirement: Overlay Timing Normalization
WHEN overlays are authored for scenes,
the system SHALL express overlay timing in normalized `0-1` coordinates within the owning scene.

#### Scenario: Normalized authoring
GIVEN an overlay enter and exit timing definition
WHEN the scene configuration is reviewed
THEN timing values SHALL be represented relative to scene progress from `0` to `1`
AND overlay timing SHALL remain independent from absolute page scroll distance.

#### Scenario: Preparing mode-specific composition
GIVEN a normalized overlay definition
WHEN the story is later composed for section, snap, or scrub playback
THEN the normalized timing SHALL be suitable for conversion into the target driver domain
AND the original scene schema SHALL remain mode-agnostic.
