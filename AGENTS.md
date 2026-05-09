# Repository Instructions

## Backend Implementation Workflow

- Always use Test-Driven Development (TDD) when implementing features or fixes.
- Follow a vertical red-green-refactor loop: write one failing behavior test, implement the smallest code to pass it, then refactor while tests are green.
- Tests should verify observable behavior through public service/API interfaces, not private implementation details.
- Do not create broad testing plans up front unless explicitly requested; define the next behavior test at the start of each implementation slice.
- Follow OOP principles.
- Read /docs for more context if needed (especially in frontend)

## Frontend Implementation Workflow

- Use the `frontend-implementation` skill when building or modifying frontend screens, translating design references into React/Vite/Tailwind UI, or integrating frontend flows with backend APIs.
- For visual implementation, inspect `docs/frontend/IPB RSH Design/`, `docs/frontend/DESIGN.md`, `docs/frontend/emerald_reserve_design_system_specification.md`, and `docs/frontend/frontend-architecture.md`.
- Verify meaningful UI work with screenshot checks across desktop and mobile viewports when a runnable frontend exists.
- For backend integration, also use the `tdd` skill and keep visual changes minimal unless the backend behavior requires a visible state.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Triage uses the default five-label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo with domain language in root `CONTEXT.md` and ADRs under `docs/adr/` when present. See `docs/agents/domain.md`.

### Frontend implementation

Frontend implementation uses the repo-local `frontend-implementation` skill in `.agents/skills/frontend-implementation/SKILL.md`.
