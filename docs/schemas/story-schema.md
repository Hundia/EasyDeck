# StorySchema

`StorySchema` is the top-level configuration object for a scrollytelling presentation.
It defines metadata, default transition behavior, scenes, and global runtime switches.

## Reference shape

```ts
export const StorySchema = z.object({
  meta: z.object({ title: z.string(), slug: z.string() }),
  transition: TransitionConfig,
  scenes: z.array(SceneConfig).min(1),
  pauseLenisInSection: z.boolean().default(true),
  reducedMotionFallback: z.enum(["disable", "scrub-instant", "static"]).default("scrub-instant"),
}).superRefine((s, ctx) => {
  if (s.transition.mode === "section") {
    for (let i = 0; i < s.scenes.length - 1; i++) {
      if (s.scenes[i].endFrame !== s.scenes[i + 1].startFrame) {
        ctx.addIssue({
          code: "custom",
          path: ["scenes", i + 1, "startFrame"],
          message: "Section-mode scenes must be frame-contiguous",
        });
      }
    }
  }
});
```

## Field-by-field documentation

### `meta`

- `title`: human-readable story title.
- `slug`: stable URL or identifier-safe name.

### `transition`

Global defaults for stage behavior.
Unless a scene overrides specific values, every scene inherits from this object.
See [SceneConfig and TransitionConfig](scene-config.md).

### `scenes`

Ordered array of scene definitions.
Each scene includes frame boundaries, image-sequence information, overlays, and optional transition overrides.
At least one scene is required.

### `pauseLenisInSection`

When `true`, any active Lenis instance should stop while a `section` stage is active.
This prevents unnecessary smoothing and avoids conflicts with Observer-driven control.

### `reducedMotionFallback`

Controls how the story degrades when `prefers-reduced-motion: reduce` is active.
Recommended options:

- `disable` — turn off enhanced stage behavior.
- `scrub-instant` — keep scroll flow but collapse motion timing.
- `static` — render semantic content without animated stage assumptions.

## SuperRefine rule

The key custom validation rule enforces frame continuity in `section` mode.
Adjacent scenes should share a boundary so reverse navigation does not visibly jump between unrelated frames.

## Authoring guidance

- Keep top-level `transition.mode` at `section` unless the story is primarily continuous.
- Use scene-level overrides only when narrative intent clearly changes.
- Keep metadata stable because it is useful for URLs, analytics, and content review.

## Related docs

- [Schema Overview](README.md)
- [SceneConfig and TransitionConfig](scene-config.md)
- [Reduced Motion](../accessibility/reduced-motion.md)
