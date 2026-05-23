# Sprint 8 Proposal: Agent Pipeline

## Why
The framework needs a content-to-presentation pipeline. Two "agents" (deterministic TypeScript modules, not LLM calls) transform a high-level content brief into a valid StorySchema:
1. **NarrativeDesigner** — Takes a content brief and produces scene configurations with transition rationale
2. **SceneComposer** — Takes NarrativeDesigner output and produces a validated StorySchema

## What
1. NarrativeDesigner interface + implementation (content brief → scene configs)
2. SceneComposer interface + implementation (scene configs → StorySchema)
3. Pipeline orchestrator that chains them
4. Frame continuity enforcement in SceneComposer
5. Overlay timing normalization (0-1 fractions → mode-appropriate values)
6. End-to-end pipeline test

## Impact
- Enables programmatic presentation generation from content briefs
- Enforces schema validity at every step
- Makes the framework usable without manual JSON authoring

## Agent
- Model: Sonnet 4.6 (well-defined interfaces, pure functions — Opus not needed)
