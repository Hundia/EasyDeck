# Pagination

The pagination component provides scene-level navigation and orientation.
In this framework it is not decorative; it is part of the accessibility and usability contract.

## Purpose

Pagination dots help users answer three questions:

- Where am I in the story?
- How many scenes are left?
- Can I jump directly to a specific scene?

Those answers are especially important in `section` mode where native scroll feedback is suppressed.

## Required semantics

Recommended structure:

- wrap the control in `<nav aria-label="scene navigation">`
- render one interactive element per scene
- use `aria-current="step"` for the active scene
- expose scene labels for screen readers

Buttons are usually preferable to passive dots because they support direct jumps.

## Responsibilities

- Reflect current scene index.
- Allow click or tap jumps to scene boundaries.
- Announce active state correctly.
- Stay visible enough to reinforce that progress is possible.

## Integration notes

`SectionStage` should wire pagination into `gotoScene()`.
`SnapStage` and `ScrubStage` can use it as a progress and jump surface when scene boundaries are defined.

## Accessibility notes

- Do not make dots the only way to navigate.
- Keep labels descriptive, not numeric-only, when possible.
- Preserve logical tab order.
- Ensure focus styles remain visible over cinematic backgrounds.

## Suggested props

A simple API usually includes:

- `scenes`
- `currentIndex`
- `onSelect(index)`
- optional `orientation`
- optional `hidden` toggle tied to transition config

## Related docs

- [SectionStage](section-stage.md)
- [Keyboard Navigation](../accessibility/keyboard-navigation.md)
- [Accessibility Guidelines](../accessibility/README.md)
