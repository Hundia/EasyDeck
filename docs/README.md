# ScrollyTelling Presentation Framework Docs

This documentation set describes a React/Next.js scrollytelling engine built for presentation-style narratives.
The framework combines GSAP, Lenis, canvas image-sequence playback, Zod validation, and an agent-driven content pipeline.

## What this framework does

- Renders full-viewport stories as scenes with synchronized imagery and overlays.
- Supports three transition modes: `section`, `snap`, and `scrub`.
- Uses GSAP `Observer` and `ScrollTrigger` to map gestures or scroll progress to scene playback.
- Uses Lenis where smooth scrolling improves feel, and disables it where it conflicts.
- Validates story configuration with Zod before runtime composition.
- Treats accessibility as a hard requirement, not a polish pass.

## Read this first

1. Start with [Architecture Overview](architecture/README.md).
2. Read [Transition Modes](architecture/transition-modes.md) to understand the core interaction model.
3. Review [StorySchema](schemas/story-schema.md) before authoring stories or agents.
4. Use [Accessibility Guidelines](accessibility/README.md) before shipping any stage implementation.

## Documentation map

### Architecture

- [Architecture Overview](architecture/README.md)
- [Transition Modes](architecture/transition-modes.md)
- [Image Sequence Pipeline](architecture/image-sequence-pipeline.md)
- [Agent Pipeline](architecture/agent-pipeline.md)

### Components

- [Component Catalog](components/README.md)
- [SectionStage](components/section-stage.md)
- [SnapStage](components/snap-stage.md)
- [ScrubStage](components/scrub-stage.md)
- [ImageSequenceCanvas](components/image-sequence-canvas.md)
- [Pagination](components/pagination.md)

### Schemas

- [Schema Overview](schemas/README.md)
- [StorySchema](schemas/story-schema.md)
- [SceneConfig and TransitionConfig](schemas/scene-config.md)

### Accessibility

- [Accessibility Guidelines](accessibility/README.md)
- [Keyboard Navigation](accessibility/keyboard-navigation.md)
- [Reduced Motion](accessibility/reduced-motion.md)

### Design System

- [Design System Overview](design/README.md)
- [Animation Patterns](design/animation-patterns.md)
- [Scene Composition](design/scene-composition.md)

### Integration

- [Integration Guides](integration/README.md)
- [Lenis Integration](integration/lenis.md)
- [GSAP Integration](integration/gsap.md)

### Development

- [Development Workflow](development/README.md)
- [Sprint Workflow](development/sprint-workflow.md)
- [Agent Orchestration](development/agent-orchestration.md)

## Core principles

- Default to `section` mode for guided, presentation-like storytelling.
- Use `snap` when you want continuous scrubbing plus magnetic scene settling.
- Use `scrub` for long, continuous visual reveals and reduced-motion fallbacks.
- Keep the canvas playhead source-agnostic so all modes share one image engine.
- Preserve semantic content under the visual layer so the page still works without motion.

## Typical implementation flow

1. NarrativeDesigner outputs story intent, scene boundaries, and mode rationale.
2. SceneComposer validates and normalizes the story through Zod schemas.
3. A stage component picks the correct transition driver.
4. `ImageSequenceCanvas` renders frames from a shared playhead contract.
5. Pagination, keyboard support, and reduced-motion behavior keep the experience usable.

See also: [Agent Pipeline](architecture/agent-pipeline.md), [Image Sequence Pipeline](architecture/image-sequence-pipeline.md), and [Accessibility Guidelines](accessibility/README.md).
