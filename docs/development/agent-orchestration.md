# Agent Orchestration

AI agents are useful in this project when their responsibilities stay narrow and structured.
The main orchestration rule is simple: agents should produce validated story and implementation artifacts, not vague prose.

## Primary roles

### NarrativeDesigner

Owns story segmentation, transition choice, and normalized overlay timing.
It should default to `section` unless a scene clearly benefits from `snap` or `scrub`.

### SceneComposer

Owns normalization and validation.
It should merge transition defaults, enforce frame continuity rules, and reject invalid stories before runtime.

### Engineering agent support

Implementation-focused agents can then work on:

- schema additions,
- stage components,
- canvas refactors,
- pagination and accessibility glue,
- Lenis integration.

## Recommended task split

Good delegation patterns:

- let schema-focused agents handle Zod expansions,
- let component-focused agents implement `SnapStage` and boilerplate GSAP patterns,
- keep cross-cutting a11y and mode-boundary decisions under stricter review.

## Orchestration rules

- pass story requirements in structured form,
- require transition rationale per scene,
- normalize timing into 0-1 scene fractions,
- review accessibility implications before accepting generated output,
- validate everything through schema before render.

## Review checklist

Ask of any agent-generated change:

- Does it preserve the playhead-agnostic canvas contract?
- Does it keep `section` as the default mode unless justified otherwise?
- Does it honor reduced motion and keyboard requirements?
- Does it avoid mixing scroll systems unsafely?

## Related docs

- [Agent Pipeline](../architecture/agent-pipeline.md)
- [Sprint Workflow](sprint-workflow.md)
- [Schema Overview](../schemas/README.md)
