# Scene Composition Schema — Spec Delta

## ADDED Requirements

### Requirement: Transition Mode Schema
WHEN a story configuration defines a transition mode,
the system SHALL validate it against the enum ["scrub", "snap", "section"].

#### Scenario: Valid transition mode
GIVEN a config with `transition.mode: "section"`
WHEN the config is validated
THEN validation passes without errors

#### Scenario: Invalid transition mode
GIVEN a config with `transition.mode: "fade"`
WHEN the config is validated
THEN validation fails with an enum error on the mode field

### Requirement: TransitionConfig Defaults
WHEN a TransitionConfig is parsed without explicit values,
the system SHALL apply defaults: mode="section", duration=1.0, ease="power2.inOut", tolerance=10, wrapEnabled=false.

#### Scenario: Default application
GIVEN an empty TransitionConfig object `{}`
WHEN parsed through the schema
THEN all defaults are applied correctly

### Requirement: SceneConfig Validation
WHEN a scene configuration is provided,
the system SHALL require id, label, startFrame, endFrame, and imageSequence fields.

#### Scenario: Valid scene
GIVEN a scene with all required fields and valid frame range
WHEN validated
THEN it passes

#### Scenario: Missing required field
GIVEN a scene without the `id` field
WHEN validated
THEN it fails with a required field error

### Requirement: Frame Continuity Validation
WHEN a story uses section transition mode,
the system SHALL validate that each scene's startFrame equals the previous scene's endFrame.

#### Scenario: Contiguous frames pass
GIVEN scenes with frames [0-30, 30-60, 60-90]
WHEN the StorySchema validates
THEN it passes (all boundaries match)

#### Scenario: Non-contiguous frames fail
GIVEN scenes with frames [0-30, 35-60] (gap at 30→35)
WHEN the StorySchema validates
THEN it fails with a frame-continuity error on scene index 1

### Requirement: Story Schema Completeness
WHEN a full story configuration is provided,
the system SHALL validate meta (title, slug), global transition, scenes array (min 1), and accessibility options.

#### Scenario: Complete valid story
GIVEN a story with meta, transition, 3 contiguous scenes, and reducedMotionFallback
WHEN validated
THEN it passes and returns the typed configuration
