# Repository Instructions

## Implementation Workflow

- Always use Test-Driven Development (TDD) when implementing features or fixes.
- Follow a vertical red-green-refactor loop: write one failing behavior test, implement the smallest code to pass it, then refactor while tests are green.
- Tests should verify observable behavior through public service/API interfaces, not private implementation details.
- Do not create broad testing plans up front unless explicitly requested; define the next behavior test at the start of each implementation slice.
- Follow OOP principles.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default five-label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo with domain language in root `CONTEXT.md` and ADRs under `docs/adr/` when present. See `docs/agents/domain.md`.
