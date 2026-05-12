# Repository Instructions

## Backend Implementation Workflow

- Always use Test-Driven Development (TDD) when implementing features or fixes.
- Follow a vertical red-green-refactor loop: write one failing behavior test, implement the smallest code to pass it, then refactor while tests are green.
- Tests should verify observable behavior through public service/API interfaces, not private implementation details.
- Do not create broad testing plans up front unless explicitly requested; define the next behavior test at the start of each implementation slice.
- Follow OOP principles.
- Read `/docs` for more context when backend behavior affects frontend, domain language, or documented API contracts.
- When backend behavior or API contracts affect frontend integration, update the affected page brief backend-gap entry in `docs/frontend/per-page-brief/` and update the link/status in `docs/frontend/backend-gaps.md`.
- Do not update `docs/frontend/backend-gaps.md` for backend-only refactors or internal behavior that does not change frontend-facing endpoints, response fields, validation behavior, auth behavior, file workflow, or state projections.

## Frontend Implementation Workflow

- Use the `frontend-implementation` skill when building or modifying frontend screens, translating design references into React/Vite/Tailwind UI, or integrating frontend flows with backend APIs.
- Read `docs/frontend/frontend-stack.md` first for the current stack, testing split, API conventions, and auth/session rules.
- HTML references in `docs/frontend/html-reference/` and screenshots in `docs/frontend/screenshots/` are the mandatory source of truth for design implementation.
- For visual implementation, inspect the relevant current docs: `docs/frontend/DESIGN.md`, `docs/frontend/per-page-brief/`, `docs/frontend/per-component-brief/`, `docs/frontend/backend-gaps.md`, `docs/frontend/missing-design.md`, and the matching HTML/screenshot references.
- Page and component briefs are mandatory pre-implementation inputs. If the relevant brief is missing, create it from the HTML reference and screenshots before writing frontend code.
- Use design-first implementation with deterministic fixtures and Playwright screenshot tests for new pages, new components, or meaningful visual/layout changes.
- Use integration TDD first for existing page backend wiring or small field/state additions, then run or update screenshot checks when visible output changes.
- Verify meaningful UI work across desktop `1440 x 900` and mobile `390 x 844` viewports when a runnable frontend exists.
- During backend integration, replace fixtures with API calls through TDD while preserving the implemented design unless backend behavior requires a missing visible state.
- Internal frontend route/code/docs should use backend role language (`student`, `staff`, `super_admin`), while user-facing copy follows the Indonesian labels in the design references.

## Cross-Cutting Frontend/Backend Contracts

- Page briefs own detailed backend integration needs and backend gap entries for their page.
- `docs/frontend/backend-gaps.md` is an index/ledger that links to page-owned backend gap entries; do not duplicate detailed endpoint/request/response contracts there.
- Backend gap statuses are `open`, `resolved`, `needs-verification`, and `deferred`.
- A backend gap may be marked `resolved` only when current route/schema/service docs or code evidence verifies the contract.
- `docs/frontend/missing-design.md` tracks missing page, state, and component references with `blocking`, `non-blocking`, or `future` severity.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in local Markdown files for this repo. See `docs/agents/issue-tracker.md`.

### Issue states

Triage uses frontmatter fields instead of tracker labels. Issue `status` values are `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`, and `done`. See `docs/agents/issue-states.md`.

### Domain docs

This is a single-context repo with domain language in root `CONTEXT.md` and ADRs under `docs/adr/` when present. See `docs/agents/domain.md`.

### Frontend implementation

Frontend implementation uses the repo-local `frontend-implementation` skill in `.agents/skills/frontend-implementation/SKILL.md`.
