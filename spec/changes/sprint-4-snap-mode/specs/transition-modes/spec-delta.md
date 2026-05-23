# Transition Modes (Snap) — Spec Delta

## ADDED Requirements

### Requirement: ScrollTrigger Snap Configuration
WHEN a story uses snap mode,
the system SHALL create a ScrollTrigger with scrub and labelsDirectional snapping.

#### Scenario: Scrub with directional snap
GIVEN a SnapStage with 5 scenes
WHEN ScrollTrigger is initialized
THEN it SHALL use `scrub: 1` for smooth progress tracking
AND `snap: "labelsDirectional"` for direction-aware settling
AND `pin: true` to lock the stage viewport

#### Scenario: Snap parameters from config
GIVEN TransitionConfig with snapDelay=0.1, snapDurationMin=0.2, snapDurationMax=1.5
WHEN ScrollTrigger snap is configured
THEN snap.delay SHALL be 0.1
AND snap.duration SHALL be { min: 0.2, max: 1.5 }
AND snap.ease SHALL match the configured ease
AND snap.directional SHALL match config.directional
AND snap.inertia SHALL match config.inertia

### Requirement: Timeline Label Structure
WHEN a snap-mode timeline is built,
the system SHALL place one label per scene at evenly distributed timeline positions.

#### Scenario: 5-scene timeline labels
GIVEN 5 scenes
WHEN the timeline is built
THEN labels SHALL be placed at positions 0, 1, 2, 3, 4
AND each scene segment SHALL tween the playhead from startFrame to endFrame

### Requirement: Progress-Driven Playhead
WHEN the user scrolls through a snap-mode stage,
the system SHALL continuously update playhead.frame based on ScrollTrigger progress.

#### Scenario: Mid-scene scrub
GIVEN a scene spanning frames 30-60 at timeline position 1-2
WHEN ScrollTrigger progress is at 50% through that scene segment
THEN playhead.frame SHALL be approximately 45

### Requirement: Directional Snap Behavior
WHEN the user stops scrolling near a scene boundary,
the system SHALL snap to the next label in the direction of travel.

#### Scenario: Small nudge forward
GIVEN the user scrolled slightly past scene 2's label
WHEN snap resolution occurs
THEN the timeline SHALL settle on scene 3's label (not snap back to scene 2)

### Requirement: Overlay Timeline Positioning
WHEN overlays are configured for snap-mode scenes,
the system SHALL position overlay animations within their scene's timeline segment.

#### Scenario: Overlay appears mid-scene
GIVEN an overlay with enterAt: 0.3, exitAt: 0.8
WHEN the scene segment occupies timeline positions 1.0-2.0
THEN the overlay enter animation SHALL begin at position 1.3
AND the overlay exit animation SHALL begin at position 1.8
