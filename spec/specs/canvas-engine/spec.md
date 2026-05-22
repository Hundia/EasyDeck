# Canvas Engine Specification

## Overview
Defines the playhead-agnostic `ImageSequenceCanvas` that renders image sequences independently from how scene progress is driven.

## ADDED Requirements

### Requirement: Playhead-Agnostic Frame Source
WHEN the canvas engine is bound to a playhead,
the system SHALL read the current frame from a mutable playhead object shaped as a frame-number reference.

#### Scenario: Accepting a shared playhead reference
GIVEN an `ImageSequenceCanvas` instance and a playhead object with a numeric `frame` field
WHEN a transition driver updates `playhead.frame`
THEN the canvas SHALL render from that frame source
AND the canvas SHALL NOT require direct knowledge of scroll position.

#### Scenario: Reusing the same canvas across transition modes
GIVEN the same `ImageSequenceCanvas` is mounted in section, snap, and scrub stories
WHEN each mode updates the playhead through its own driver
THEN the canvas SHALL respond identically in all three modes
AND the canvas SHALL NOT depend on `ScrollTrigger` APIs.

### Requirement: GSAP Ticker Draw Loop
WHEN the canvas engine is active,
the system SHALL perform frame drawing on the GSAP ticker.

#### Scenario: Drawing on ticker ticks
GIVEN preloaded frames and an active canvas
WHEN the GSAP ticker advances
THEN the engine SHALL resolve the current playhead frame and draw it to the canvas
AND the draw loop SHALL stay decoupled from any specific transition controller.

#### Scenario: Updating after tween-driven playhead changes
GIVEN section mode animates the playhead with `gsap.to()`
WHEN the tween changes `playhead.frame` between ticks
THEN the next ticker pass SHALL draw the updated frame
AND no separate scroll listener SHALL be required.

### Requirement: Frame Preloading With Progress
WHEN an image sequence is requested,
the system SHALL preload frames and report loading progress.

#### Scenario: Reporting preload progress
GIVEN a sequence of image URLs and a progress callback
WHEN each frame finishes loading
THEN the engine SHALL update progress based on loaded versus total frames
AND progress SHALL reach completion when all required frames are ready.

#### Scenario: Avoiding playback before readiness
GIVEN the sequence is still loading
WHEN drawing is attempted
THEN the engine SHALL use only frames that have completed loading
AND the component SHALL expose loading state suitable for presentation progress UI.

### Requirement: DPR-Aware Canvas Sizing
WHEN the canvas size is computed or recomputed,
the system SHALL size the backing store using device pixel ratio aware dimensions.

#### Scenario: Rendering crisply on high-DPR screens
GIVEN a canvas displayed at CSS width and height
WHEN the device pixel ratio is greater than 1
THEN the engine SHALL scale the internal canvas dimensions by the current DPR
AND rendered frames SHALL remain visually sharp.

#### Scenario: Responding to viewport resize
GIVEN the viewport or container size changes
WHEN the canvas recalculates its bounds
THEN the engine SHALL recompute CSS and backing-store dimensions together
AND subsequent draws SHALL use the updated sizing.

### Requirement: Frame Clamping
WHEN a requested frame falls outside the valid sequence range,
the system SHALL clamp the frame to the nearest valid index.

#### Scenario: Clamping below the first frame
GIVEN a sequence with frames `0` through `frameCount - 1`
WHEN the playhead value becomes negative
THEN the engine SHALL draw frame `0`
AND it SHALL NOT attempt to read a missing image.

#### Scenario: Clamping beyond the last frame
GIVEN a sequence with a finite frame count
WHEN the playhead value exceeds `frameCount - 1`
THEN the engine SHALL draw the last available frame
AND the component SHALL remain stable regardless of driver overshoot.
