# Sprint 6 Proposal: Lenis Integration & Smoothing

## Why
Lenis provides buttery smooth scrolling and must integrate properly with each transition mode:
- **Section mode**: Lenis must be PAUSED (Observer handles all navigation, native scroll is blocked)
- **Snap mode**: Lenis Snap addon handles snap behavior (avoids darkroomengineering/lenis#389 asymmetry)
- **Scrub mode**: Lenis stays active for smooth scroll feel with ScrollTrigger

## What
1. `initLenis()` factory with GSAP ticker integration
2. `LenisProvider` React context with stop/start control
3. Auto-pause logic per mode (section pauses, scrub/snap keep active)
4. Lenis ↔ ScrollTrigger refresh lifecycle management
5. Unit + integration tests

## Impact
- Enables smooth scrolling across the framework
- Prevents conflicts between Lenis and GSAP ScrollTrigger
- Section mode remains fully controlled (no rogue scroll events)

## Agent
- Model: Sonnet 4.6 (medium-high complexity but well-defined patterns)
