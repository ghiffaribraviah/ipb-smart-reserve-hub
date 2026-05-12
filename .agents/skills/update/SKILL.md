---
name: update
description: Reconcile local Markdown issue progress with codebase evidence and regenerate issue status indexes. Use when user wants issues kept up to date, checked against implementation, or synchronized with current code.
---

# Update

Conservatively update local Markdown issue progress based on codebase evidence. Do not rewrite product scope or silently change acceptance criteria intent.

## References

- Tracker contract: `docs/agents/issue-tracker.md`
- State schema: `docs/agents/issue-states.md`
- Issue format: `.agents/skills/to-issues/template.md`

## Process

1. Run validation first:

```bash
python .agents/scripts/local_tracker.py validate
```

If validation fails, report the errors and skip unsafe reconciliation for affected files.

2. Read `docs/issues/*.md` and inspect each issue's frontmatter, `## Acceptance criteria`, and existing `## Update Log`.
3. Inspect the codebase and tests for concrete evidence related to each criterion.
4. Run targeted tests only when they are relevant and cheap. Do not run broad or long test suites unless the user asks.
5. Check off acceptance criteria only when implementation or tests provide clear evidence.
6. Move an issue to `status: done` only when all acceptance criteria are checked off or independently verified.
7. Add a dated `## Update Log` entry for every changed issue. Include files, behavior, or test commands that justified the change.
8. Reconcile PRD `issues` lists only when the relationship is mechanical from issue `prd` frontmatter. Do not rewrite PRD narrative sections.
9. Regenerate the status index:

```bash
python .agents/scripts/local_tracker.py status
```

10. Run validation again.

## Conservative Rules

- Leave uncertain issues unchanged.
- Do not invent new acceptance criteria.
- Do not mark ambiguous criteria complete.
- Do not change `blocked_by` or issue scope unless the evidence is direct and mechanical.
- If tests cannot be run or no relevant tests exist, record that limitation instead of overstating confidence.
