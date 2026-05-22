# Schema Documentation

The framework uses Zod schemas to define and validate story configuration before runtime.
Schemas are the contract between content generation, engineering, and stage components.

## Why schemas matter

They provide:

- a stable format for stories and scenes,
- defaults for transition behavior,
- validation for unsafe runtime combinations,
- a shared language for agents and UI code.

## Main schema types

- `TransitionMode` — enum of `scrub`, `snap`, and `section`.
- `TransitionConfig` — global or per-scene motion settings.
- `SceneConfig` — frame range, image sequence, overlays, and overrides.
- `StorySchema` — the top-level story definition.

## Validation philosophy

The runtime should not guess what an invalid story means.
If a story is malformed, schema validation should reject it early.
This is especially important for:

- frame continuity in `section` mode,
- invalid transition defaults,
- per-scene overrides that break assumptions.

## Merge model

Stories define global defaults in `transition`.
Scenes can supply `transition` as a partial override.
At runtime or composition time, scene transition values are resolved as:

```text
effectiveSceneTransition = { ...story.transition, ...scene.transition }
```

That keeps authoring concise while still allowing exceptions.

## Reduced-motion and platform flags

The top-level schema also includes behavior switches such as:

- `pauseLenisInSection`
- `reducedMotionFallback`

These belong in schema because they change runtime behavior in predictable, reviewable ways.

## Recommended reading

- [StorySchema](story-schema.md)
- [SceneConfig and TransitionConfig](scene-config.md)
- [Transition Modes](../architecture/transition-modes.md)
- [Agent Pipeline](../architecture/agent-pipeline.md)
