---
name: new-sprint
description: "Plan and scaffold a new sprint — creates the OpenSpec proposal, spec deltas, and tasks.md, then adds it to backlog.md. Use when the user says 'new sprint', 'plan sprint N', 'add sprint', or '/new-sprint'."
argument-hint: "[sprint number] [brief description of the goal]"
---

# New Sprint

Plans and scaffolds a new sprint using the OpenSpec workflow.

## Step 1 — Clarify the Goal

Ask the user (or infer from context):
- What is the sprint goal in one sentence?
- Which capabilities does it touch? (canvas, transition-modes, scene-composition, accessibility, lenis, agent-pipeline)
- Rough task count and complexity?
- Which agent is best suited? (see AGENTS.md)

## Step 2 — Determine Sprint Number

Read `backlog.md` — find the highest sprint number and increment by 1.  
Choose a slug: `sprint-{N}-{feature-name}` (e.g. `sprint-10-viewer-dashboard`).

## Step 3 — Create OpenSpec Proposal

Invoke `openspec-proposal-creation` skill with:
- Sprint goal
- Affected capabilities
- Draft task list

This produces `spec/changes/{change-id}/proposal.md` and `spec/changes/{change-id}/specs/{cap}/spec-delta.md`.

## Step 4 — Write tasks.md

Create `spec/changes/{change-id}/tasks.md` with numbered tasks matching the proposal.  
Each task must have:
- Clear implementation requirement
- Acceptance criteria
- Estimated complexity (Low / Medium / High)

## Step 5 — Add to backlog.md

Append the new sprint section to `backlog.md` following the existing format:

```markdown
## Sprint {N}: {Title}
**Goal**: {one-sentence goal}
**Estimated complexity**: {Low/Medium/High} | **Agent**: {Sonnet 4.6 / Opus 4.7}

### Tasks
1. [ ] Task 1
2. [ ] Task 2
...

### Acceptance Criteria
- Criterion 1
- Criterion 2
```

## Step 6 — Confirm

Show the user the new sprint entry and proposal summary before committing.  
Commit with: `docs(sprint-{N}): scaffold new sprint — {title}`

## Quick Reference — Capability Owners

| Capability | Spec file |
|-----------|-----------|
| Canvas / playhead | `spec/specs/canvas-engine/spec.md` |
| Transition modes | `spec/specs/transition-modes/spec.md` |
| Scene composition / schemas | `spec/specs/scene-composition/spec.md` |
| Accessibility | `spec/specs/accessibility/spec.md` |
| Lenis integration | `spec/specs/lenis-integration/spec.md` |
| Agent pipeline | `spec/specs/agent-pipeline/spec.md` |
