# Development Workflow

This framework is developed as a combination of narrative design, schema authoring, runtime engineering, and accessibility review.
The workflow should keep those concerns explicit instead of blending them into one vague implementation pass.

## Typical workflow

1. Define or refine the story brief.
2. Use the agent pipeline to draft scenes and transition rationale.
3. Validate the story with Zod schemas.
4. Implement or tune the relevant stage components.
5. Verify accessibility, reduced motion, and pagination behavior.
6. Run targeted QA across input devices.

## Engineering focus areas

### Motion system

Engineers should verify the chosen mode matches the narrative and device behavior.
A technically correct animation can still be the wrong interaction model.

### Shared canvas engine

Keep the image-sequence renderer mode-agnostic.
Any change that re-couples it to scroll progress should be treated as an architectural regression.

### Validation and contracts

Add schema rules when new runtime assumptions emerge.
Prefer catching invalid stories before the stage renders.

### Accessibility

Keyboard behavior, reduced-motion behavior, and semantic fallback content should be validated alongside the motion system, not after it.

### Design skills

The installed design skills should guide implementation choices before engineers introduce one-off styling or motion.
Use `ckm-design` and `ckm-brand` for story-level direction, `ckm-design-system` for token structure, `ckm-ui-styling` for stage chrome, `ckm-slides` and `ckm-banner-design` for scene composition, `data-visualization` for chart-heavy scenes, and `gsap`, `gsap-framer-scroll-animation`, and `nextjs` for implementation constraints.

## Team responsibilities

- Designers define narrative intent and review scene segmentation.
- Designers should reference the installed design skills when specifying hierarchy, tokens, brand rules, and hero treatments.
- Agent workflows produce structured draft stories and rationale.
- Engineers implement stages, canvas behavior, and integration hooks.
- QA validates keyboard, touch, reduced motion, and device-specific behavior.

## Release checklist

Before shipping a story implementation, confirm:

- transition mode choices still match narrative intent,
- StorySchema validation passes,
- pagination and keyboard controls work,
- reduced-motion fallback remains readable,
- Lenis behavior matches the active mode.

## Supporting docs

- [Sprint Workflow](sprint-workflow.md)
- [Agent Orchestration](agent-orchestration.md)
- [Design System Overview](../design/README.md)
- [Accessibility Guidelines](../accessibility/README.md)
- [Transition Modes](../architecture/transition-modes.md)
