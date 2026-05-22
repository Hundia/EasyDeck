# Keyboard Navigation

Keyboard support is mandatory for any stage that intercepts or redirects scroll behavior.
In this framework that requirement is most critical in `section` mode.

## Required key map

Recommended default bindings:

- `ArrowDown` -> next scene
- `PageDown` -> next scene
- `Space` -> next scene
- `ArrowUp` -> previous scene
- `PageUp` -> previous scene
- `Home` -> first scene
- `End` -> last scene

## Event handling rules

- Ignore navigation input while a scene transition is animating.
- Call `preventDefault()` only for keys that the stage actively handles.
- Remove listeners on unmount or stage deactivation.
- Keep keyboard support configurable through `transition.enableKeyboard`, but default it to `true`.

## Focus strategy

The stage itself should not become a dead-end focus trap.
Recommended patterns:

- keep pagination buttons in the normal tab order,
- preserve a skip-to-content link,
- ensure semantic story content remains reachable,
- move focus deliberately only when there is a clear benefit.

## Announcing state

Keyboard users need scene context.
Useful patterns include:

- `aria-current="step"` on pagination,
- visible scene labels,
- optional live-region announcements for scene changes when they add value.

## Reduced-motion interaction

If reduced motion is active, keyboard input should still work, but transitions should collapse to instant or near-instant updates.
Users should never be forced through elaborate animated scene changes.

## Testing checklist

- Can the whole story be navigated without a mouse?
- Are current scene and total progress perceivable?
- Does focus remain visible over the stage?
- Do `Home` and `End` work reliably?
- Are listeners cleaned up when changing routes or modes?

## Related docs

- [Accessibility Guidelines](README.md)
- [SectionStage](../components/section-stage.md)
- [Pagination](../components/pagination.md)
