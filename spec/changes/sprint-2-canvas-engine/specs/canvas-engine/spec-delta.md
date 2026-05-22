# Canvas Engine — Spec Delta

## ADDED Requirements

### Requirement: Playhead Interface
WHEN any transition mode drives frame rendering,
the system SHALL use a shared `Playhead` interface of shape `{ frame: number }` as a mutable ref.

#### Scenario: Playhead type enforcement
GIVEN a component expecting a Playhead ref
WHEN an object without a numeric `frame` property is provided
THEN TypeScript compilation SHALL fail

### Requirement: usePlayhead Hook
WHEN a stage component needs playhead state,
the system SHALL provide a `usePlayhead(initialFrame)` hook that returns a `MutableRefObject<Playhead>`.

#### Scenario: Initial frame value
GIVEN `usePlayhead(0)` is called
WHEN the hook returns
THEN `ref.current.frame` SHALL equal 0

#### Scenario: Mutation persists across renders
GIVEN a playhead ref from usePlayhead
WHEN `ref.current.frame` is set to 42
THEN the value persists without triggering re-render

### Requirement: Frame Preloader
WHEN an image sequence is initialized,
the system SHALL preload all frames and report progress via callback.

#### Scenario: Progress reporting
GIVEN 100 frames to preload
WHEN 50 frames have loaded
THEN the progress callback SHALL receive approximately 0.5

#### Scenario: Completion signal
GIVEN all frames loaded successfully
WHEN preloading finishes
THEN the progress callback SHALL receive 1.0
AND the returned promise SHALL resolve with the Image array

### Requirement: DPR-Aware Canvas Sizing
WHEN the canvas dimensions are calculated,
the system SHALL multiply by `window.devicePixelRatio` for the backing store.

#### Scenario: 2x DPR display
GIVEN a container of 800x600 CSS pixels and DPR of 2
WHEN canvas sizing is computed
THEN canvas.width SHALL be 1600 and canvas.height SHALL be 1200
AND CSS width/height SHALL remain 800x600

### Requirement: Frame Clamping
WHEN the playhead value is outside [0, frameCount-1],
the system SHALL clamp to the nearest valid index.

#### Scenario: Negative playhead
GIVEN frameCount of 90
WHEN playhead.frame is -5
THEN the drawn frame index SHALL be 0

#### Scenario: Overflow playhead
GIVEN frameCount of 90
WHEN playhead.frame is 100
THEN the drawn frame index SHALL be 89
