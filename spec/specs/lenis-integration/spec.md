# Lenis Integration Specification

## Overview
Defines how Lenis smoothing is initialized, exposed, and selectively enabled across scrub, snap, and section transition modes.

## ADDED Requirements

### Requirement: Lenis Initialization
WHEN smooth scrolling is enabled,
the system SHALL initialize Lenis through `initLenis()` with GSAP ticker integration.

#### Scenario: Wiring Lenis to GSAP and ScrollTrigger
GIVEN the application starts Lenis
WHEN `initLenis()` runs
THEN it SHALL connect Lenis scroll events to `ScrollTrigger.update`
AND it SHALL drive `lenis.raf()` from the GSAP ticker.

### Requirement: Lenis Control Context
WHEN Lenis is provided to presentation components,
the system SHALL expose it through a `LenisContext` provider with imperative lifecycle controls.

#### Scenario: Exposing stop and start controls
GIVEN a stage consumes Lenis through context
WHEN it needs to pause or resume smoothing
THEN the provider SHALL expose `stop()` and `start()` methods
AND those methods SHALL map to the active Lenis instance.

### Requirement: Mode-Specific Lenis Behavior
WHEN transition mode is resolved,
the system SHALL apply the correct Lenis strategy for that mode.

#### Scenario: Keeping Lenis active in scrub mode
GIVEN a story uses `scrub` mode
WHEN the stage initializes
THEN Lenis SHALL remain active
AND smooth scrolling SHALL improve the continuous scrub feel.

#### Scenario: Using the Lenis Snap addon in snap mode
GIVEN a story uses `snap` mode
WHEN snapping is configured
THEN the stage SHALL use the Lenis Snap addon
AND it SHALL avoid the asymmetric behavior documented for Lenis plus ScrollTrigger snap.

### Requirement: Section Mode Lenis Suspension
WHEN a section-mode stage is pinned,
the system SHALL disable Lenis for the duration of that active stage.

#### Scenario: Disabling Lenis while pinned
GIVEN a story uses `section` mode and `pauseLenisInSection` is enabled
WHEN the stage becomes active
THEN Lenis SHALL be stopped
AND Observer-driven navigation SHALL run without competing smooth-scroll behavior.

#### Scenario: Resuming Lenis after exit
GIVEN Lenis was paused for a section stage
WHEN the user exits or unmounts that stage
THEN Lenis SHALL be started again
AND native page scrolling outside the stage SHALL recover its configured smoothing.

### Requirement: Automatic Pause And Resume
WHEN a section-mode stage enters or leaves its active lifecycle,
the system SHALL automatically coordinate Lenis pause and resume.

#### Scenario: Enter and exit lifecycle handling
GIVEN a stage mounts and unmounts during page navigation
WHEN lifecycle hooks run
THEN entry SHALL invoke the pause path
AND cleanup or stage exit SHALL invoke the resume path.
