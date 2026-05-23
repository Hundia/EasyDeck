# Design System Overview

The framework treats design as a first-class layer between schema validation and runtime rendering.
The installed skills define how presentations should look, while Tailwind and CSS custom properties provide the implementation surface.

## Design skill map

- `ckm-design` guides overall visual direction, story tone, and palette selection.
- `ckm-design-system` defines the token architecture used by Tailwind and scene-level CSS variables.
- `ckm-ui-styling` covers overlays, controls, pagination, progress bars, and other runtime chrome.
- `ckm-brand` keeps presentations aligned with brand rules across scenes.
- `ckm-slides` informs scene-level composition and hierarchy.
- `ckm-banner-design` informs hero scenes, title cards, and chapter openers.
- `data-visualization` guides charts, diagrams, and architecture scenes.
- `gsap`, `gsap-framer-scroll-animation`, and `nextjs` shape the implementation constraints for motion and rendering. See [Animation Patterns](animation-patterns.md).

## Token architecture

Use a three-layer token model from `ckm-design-system`.

| Layer | Purpose | Examples |
| --- | --- | --- |
| Primitive | Raw design decisions with no UI meaning | base hues, font families, spacing steps, radius values |
| Semantic | Context-aware aliases used across scenes | `surface.default`, `text.muted`, `space.sectionGap` |
| Component | Tokens scoped to presentation chrome or reusable scene patterns | `overlay.panel.bg`, `pagination.dot.active`, `hero.kicker.color` |

Rules:

- Keep primitive tokens stable and technology-agnostic.
- Express scene intent through semantic tokens, not raw values.
- Introduce component tokens only when a pattern repeats across overlays or stage chrome.
- Use CSS custom properties for per-story or per-scene overrides without changing component code.

## Tailwind mapping

The framework should expose design tokens through `tailwind.config.ts` and global CSS variables.

- map semantic color tokens into `theme.extend.colors`,
- map typography tokens into `theme.extend.fontFamily`, `fontSize`, `fontWeight`, and `lineHeight`,
- map spacing tokens into `theme.extend.spacing`,
- map radius, shadow, and z-index tokens into the matching Tailwind theme keys,
- mirror runtime-sensitive tokens as CSS variables in `src/app/globals.css` so scenes can override them safely.

Recommended flow:

1. Define primitives once.
2. Derive semantic tokens used by story layouts and stage chrome.
3. Expose the semantic layer to Tailwind.
4. Reserve component tokens for overlays, pagination, progress bars, and hero treatments.

This keeps utility classes aligned with authored design language instead of ad hoc values.

## Visual hierarchy for scenes

`ckm-slides` and `ckm-design` should guide scene composition.

- Each scene should communicate one primary idea.
- Keep a clear reading order: headline, supporting point, evidence, then chrome.
- Separate narrative content from controls so pagination and progress never compete with the message.
- Use scale, contrast, and motion to emphasize one focal element at a time.
- Reserve the largest type and strongest color contrast for title scenes, chapter openers, and high-importance beats.

For detailed scene layout guidance, see [Scene Composition](scene-composition.md).

## Color, typography, and spacing scales

### Color

- Use primitives for raw brand hues and neutrals.
- Use semantic tokens for roles such as background, surface, accent, success, warning, and text contrast.
- Avoid scene-specific hex values inside components.
- Define motion-safe contrast pairs so overlays remain legible over imagery and canvas content.

### Typography

- Use a small type scale with explicit roles: display, title, section heading, body, caption, and annotation.
- Choose families through `ckm-design` and `ckm-brand`; apply them through semantic tokens, not direct component overrides.
- Keep line lengths short for overlay copy and title cards.
- Treat numeric, data, or annotation styles as separate semantic roles when scenes include charts.

### Spacing

- Define spacing as a predictable scale that supports full-viewport layouts.
- Use semantic spacing roles for scene padding, overlay gaps, control spacing, and chapter transitions.
- Prefer consistent outer margins and safe areas so scene-to-scene rhythm feels authored rather than improvised.

## When to use which skill

Use the installed skills at the point where decisions are being made.

| Development task | Primary skills |
| --- | --- |
| Set story tone, palette, and typography direction | `ckm-design`, `ckm-brand` |
| Define tokens and Tailwind theme structure | `ckm-design-system` |
| Style controls, overlays, progress bars, and supporting UI | `ckm-ui-styling` |
| Design title scenes, chapter openers, and hero moments | `ckm-banner-design`, `ckm-slides` |
| Compose scene layouts and hierarchy | `ckm-slides` |
| Build chart-heavy or diagram-heavy scenes | `data-visualization` |
| Implement animation structure and easing | `gsap`, `gsap-framer-scroll-animation` |
| Fit the design into App Router and client boundaries | `nextjs` |

## Related docs

- [Animation Patterns](animation-patterns.md)
- [Scene Composition](scene-composition.md)
- [GSAP Integration](../integration/gsap.md)
- [Architecture Overview](../architecture/README.md)
