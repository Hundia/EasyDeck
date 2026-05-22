# Proposal: Sprint 1 — Project Bootstrap & Schema Layer

## Change ID
`sprint-1-schema-layer`

## Why
The framework needs a runnable Next.js project with TypeScript and the complete Zod schema layer that all subsequent sprints build upon. Schemas define the contract for scene configuration, transition modes, and story structure.

## What Changes
- Initialize Next.js 15 with TypeScript, Tailwind, App Router
- Install core dependencies (gsap, lenis, zod, @gsap/react)
- Implement full Zod schema layer:
  - TransitionMode enum (scrub, snap, section)
  - EaseId enum
  - TransitionConfig with defaults
  - SceneConfig (id, label, frames, imageSequence, overlays, transition override)
  - StorySchema with superRefine frame-continuity validation
- Create sample story configuration for testing
- Unit tests for all schema validation

## Impact
- **New files**: ~15 source files, ~5 test files
- **Affected specs**: scene-composition, transition-modes
- **Dependencies installed**: next, react, gsap, lenis, zod, vitest
- **Build system**: Next.js with TypeScript strict
