# API Reference

## Components
- `<Stage story={StorySchema}>` — Main entry point
- `<LenisProvider>` — Wrap app for smooth scroll

## Pipeline
- `createPresentation(brief: ContentBrief): PipelineResult`
- `designNarrative(brief: ContentBrief): NarrativeOutput`
- `composeStory(narrative: NarrativeOutput): { story, log }`

## Schemas
- `StorySchema` — Top-level Zod schema
- `SceneConfig` — Per-scene configuration
- `TransitionConfig` — Mode & behavior settings
- `OverlayConfig` — Overlay positioning & timing
- `ContentBrief` — Pipeline input schema

## Hooks
- `usePlayhead(initialFrame)` — Returns MutableRefObject<Playhead>
- `useLenis()` — Returns { lenis, stop, start }
- `useReducedMotion()` — Returns boolean
- `useHashNavigation()` — Returns { initialIndex, updateHash }

## Utilities
- `FPSMonitor` — Development frame rate monitoring
- `MemoryMonitor` — Development heap tracking
