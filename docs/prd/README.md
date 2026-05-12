# PRDs

PRDs live in this folder as local Markdown files.

## Naming

Use stable IDs and readable slugs:

```text
PRD-0001-local-markdown-workflow.md
```

Get the next ID with:

```bash
python .agents/scripts/local_tracker.py next-id prd
```

## Frontmatter

Each PRD must start with YAML frontmatter:

```yaml
---
id: PRD-0001
type: prd
title: Local Markdown Workflow
status: active
created: 2026-05-12
updated: 2026-05-12
issues: []
---
```

Allowed `status` values are `draft`, `active`, and `archived`.

The `issues` list is maintained after issues are created from a PRD. Issue files remain the implementation source of truth.

## Template

Use `.agents/skills/to-prd/template.md` as the output reference.
