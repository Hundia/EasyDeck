# Spec Delta: Integration Testing & QA

## EARS Requirements

### E2E Testing
- **THE SYSTEM SHALL** include Playwright configuration supporting Chromium, Firefox, and WebKit browsers.
- **THE SYSTEM SHALL** include E2E tests for full keyboard navigation flow, mode switching, and accessibility checks.
- **WHEN** E2E tests are executed in CI, **THE SYSTEM SHALL** report pass/fail with screenshots on failure.

### Performance
- **THE SYSTEM SHALL** export an FPSMonitor utility that measures frame rate over a configurable window.
- **THE SYSTEM SHALL** export a MemoryMonitor utility that tracks JS heap size when available.
- **THE SYSTEM SHALL** maintain 60fps during scroll-driven animations on standard hardware.

### Memory Management
- **WHEN** a Stage component unmounts, **THE SYSTEM SHALL** clean up all GSAP timelines, ScrollTrigger instances, Observer instances, and ticker callbacks.
- **WHEN** LenisProvider unmounts, **THE SYSTEM SHALL** destroy the Lenis instance and remove all ticker callbacks.
- **WHEN** ImageSequenceCanvas unmounts, **THE SYSTEM SHALL** release canvas context and cancel any pending frame operations.

### Bundle Size
- **THE SYSTEM SHALL** include a bundle audit script that measures total JS output size.
- **WHEN** bundle size exceeds 200KB gzipped, **THE SYSTEM SHALL** report a warning.

### Documentation
- **THE SYSTEM SHALL** include a Getting Started guide covering installation, minimal example, and mode configuration.
- **THE SYSTEM SHALL** include an API reference documenting all public exports with types and examples.

## Constraints
- E2E tests must be runnable in CI (headless browsers)
- Performance utilities are development-only (tree-shakeable)
- Bundle audit must not require external services
- Documentation must be plain markdown (no custom tooling)
