# Sprint Workflow

The project uses an openspec-style workflow where architectural decisions and implementation tasks are tracked explicitly.
For this framework, the sprint plan should reflect the shift from "scrub everywhere" to a three-mode system with `section` as the default.

## Phase guidance

### Phase 2: Canvas engine

Update the canvas work so `ImageSequenceCanvas` consumes a playhead ref instead of direct `ScrollTrigger.progress`.
Acceptance criteria should confirm the same component works for scrub-driven and tween-driven playback.

### Phase 3: Scene composition

Add a transition-mode selection task before overlay timing work.
The implementation should expose `SectionStage`, `SnapStage`, and `ScrubStage` behind a single stage switcher.

Overlay timing should be mode-aware:

- time-based within `section` and `snap`,
- progress-based within `scrub`.

### Phase 4: Smoothing and polish

Update Lenis integration so the runtime can pause and resume it for `section` stages.
Add pagination, keyboard support, reduced-motion handling, and touch normalization as explicit deliverables.

### Phase 5: Validation

Add tests or checks for:

- default transition mode = `section`,
- shallow scene transition override merging,
- reduced-motion fallback behavior,
- `superRefine()` frame continuity validation.

## QA matrix

Every sprint touching interaction should cover:

- Mac trackpad,
- Windows mouse wheel,
- iPad swipe,
- iPhone Safari,
- keyboard-only usage,
- VoiceOver and JAWS.

## Why this workflow matters

The framework blends motion design, narrative structure, and accessibility.
Treating those as sprint-visible tasks prevents the team from shipping motion polish without user safeguards.

## Related docs

- [Development Workflow](README.md)
- [Agent Pipeline](../architecture/agent-pipeline.md)
- [Reduced Motion](../accessibility/reduced-motion.md)
