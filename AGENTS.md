# Agent Orchestration Configuration

## Model Selection Guide

| Task Type | Model | Rationale |
|-----------|-------|-----------|
| Schema work (Zod) | Sonnet 4.6 | Mechanical, well-documented patterns |
| Component implementation | Sonnet 4.6 | Standard React/GSAP patterns |
| Complex cross-cutting logic | Sonnet 4.6 | Needs judgment (Observer + Lenis + a11y) |
| Large bulk generation | GPT Codex 5.3 | 400k context handles large files |
| Architecture decisions | Opus 4.6 | Deep reasoning (use sparingly) |
| Quick lookups/searches | Haiku 4.5 | Fast and cheap |

## Orchestration Rules

1. **Main context = orchestrator only** — never implement heavy code here
2. **Provide full context** to each delegated agent (files, requirements, constraints)
3. **Parallel when possible** — independent tasks run simultaneously
4. **Validate always** — test after each task completion
5. **Clean context** — keep main thread for planning and coordination

## Sprint Execution Pattern

```
Orchestrator (this context):
├── Read sprint from backlog.md
├── Create openspec proposal
├── For each task group:
│   ├── Launch agent(s) with full context
│   ├── Wait for completion
│   ├── Validate output (test/build)
│   └── Mark complete or retry
└── Update backlog.md
```

## Agent Prompt Requirements

Every agent prompt MUST include:
- Project path: `/opt/dept_pres/`
- Tech stack context (Next.js, GSAP, Lenis, Zod, TypeScript)
- The specific requirement being implemented (from spec)
- File paths of dependencies
- Acceptance criteria
- Constraints (TypeScript strict, accessibility required, etc.)
