---
name: to-issues
description: Break a plan, spec, or PRD into local Markdown issues using tracer-bullet vertical slices. Use when user wants to convert a plan into implementation issues.
---

# To Issues

Break a plan into independently grabbable local Markdown issues using vertical slices.

## References

- Tracker contract: `docs/agents/issue-tracker.md`
- State schema: `docs/agents/issue-states.md`
- Domain docs: `docs/agents/domain.md`
- Output template: `template.md`

## Process

### 1. Gather Context

Work from the conversation context. If the user passes a PRD ID, issue ID, or file path, read the matching local Markdown file.

### 2. Explore The Codebase

Explore enough code to understand the current state. Use the project's domain glossary vocabulary and respect ADRs.

### 3. Draft Vertical Slices

Draft tracer-bullet issues. Each issue must be a thin vertical slice through all relevant integration layers, not a horizontal slice of one layer.

For each proposed slice, show:

- **Title**
- **Type**: `HITL` or `AFK`
- **Blocked by**
- **User stories covered**, if the source material has them

Ask the user to approve granularity, dependencies, and HITL/AFK markings before writing files.

### 4. Publish Local Issue Files

After approval:

1. Get IDs in dependency order:

```bash
python .agents/scripts/local_tracker.py next-id issue
```

2. Create `docs/issues/ISSUE-####-slug.md` files using `template.md`.
3. Use frontmatter for source-of-truth metadata:
   - `status: needs-triage`
   - `category: bug` or `enhancement`
   - `agent_mode: AFK`, `HITL`, or `TBD`
   - `area` as broad advisory areas
   - `prd` when created from a PRD
   - `blocked_by` with issue IDs
4. If issues are created from a PRD, update the PRD frontmatter `issues` list.
5. Validate and regenerate the status index:

```bash
python .agents/scripts/local_tracker.py validate
python .agents/scripts/local_tracker.py status
```

Do not close or modify parent PRD narrative sections.
