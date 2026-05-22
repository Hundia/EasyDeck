# Agent Pipeline

The framework includes an agent-oriented authoring pipeline with two primary roles: `NarrativeDesigner` and `SceneComposer`.
Together they turn narrative intent into validated, renderable story configuration.

## Pipeline overview

```text
brief -> NarrativeDesigner -> draft scenes -> SceneComposer -> validated StorySchema -> stage runtime
```

The agents should produce structured outputs instead of free-form implementation notes.
The runtime should not have to infer scene timing or transition intent from prose.

## NarrativeDesigner responsibilities

NarrativeDesigner is responsible for story design decisions.
It should:

- break the narrative into scenes,
- choose or inherit a transition mode per scene,
- assign normalized overlay timing (`enterAt`, `exitAt`) within each scene,
- propose scene duration for `section` or `snap` timelines,
- emit `transitionRationale` explaining why a mode was selected.

Guidelines:

- Default to `section` when no stronger mode-specific reason exists.
- Keep `section` stories short enough to avoid user fatigue, usually about 5-7 scenes.
- Prefer `scrub` for long continuous reveals rather than forcing too many scene stops.

## SceneComposer responsibilities

SceneComposer turns a narrative draft into executable configuration.
It should:

- normalize inherited transition values,
- validate schema shape with Zod,
- enforce frame continuity rules for `section` stories,
- translate normalized overlay timing into runtime-ready structures,
- reject invalid scene/frame combinations before render.

SceneComposer is the last safe place to catch authoring errors.

## Contract between agents and runtime

Agents should output configuration-oriented data, not hardcoded GSAP code.
Runtime components own actual animation APIs.
This keeps the agent layer portable and reviewable.

Required data from agents typically includes:

- `scene.id` and human-readable label,
- frame boundaries,
- image sequence pattern and frame count,
- per-scene transition overrides,
- overlay timing in normalized 0-1 units,
- transition rationale for review.

## Review loop

A healthy workflow uses an explicit critique cycle:

1. NarrativeDesigner proposes scenes and mode rationale.
2. SceneComposer validates structure and continuity.
3. Review tooling checks accessibility and mode choice.
4. Engineers implement or tune stage behavior.

## Why this matters

The runtime has three transition models, but story authors should not have to reason in GSAP internals.
The agent pipeline lets teams reason in narrative structure while preserving strict runtime validation.

## Related docs

- [StorySchema](../schemas/story-schema.md)
- [SceneConfig and TransitionConfig](../schemas/scene-config.md)
- [Sprint Workflow](../development/sprint-workflow.md)
- [Agent Orchestration](../development/agent-orchestration.md)
