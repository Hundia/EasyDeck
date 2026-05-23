# Spec Delta: Accessibility & UX

## EARS Requirements

### Reduced Motion
- **WHEN** the user has `prefers-reduced-motion: reduce` active, **THE SYSTEM SHALL** collapse all animation durations to near-zero and display content statically.
- **WHEN** reduced motion is active in section mode, **THE SYSTEM SHALL NOT** call `preventDefault` on scroll events (allowing native scroll).
- **WHEN** reduced motion preference changes at runtime, **THE SYSTEM SHALL** update behavior without requiring a page reload.

### Semantic Content
- **THE SYSTEM SHALL** render a visually-hidden semantic content layer containing all scene labels and overlay text content, accessible to screen readers.
- **THE SYSTEM SHALL** update `aria-live` regions when the active scene changes so screen readers announce transitions.

### Skip Link
- **THE SYSTEM SHALL** provide a "Skip to presentation content" link that becomes visible on keyboard focus and targets the main stage container.

### Touch & Mobile
- **WHEN** the device has coarse pointer input, **THE SYSTEM SHALL** use a touch tolerance of 20px for gesture detection.
- **WHEN** the device has fine pointer input, **THE SYSTEM SHALL** use a touch tolerance of 10px.
- **WHEN** the device supports touch, **THE SYSTEM SHALL** call `ScrollTrigger.normalizeScroll(true)` for consistent scroll behavior.

### URL Hash
- **WHEN** the active scene changes, **THE SYSTEM SHALL** update the URL hash to `#scene-{index}` using `replaceState`.
- **WHEN** the page loads with a `#scene-{N}` hash, **THE SYSTEM SHALL** navigate to scene N on initialization.

### Progress Indicator
- **THE SYSTEM SHALL** display a vertical progress bar with scene boundary markers.
- **THE SYSTEM SHALL** set `aria-valuenow`, `aria-valuemin`, `aria-valuemax` on the progress indicator.

## Constraints
- WCAG 2.1 AA compliance required
- All semantic content must be programmatically determinable
- No JavaScript-dependent content (graceful degradation)
- Skip link must be first focusable element
- Hash navigation must not pollute browser history
