---
name: run-sprint
description: "Execute the next incomplete sprint from backlog.md. Reads sprint tasks, creates OpenSpec proposal if missing, implements each task sequentially with testing, then marks complete. Use whenever the user says 'run sprint', 'execute sprint N', or '/run-sprint'."
argument-hint: "[sprint number — omit to auto-detect next incomplete sprint]"
---

# Run Sprint

Executes a sprint from `backlog.md` using the OpenSpec + agent pipeline workflow.

## Project Context

- **Repo**: `/opt/dept_pres/`
- **Backlog**: `backlog.md` — source of truth for sprint tasks and status
- **Specs**: `spec/changes/sprint-{N}-{slug}/` — proposals and task lists
- **Tests**: `npm test` (Vitest unit + integration), `npm run type-check`
- **Deploy**: `NEXT_OUTPUT=export npm run build`

## Step 1 — Identify the Sprint

If no sprint number was given, scan `backlog.md` for the first sprint that:
- Has tasks without a `[x]` check  
- Does **not** have an `IMPLEMENTED` file at `spec/changes/sprint-{N}-*/IMPLEMENTED`

Read the sprint's **Goal**, **Tasks**, and **Acceptance Criteria** fully before proceeding.

## Step 2 — Create or Load the OpenSpec Proposal

Check if `spec/changes/sprint-{N}-{slug}/proposal.md` exists.

- **Exists**: read it and the companion `tasks.md`
- **Missing**: invoke `openspec-proposal-creation` skill with the sprint goal + tasks as input

The proposal must contain:
- Change ID matching `sprint-{N}-{slug}`
- Spec deltas for each capability affected
- Numbered task list aligned to `backlog.md`

## Step 3 — Execute Tasks Sequentially

**Never batch multiple tasks before testing.** For each task:

```
1. Read the task requirement from tasks.md and backlog.md
2. Read all files you'll touch before editing (no blind writes)
3. Implement the minimum code that satisfies the task
4. Run: npm run type-check
5. Run: npm test  (or the specific test file for this task)
6. If tests fail → diagnose and fix before moving to next task
7. Mark the task complete in backlog.md: [ ] → [x]
8. Git commit the task: "feat(sprint-N): <short description>"
```

### Agent Delegation Rules (from AGENTS.md)

| Task type | Use |
|-----------|-----|
| Schema / Zod work | Sonnet 4.6 inline |
| React component implementation | Sonnet 4.6 inline |
| Complex cross-cutting logic (Observer + Lenis + a11y) | Sonnet 4.6, read all affected files first |
| Architecture decisions | Pause and confirm with user |
| Quick file lookups | Read tool directly |

**Main context = orchestrator.** Delegate heavy implementation to sub-agents (Agent tool) when a task spans >3 files and >150 lines. Always pass full context: project path, tech stack, file paths, acceptance criteria.

## Step 4 — Validate the Sprint

After all tasks are complete:

```bash
npm run type-check          # Must pass clean
npm test                    # All tests green
NEXT_OUTPUT=export npm run build   # Static export must succeed
```

If any check fails, fix it before marking the sprint done.

## Step 5 — Mark Sprint Complete

```bash
# Create the IMPLEMENTED marker
touch spec/changes/sprint-{N}-{slug}/IMPLEMENTED

# Final commit
git add -A
git commit -m "feat(sprint-{N}): <sprint title> — all tasks complete"
```

Update `backlog.md`: check all sprint tasks `[x]` and add `✅` to the sprint header.

## Key Constraints (never skip)

1. `npm run type-check` must pass after every task — no `any` escapes
2. Accessibility is not optional — keyboard nav, reduced-motion, ARIA required
3. `section` mode is the DEFAULT — scrub/snap are opt-in
4. Lenis MUST be paused in `SectionStage` via `useLenisPause()`
5. Frame continuity: adjacent section-mode scenes must share boundary frames
6. Zod parse before render — never bypass `StorySchema.parse()`

## Example Invocations

```
/run-sprint          → auto-detects next incomplete sprint
/run-sprint 10       → runs sprint 10 specifically
/run-sprint 10 3     → resumes sprint 10 starting at task 3
```
