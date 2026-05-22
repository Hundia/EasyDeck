# SceneConfig and TransitionConfig

`SceneConfig` describes one scene.
`TransitionConfig` describes how stories or scenes move between states.
Together they define the authored motion contract.

## TransitionMode

```ts
const TransitionMode = z.enum(["scrub", "snap", "section"]);
```

`section` is the default because the framework is presentation-first.

## TransitionConfig fields

```ts
const TransitionConfig = z.object({
  mode: TransitionMode.default("section"),
  duration: z.number().min(0).max(5).default(1.0),
  ease: EaseId.default("power2.inOut"),
  directional: z.boolean().default(true),
  inertia: z.boolean().default(true),
  wrapEnabled: z.boolean().default(false),
  tolerance: z.number().int().min(1).max(200).default(10),
  showPagination: z.boolean().default(true),
  enableKeyboard: z.boolean().default(true),
  snapDelay: z.number().min(0).max(2).default(0.1),
  snapDurationMin: z.number().default(0.2),
  snapDurationMax: z.number().default(1.5),
});
```

### Field notes

- `mode`: selects the runtime driver.
- `duration`: scene tween time for `section` and time-oriented `snap` moments.
- `ease`: GSAP easing identifier.
- `directional`: prefer forward snap travel over nearest snap when applicable.
- `inertia`: allow velocity-aware snapping in `snap` mode.
- `wrapEnabled`: permit first/last scene wraparound in `section` mode.
- `tolerance`: gesture threshold for Observer-driven stages.
- `showPagination`: render pagination UI.
- `enableKeyboard`: enable required keyboard shortcuts.
- `snapDelay`, `snapDurationMin`, `snapDurationMax`: tune snap behavior.

## SceneConfig fields

```ts
const SceneConfig = z.object({
  id: z.string(),
  label: z.string(),
  startFrame: z.number().int(),
  endFrame: z.number().int(),
  imageSequence: z.object({
    pattern: z.string(),
    frameCount: z.number().int(),
  }),
  overlays: z.array(OverlayConfig).default([]),
  transition: TransitionConfig.partial().optional(),
});
```

### Field notes

- `id`: stable identifier used for labels, keys, and deep links.
- `label`: user-facing or editor-facing scene name.
- `startFrame` and `endFrame`: frame boundaries for the image sequence.
- `imageSequence.pattern`: URL template for frames.
- `imageSequence.frameCount`: number of available frames.
- `overlays`: visual content synchronized with the scene.
- `transition`: shallow override of story defaults.

## Merge behavior

Scene transition overrides are partial by design.
Runtime code merges them over the story defaults instead of redefining every field.

## Related docs

- [StorySchema](story-schema.md)
- [Transition Modes](../architecture/transition-modes.md)
- [SectionStage](../components/section-stage.md)
- [SnapStage](../components/snap-stage.md)
