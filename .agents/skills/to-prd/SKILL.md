---
name: to-prd
description: Turn the current conversation context into a local Markdown PRD. Use when user wants to create a PRD from the current context.
---

# To PRD

Synthesize a PRD from the current conversation context and codebase understanding. Do not run a long interview. Use one narrow checkpoint before writing the file.

## References

- Tracker contract: `docs/agents/issue-tracker.md`
- Domain docs: `docs/agents/domain.md`
- Output template: `template.md`

## Process

1. Explore the repo enough to understand the current state. Use the project's domain glossary vocabulary and respect ADRs in the touched area.
2. Sketch the major modules likely to be built or modified. Look for deep modules with small, testable interfaces.
3. Present the proposed modules and testing decisions to the user for one approval/edit pass.
4. Get the next PRD ID:

```bash
python .agents/scripts/local_tracker.py next-id prd
```

5. Write the PRD to `docs/prd/PRD-####-slug.md` using `template.md`.
6. Set frontmatter:
   - `type: prd`
   - `status: active`
   - `created` and `updated` to today's date
   - `issues: []` unless issues already exist
7. Validate:

```bash
python .agents/scripts/local_tracker.py validate
```

## PRD Body Rules

- Include the standard sections from `template.md`.
- Do not include specific file paths or code snippets in implementation decisions; they go stale quickly.
- User stories should be extensive and use the format: `As an <actor>, I want <feature>, so that <benefit>.`
- Testing decisions should emphasize observable behavior through public service/API interfaces.
- End by saying the PRD is ready to break down with `to-issues`; do not automatically create issues.
