# Transition Modes Specification

## Overview
Defines the three supported transition behaviors and the routing rules that select the correct stage implementation for each story and scene.

## ADDED Requirements

### Requirement: Section Mode Navigation
WHEN a story uses `section` mode,
the system SHALL drive scene changes through GSAP Observer using one gesture per scene transition.

#### Scenario: Advancing one scene per gesture
GIVEN a pinned section-mode stage with multiple scenes
WHEN the user performs one qualifying wheel, touch, or pointer gesture
THEN the stage SHALL transition exactly one scene in the gesture direction
AND the playhead SHALL be animated independently of native scroll position.

#### Scenario: Dropping gestures during animation
GIVEN a section transition is already running
WHEN additional gestures arrive before completion
THEN the stage SHALL ignore those gestures
AND it SHALL prevent transition queue buildup with an animating lock.

#### Scenario: Honoring boundary strategy
GIVEN the user navigates past the first or last scene
WHEN the effective transition config is evaluated
THEN the stage SHALL wrap to the opposite end if `wrapEnabled` is true
AND it SHALL clamp at the terminal scene if `wrapEnabled` is false.

### Requirement: Snap Mode Scrub And Settle
WHEN a story uses `snap` mode,
the system SHALL allow continuous scrub and settle to scene labels using directional snapping.

#### Scenario: Continuous scrub before settling
GIVEN a snap-mode timeline with scene labels
WHEN the user scrolls through the stage
THEN the playhead SHALL scrub continuously with scroll progress
AND overlays SHALL animate within the same timeline.

#### Scenario: Settling with directional labels
GIVEN the user stops scrolling near a scene boundary
WHEN snap resolution runs
THEN the stage SHALL settle to `labelsDirectional`
AND a small nudge in the current direction SHALL prefer the next label in that direction.

### Requirement: Scrub Mode Continuous Control
WHEN a story uses `scrub` mode,
the system SHALL bind scene progress directly to continuous scroll without magnetic stops.

#### Scenario: Free scrub behavior
GIVEN a scrub-mode stage
WHEN the user scrolls forward or backward
THEN the playhead SHALL follow scroll progress continuously
AND the stage SHALL NOT apply snapping.

### Requirement: Hierarchical Mode Selection
WHEN transition mode is resolved,
the system SHALL use the story-level mode by default and allow per-scene overrides.

#### Scenario: Using the story default
GIVEN a story defines a global transition mode
WHEN a scene does not declare its own transition override
THEN the scene SHALL inherit the story-level mode
AND shared transition defaults SHALL remain in effect.

#### Scenario: Overriding per scene
GIVEN a story default of `section`
WHEN a specific scene declares `snap` or `scrub`
THEN that scene SHALL use its override
AND sibling scenes without overrides SHALL continue using the global default.

### Requirement: Stage Switcher Routing
WHEN a story is rendered,
the system SHALL route it through the stage switcher component for the effective mode.

#### Scenario: Selecting the correct stage implementation
GIVEN a resolved effective mode for the current scene or story
WHEN the stage switcher renders the presentation
THEN it SHALL mount `SectionStage`, `SnapStage`, or `ScrubStage` accordingly
AND the routing layer SHALL preserve a shared canvas contract across modes.
