# IPB Smart Reserve Hub Issue Loop

Use this with `/goal` to work through local Markdown issues in this repo.

## Goal

Handle the issue or issues named by the user one at a time. Do not start the next issue until the current one is done, blocked, or explicitly deferred.

## Core Context

- Issues: `docs/issues/ISSUE-####-slug.md`
- PRDs: `docs/prd/PRD-####-slug.md`
- Tracker rules: `docs/agents/issue-tracker.md`
- Status values: `docs/agents/issue-states.md`
- Domain language: `CONTEXT.md` and any relevant `docs/adr/`
- Frontend contracts/design: `docs/frontend/`

## Loop

For each issue:

1. Read context first.
   - Read the issue, its parent PRD if referenced, `CONTEXT.md`, and any relevant ADR.
   - Check `docs/agents/issue-tracker.md` and `docs/agents/issue-states.md` when touching tracker state.
   - For frontend work, also read `docs/frontend/frontend-stack.md`, `DESIGN.md`, the relevant page/component briefs, matching HTML reference, screenshots, `backend-gaps.md`, and `missing-design.md`.

2. Confirm readiness.
   - Implement only issues with `status: ready-for-agent` and no unresolved `blocked_by`, unless the user explicitly overrides.
   - If status, dependencies, or required details are unclear, use `triage` and stop if the issue cannot be made ready.

3. Implement the smallest vertical slice.
   - Backend work: use `tdd`; write one failing behavior test through a public API/service, make it pass, then refactor.
   - Frontend screen or integration work: use `frontend-implementation`; preserve the reference design and update/create required briefs first if missing.
   - Keep terminology aligned with `CONTEXT.md` and follow existing project patterns.

4. Maintain contracts when they change.
   - If backend behavior affects frontend endpoints, response fields, validation, auth, file workflow, or state projections, update the affected page brief backend-gap entry.
   - Update `docs/frontend/backend-gaps.md` only as the index/status ledger for frontend-facing backend gaps.
   - Do not touch backend-gap docs for backend-only refactors.

5. Verify and close.
   - Run focused tests plus the relevant broader backend/frontend/tracker checks.
   - For meaningful UI changes, verify desktop `1440 x 900` and mobile `390 x 844`.
   - Append implementation notes, verification commands, and risks to the issue.
   - Set `status: done`, regenerate `docs/issues/STATUS.md` with `python .agents/scripts/local_tracker.py status`, then run `python .agents/scripts/local_tracker.py validate`.

## Rules

- Work on exactly one issue at a time.
- Never mark an issue done without verification or a written reason verification was not practical.
- Never revert unrelated user changes.
- If requirements are missing, return to triage instead of guessing.

## Final Report

Report completed issues, blocked/deferred issues, files changed, commands run, and follow-up risks.
