# Scene Composition

Scene composition should make each presentation beat legible at a glance.
`ckm-slides`, `ckm-banner-design`, `data-visualization`, `ckm-brand`, and `ckm-design` define the visual rules for that legibility.

## Composition principles

Use `ckm-slides` to structure each scene around one dominant message.

- Start with a single focal element: headline, product image, chart, or diagram.
- Support it with one secondary layer of context, not several competing callouts.
- Keep controls, progress indicators, and pagination visually subordinate.
- Use consistent alignment, safe areas, and spacing so adjacent scenes feel related.
- Treat motion as emphasis, not as a substitute for hierarchy.

For token and scale guidance, see [Design System Overview](README.md).

## Title scenes and hero banners

Use `ckm-banner-design` when the scene functions as a title card, chapter opener, or hero transition.

Recommended structure:

- an immediate headline or chapter label,
- a strong visual anchor,
- minimal supporting copy,
- a background treatment that supports legibility before animation starts.

Rules:

- keep the first screen readable before motion progresses,
- reserve the boldest contrast and largest scale for these entry scenes,
- use hero treatments sparingly so chapter boundaries remain meaningful,
- maintain enough empty space for the scene to breathe on large displays.

## Data visualization in scenes

Use `data-visualization` when a scene explains a process, system, comparison, or metric.

- Prefer one chart or one diagram per scene.
- Highlight the key data point before revealing secondary detail.
- Use annotation styles that are distinct from body copy.
- Ensure color choices remain interpretable for users who cannot rely on hue alone.
- Keep axis labels, legends, and callouts large enough for full-viewport presentation viewing.

If motion is applied to charts, animate meaningfully and avoid decorative churn.
Cross-reference [Animation Patterns](animation-patterns.md) for motion constraints.

## Brand consistency across scenes

Use `ckm-brand` and `ckm-design` to keep story-level visuals coherent.

- Reuse the same semantic token set across all scenes in a story.
- Keep logo usage, accent color application, and typography roles consistent.
- Allow scene-specific variation through semantic or component tokens, not through arbitrary one-off styling.
- Preserve consistent control styling so UI chrome feels like part of one system.

Brand consistency should support the narrative, not flatten it.
Variation is acceptable when it stays inside the same token and hierarchy rules.

## Skill integration

| Need | Primary skills |
| --- | --- |
| Scene layout and visual hierarchy | `ckm-slides`, `ckm-design` |
| Title cards, chapter openers, hero moments | `ckm-banner-design` |
| Brand alignment across the full story | `ckm-brand` |
| Diagrams, charts, and metric storytelling | `data-visualization` |
| Overlay and chrome styling around the scene | `ckm-ui-styling` |

## Related docs

- [Design System Overview](README.md)
- [Animation Patterns](animation-patterns.md)
- [Accessibility Guidelines](../accessibility/README.md)
