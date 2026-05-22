# ScrollyTelling Presentation Framework

## Project Overview
A React/Next.js scrollytelling presentation engine using GSAP, Lenis, and canvas-based image sequences.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Animation**: GSAP (ScrollTrigger, Observer, useGSAP)
- **Smooth Scroll**: Lenis
- **Canvas**: HTML5 Canvas for image sequence playback
- **Schema**: Zod for configuration validation
- **Styling**: Tailwind CSS
- **Language**: TypeScript (strict)

## Architecture
- Three transition modes: `section` (default), `snap`, `scrub`
- Playhead-agnostic ImageSequenceCanvas (decoupled from scroll position)
- Observer-driven section mode (fullPage.js-like, one gesture = one scene)
- Agent pipeline: NarrativeDesigner → SceneComposer → Renderer

## Development Workflow
- **Methodology**: OpenSpec (spec-driven development)
- **Sprints**: Use `/run-sprint` skill to execute sprint items
- **Orchestration**: Main context orchestrates, delegates to agents (Sonnet 4.6 for 200k window tasks, GPT Codex 5.3 for 400k window tasks)
- **Planning**: Use `openspec-proposal-creation` for new features
- **Implementation**: Use `openspec-implementation` for executing tasks

## Key Rules
1. Always validate schemas with Zod before rendering
2. Accessibility is NOT optional — keyboard nav, reduced-motion, ARIA required
3. Section mode is the DEFAULT transition — scrub/snap are opt-in
4. Lenis MUST be paused during section-mode stages
5. Frame continuity: adjacent scenes must share frame boundaries in section mode
6. Test incrementally — never batch multiple tasks before testing

## File Structure
```
/opt/dept_pres/
├── CLAUDE.md              # This file
├── backlog.md             # Sprint backlog and execution plan
├── requirnments.md        # Original requirements document
├── docs/                  # Documentation hierarchy
├── spec/                  # OpenSpec specifications
│   ├── specs/             # Living specifications
│   └── changes/           # Active change proposals
├── src/                   # Source code (to be created)
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── lib/               # Utilities, schemas, hooks
│   └── styles/            # Global styles
└── .openspec/             # OpenSpec configuration
```

## Agent Delegation Strategy
- **Opus 4.6**: Planning, architecture decisions, complex reasoning (expensive, use wisely)
- **Sonnet 4.6**: Implementation tasks (200k context window)
- **GPT Codex 5.3**: Large file operations, bulk code generation (400k context window)
- **Haiku 4.5**: Quick lookups, file searches, simple edits

## Sprint Execution
Run sprints with the `/run-sprint` command. Each sprint:
1. Loads sprint tasks from backlog.md
2. Creates openspec proposals for each feature
3. Implements tasks sequentially with validation
4. Tests each task before marking complete
