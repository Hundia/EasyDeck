# Accessibility Guidelines

Accessibility is a first-class architectural requirement for this framework.
The visual stage is an enhancement layer; the narrative must remain understandable and navigable without relying on motion alone.

## Core rules

- Preserve semantic story content outside the canvas layer.
- Support keyboard navigation anywhere motion intercepts scroll.
- Respect `prefers-reduced-motion` by collapsing or bypassing animation.
- Use ARIA to expose current scene state and navigation.
- Avoid trapping users in a pinned or hijacked interaction model.

## Required features

### Semantic fallback content

The full narrative should exist in semantic HTML beneath the stage.
Screen readers and reduced-motion users should never depend on the canvas to access core information.

### Pagination and state

Scene navigation should be exposed with a labeled `<nav>` and interactive controls.
The current scene should use `aria-current="step"`.

### Keyboard input

`section` mode must support directional keys, paging keys, `Home`, `End`, and space-to-advance.
See [Keyboard Navigation](keyboard-navigation.md).

### Motion preferences

When `prefers-reduced-motion: reduce` is active, the runtime should avoid gesture trapping and shrink transition duration toward zero.
See [Reduced Motion](reduced-motion.md).

## UX guardrails

Scroll-jacking is only appropriate when visuals carry most of the narrative.
If a page is mostly text, use a conventional reading flow instead of `section` mode.

## Touch and mobile

- Increase gesture tolerance on phones to reduce accidental triggers.
- Normalize scroll behavior on touch devices where browser UI changes can disrupt pinned layouts.
- Keep controls reachable and visible over cinematic layouts.

## Recommended QA matrix

Validate with:

- keyboard-only navigation,
- VoiceOver and JAWS,
- trackpad and mouse wheel,
- iPad and iPhone Safari,
- reduced-motion system settings.

## Related docs

- [Keyboard Navigation](keyboard-navigation.md)
- [Reduced Motion](reduced-motion.md)
- [Pagination](../components/pagination.md)
- [SectionStage](../components/section-stage.md)
