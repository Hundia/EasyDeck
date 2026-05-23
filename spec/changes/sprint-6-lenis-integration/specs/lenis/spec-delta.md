# Spec Delta: Lenis Integration

## EARS Requirements

### initLenis
- **THE SYSTEM SHALL** provide an `initLenis()` factory that creates a Lenis instance integrated with the GSAP ticker.
- **WHEN** `initLenis()` is called, **THE SYSTEM SHALL** add a GSAP ticker callback that calls `lenis.raf(time * 1000)` every frame.
- **WHEN** `initLenis()` is called, **THE SYSTEM SHALL** set `gsap.ticker.lagSmoothing(0)` to prevent frame drops from causing jumps.

### LenisProvider
- **THE SYSTEM SHALL** export a `LenisProvider` component that initializes Lenis on mount and destroys it on unmount.
- **THE SYSTEM SHALL** expose `stop()` and `start()` functions via React context for child components to control Lenis.
- **THE SYSTEM SHALL** export a `useLenis()` hook that returns the Lenis context value.

### Mode-Specific Behavior
- **WHEN** the active transition mode is "section", **THE SYSTEM SHALL** call `lenis.stop()` to prevent native scroll interference with Observer-driven navigation.
- **WHEN** the active transition mode is "section" and the stage unmounts or mode changes, **THE SYSTEM SHALL** call `lenis.start()` to restore smooth scrolling.
- **WHEN** the active transition mode is "snap", **THE SYSTEM SHALL** keep Lenis active to provide smooth inertial scroll input to ScrollTrigger.
- **WHEN** the active transition mode is "scrub", **THE SYSTEM SHALL** keep Lenis active for smooth continuous scroll-driven playback.

### ScrollTrigger Synchronization
- **WHEN** Lenis emits a scroll event, **THE SYSTEM SHALL** call `ScrollTrigger.update()` to keep triggers in sync.
- **WHEN** the viewport resizes, **THE SYSTEM SHALL** call both `lenis.resize()` and `ScrollTrigger.refresh()`.

## Constraints
- Lenis MUST be paused during section mode — no exceptions
- Lenis ticker integration MUST use GSAP's ticker (not requestAnimationFrame directly)
- LenisProvider MUST clean up all listeners on unmount
- Zero conflicts between Lenis scroll and ScrollTrigger pinning
