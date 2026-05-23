# Integration Guides

These guides describe how the framework plugs into the surrounding app stack.
The main integrations are Next.js/React lifecycle rules, GSAP plugin setup, Lenis smooth scrolling, and schema-driven runtime composition.

## Integration surfaces

### React and Next.js

- stage components are client-side interactive components,
- refs own DOM targets for Observer, ScrollTrigger, and canvas drawing,
- cleanup must happen on unmount or route change.

### GSAP

- register required plugins before use,
- keep timelines scoped to component lifecycle,
- clean up observers and scroll triggers.

See [GSAP Integration](gsap.md).

### Lenis

- use Lenis where smooth scrolling improves motion quality,
- pause it in `section` mode,
- prefer Lenis Snap for hybrid `snap` scenarios when Lenis owns scroll.

See [Lenis Integration](lenis.md).

### Schemas and agents

- parse agent output through Zod before rendering,
- resolve scene-level transition overrides over story defaults,
- keep runtime logic driven by validated config, not ad hoc assumptions.

### Design system

- use `ckm-design-system` token layers to map primitives to semantic roles and, only when needed, component-level tokens,
- expose semantic tokens through Tailwind theme keys and mirror scene-sensitive values as CSS variables,
- use the installed design skills as the source of truth for hierarchy, hero treatments, brand usage, and chart styling,
- keep Tailwind utilities aligned with token names so implementation matches authored design guidance.

See [Design System Overview](../design/README.md).

## Common integration rule

Every integration should preserve the separation between:

- story data,
- stage motion driver,
- canvas rendering,
- semantic accessibility layer.

## Recommended reading order

1. [Design System](../design/README.md)
2. [GSAP Integration](gsap.md)
3. [Lenis Integration](lenis.md)
4. [Transition Modes](../architecture/transition-modes.md)
5. [Schema Overview](../schemas/README.md)
