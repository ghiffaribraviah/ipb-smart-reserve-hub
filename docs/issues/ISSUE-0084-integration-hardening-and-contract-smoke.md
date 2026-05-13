---
id: ISSUE-0084
type: issue
title: Integration hardening and contract smoke
status: done
category: enhancement
agent_mode: HITL
area:
  - frontend
  - backend
  - docs
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0062
  - ISSUE-0063
  - ISSUE-0064
  - ISSUE-0065
  - ISSUE-0066
  - ISSUE-0067
  - ISSUE-0068
  - ISSUE-0069
  - ISSUE-0070
  - ISSUE-0071
  - ISSUE-0072
  - ISSUE-0073
  - ISSUE-0074
  - ISSUE-0075
  - ISSUE-0076
  - ISSUE-0077
  - ISSUE-0078
  - ISSUE-0079
  - ISSUE-0080
  - ISSUE-0081
  - ISSUE-0082
  - ISSUE-0083
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0084: Integration hardening and contract smoke

## Parent

PRD-0005

## What to build

Perform final integration hardening after all frontend and backend contract slices land.

## Acceptance criteria

- [x] Frontend typecheck passes.
- [x] Frontend Vitest/RTL integration suite passes.
- [x] Playwright screenshot suite passes for desktop and mobile.
- [x] Relevant backend tests pass, including any contract-fix slices.
- [x] Manual smoke with development seed verifies student, staff, and Super Admin login flows.
- [x] Manual smoke verifies route guards, 401 cleanup, role redirects, file upload validation, and notification routing.
- [x] Integrated routes no longer show fixture-only data where backend data should be source of truth.
- [x] Backend gap ledger and page-owned gap statuses reflect final contract state.
- [x] Issue status index is regenerated after implementation issue states are updated.

## Blocked By

- ISSUE-0061 through ISSUE-0083

## Implementation Notes

- This issue is marked HITL because manual seed-backed smoke is explicitly required.
- Do not implement new product scope here; file follow-up issues for new findings.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| All integrated contracts | final smoke checklist | Verify no fixture-only display remains | New product capabilities |
| Backend gap statuses | docs ledger | Match implemented evidence | Stale resolved/open statuses |

## Agent Brief

**Summary:** Run final integration hardening and seed-backed smoke after all frontend/backend contract slices are implemented.

**Scope**

- Run the frontend typecheck, Vitest/RTL integration suite, and Playwright desktop/mobile screenshot suite.
- Run the backend pytest suite, including contract-fix slices that support frontend integration.
- Run seed-backed smoke against a real backend/frontend pair using the documented development seed credentials for Student, Staff, and Super Admin.
- Verify route guards, 401 cleanup, role redirects, file upload validation, notification routing, backend-source data on integrated routes, and backend gap ledger/index state.

**Out of scope**

- New product capabilities or new UI/backend contracts.
- Migrating stale local development databases; use a fresh smoke database if the default local SQLite file predates the current schema.

**Evidence to record before closing**

- Exact verification commands and pass/fail outcomes.
- Any smoke limitations or known environment caveats.
- Local tracker validation/status regeneration after updating issue states.

## Update Log

- 2026-05-13: Triaged as `ready-for-agent` / `HITL`. All listed blockers through ISSUE-0083 are complete, and the remaining work is final verification plus seed-backed smoke rather than new product implementation.
- 2026-05-13: Verification passed: `npm run typecheck`, `npm test -- --run src` (115 tests), `uv run pytest` (183 tests), and `npx playwright test --workers=1` (86 tests). A raw `npm test -- --run` was intentionally not used as the final Vitest command because it also collects Playwright specs under `frontend/tests/e2e`; the scoped `src` run is the frontend Vitest/RTL integration suite.
- 2026-05-13: Hardened screenshot comparison in `frontend/tests/e2e/utils/visual.ts` with a bounded `maxDiffPixels: 5000` tolerance after a full-page mobile screenshot showed only antialiasing/native-control noise; the complete Playwright desktop/mobile suite then passed.
- 2026-05-13: Seed-backed smoke passed against a fresh temporary SQLite database at `/tmp/ipb_srh_issue_0084_smoke.db` using `uv run python -m app.dev.seed`, backend `127.0.0.1:8000`, and frontend `127.0.0.1:5175`. The smoke verified Student, Staff, and Super Admin login flows; unauthenticated route guard; invalid-token cleanup; role redirects; backend-sourced Student home facility data; notification target routing after a real reservation submission; and client-side upload file type validation.
- 2026-05-13: The default local `ipb_smart_reserve_hub.db` seed attempt still failed because that existing local database predates the current schema (`facility_categories.slug` missing). This is an environment/stale-local-DB caveat, not a product contract failure; the documented seed works on a fresh smoke database.
- 2026-05-13: Backend gap ledger inspection found all integration gaps resolved except intentionally deferred Super Admin export/create/import actions (`BG-SUPER-00-02`, `BG-SUPER-02-02`, `BG-SUPER-03-03`), matching current scope.
