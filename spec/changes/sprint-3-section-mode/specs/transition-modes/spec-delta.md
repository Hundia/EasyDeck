# Transition Modes (Section) — Spec Delta

## ADDED Requirements

### Requirement: Observer-Driven Section Transitions
WHEN the stage is in section mode,
the system SHALL use GSAP Observer to intercept wheel, touch, and pointer gestures,
mapping each accepted gesture to exactly one scene transition.

#### Scenario: Single gesture advances one scene
GIVEN a SectionStage with 5 scenes at index 0
WHEN the user scrolls down (one wheel event above tolerance)
THEN the stage SHALL advance to scene index 1
AND only one transition SHALL occur regardless of scroll delta magnitude

#### Scenario: Gesture below tolerance is ignored
GIVEN tolerance of 10
WHEN a wheel event with delta less than 10 is received
THEN no scene transition SHALL occur

### Requirement: Animating Lock
WHEN a scene transition is in progress,
the system SHALL drop all incoming gestures until the transition completes.

#### Scenario: Rapid gestures during animation
GIVEN a transition is animating (duration 1.0s)
WHEN 5 rapid wheel events arrive during the animation
THEN all 5 gestures SHALL be dropped
AND no gesture queue SHALL build up

#### Scenario: Gesture after animation completes
GIVEN a transition just finished
WHEN the next wheel event arrives
THEN it SHALL be accepted and trigger a new transition

### Requirement: Tween-Driven Playhead
WHEN gotoScene is called,
the system SHALL animate playhead.frame via GSAP tween from current frame to target scene boundary.

#### Scenario: Forward navigation
GIVEN current scene ends at frame 30, next scene ends at frame 60
WHEN gotoScene(1, 1) is called
THEN playhead.frame SHALL tween from 30 to 60 over the configured duration

### Requirement: Keyboard Navigation
WHEN the stage is in section mode and enableKeyboard is true,
the system SHALL respond to keyboard events for navigation.

#### Scenario: Arrow and Page keys
GIVEN a SectionStage is active
WHEN ArrowDown, PageDown, or Space is pressed
THEN the stage SHALL advance to the next scene
WHEN ArrowUp or PageUp is pressed
THEN the stage SHALL go to the previous scene
WHEN Home is pressed THEN go to first scene
WHEN End is pressed THEN go to last scene

### Requirement: Pagination Dots
WHEN showPagination is true,
the system SHALL render navigation dots with proper ARIA attributes.

#### Scenario: Accessible pagination
GIVEN a story with 5 scenes
WHEN pagination renders
THEN it SHALL produce a nav element with aria-label="scene navigation"
AND 5 buttons, with the active one having aria-current="step"

#### Scenario: Direct jump
GIVEN pagination is rendered
WHEN the user clicks dot 3
THEN the stage SHALL transition directly to scene 3

### Requirement: Wrap vs Clamp
WHEN wrapEnabled is false (default),
the system SHALL clamp scene index to [0, scenes.length - 1].
WHEN wrapEnabled is true,
the system SHALL wrap from last scene to first and vice versa.

#### Scenario: Clamp at boundaries
GIVEN wrapEnabled is false and current scene is the last
WHEN a forward gesture arrives
THEN the stage SHALL NOT advance (stays at last scene)

#### Scenario: Wrap at boundaries
GIVEN wrapEnabled is true and current scene is the last
WHEN a forward gesture arrives
THEN the stage SHALL wrap to scene 0
