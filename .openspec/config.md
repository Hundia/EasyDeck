# OpenSpec Configuration

## Project
- **Name**: ScrollyTelling Presentation Framework
- **Type**: Frontend Library/Framework
- **Language**: TypeScript
- **Runtime**: Node.js / Browser

## Spec Structure
```
spec/
├── specs/                    # Living specifications (truth)
│   ├── canvas-engine/        # Image sequence & playhead
│   ├── transition-modes/     # Section, Snap, Scrub modes
│   ├── scene-composition/    # Scene config, overlays, timelines
│   ├── accessibility/        # Keyboard, reduced-motion, ARIA
│   ├── lenis-integration/    # Smooth scroll integration
│   └── agent-pipeline/       # NarrativeDesigner, SceneComposer
├── changes/                  # Active proposals
│   └── {change-id}/
│       ├── proposal.md
│       ├── tasks.md
│       └── specs/{cap}/spec-delta.md
└── archive/                  # Completed changes
```

## Conventions
- Change IDs: `sprint-{N}-{feature-slug}` (e.g., `sprint-1-canvas-engine`)
- Requirement format: EARS (Easy Approach to Requirements Syntax)
- Scenarios: Given/When/Then format
- All requirements must have at least one scenario
