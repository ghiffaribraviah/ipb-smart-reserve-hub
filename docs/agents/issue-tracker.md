# Issue Tracker: Local Markdown

Issues and PRDs for this repo live as local Markdown files. Do not use GitHub Issues for repository workflow.

## Locations

- PRDs: `docs/prd/PRD-####-slug.md`
- Issues: `docs/issues/ISSUE-####-slug.md`
- Generated issue status index: `docs/issues/STATUS.md`

Individual PRD and issue files are the source of truth. `STATUS.md` is derived from issue frontmatter and can be regenerated.

## Helper Commands

Use the local tracker helper for mechanical operations:

```bash
python .agents/scripts/local_tracker.py next-id prd
python .agents/scripts/local_tracker.py next-id issue
python .agents/scripts/local_tracker.py validate
python .agents/scripts/local_tracker.py status
```

## Publishing

When a skill says "publish to the issue tracker":

- For a PRD, create a schema-valid file in `docs/prd/`.
- For an issue, create a schema-valid file in `docs/issues/`.
- Run `python .agents/scripts/local_tracker.py validate`.
- Regenerate `docs/issues/STATUS.md` after issue changes.

## Fetching

When a skill says "fetch the relevant ticket", read the matching local Markdown file by ID or path.

Examples:

- `PRD-0001` resolves to `docs/prd/PRD-0001-*.md`.
- `ISSUE-0001` resolves to `docs/issues/ISSUE-0001-*.md`.
