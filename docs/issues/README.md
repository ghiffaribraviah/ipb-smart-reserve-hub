# Issues

Issues live in this folder as local Markdown files. Individual issue files are the source of truth.

## Naming

Use stable IDs and readable slugs:

```text
ISSUE-0001-create-local-tracker-contract.md
```

Get the next ID with:

```bash
python .agents/scripts/local_tracker.py next-id issue
```

## Frontmatter

Each issue must start with YAML frontmatter:

```yaml
---
id: ISSUE-0001
type: issue
title: Create local tracker contract
status: needs-triage
category: enhancement
agent_mode: AFK
area:
  - docs
prd: PRD-0001
blocked_by: []
created: 2026-05-12
updated: 2026-05-12
---
```

Allowed `status` values are documented in `docs/agents/issue-states.md`.

`blocked_by` is authoritative for dependencies. Reverse dependency views can be generated later if needed.

## Canonical Sections

Issue files should use these sections when relevant:

- `## Parent`
- `## What to build`
- `## Acceptance criteria`
- `## Blocked By`
- `## Implementation Notes`
- `## Triage Notes`
- `## Agent Brief`
- `## Update Log`

History sections are append-only unless the user explicitly asks to rewrite them.

## Status Index

`docs/issues/STATUS.md` is generated from issue frontmatter:

```bash
python .agents/scripts/local_tracker.py status
```

If `STATUS.md` conflicts with issue frontmatter, issue frontmatter wins.

## Template

Use `.agents/skills/to-issues/template.md` as the output reference.
