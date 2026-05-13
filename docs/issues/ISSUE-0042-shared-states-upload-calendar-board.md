---
id: ISSUE-0042
type: issue
title: Shared states upload and calendar board
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0039
  - ISSUE-0040
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0042: Shared states upload and calendar board

## Parent

PRD-0004

## What to build

Implement shared data/auth states and upload/calendar states from the shared reference boards.

## Acceptance criteria

- [x] Data and auth states match `Shared - 02 - Data And Auth States`.
- [x] Upload and calendar states match `Shared - 03 - Upload And Calendar States`.
- [x] Loading, empty, error, denied, upload progress, validation error, selected, unavailable, and conflict states are represented with deterministic fixtures.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify the boards at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] State panels, upload controls, error text, calendar cells, and badges do not overlap incoherently.

## Blocked By

- ISSUE-0039
- ISSUE-0040

## Implementation Notes

- Keep auth/session states visual only; real guards belong to later integration work.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0039` and `ISSUE-0040` are done, the shared state references and component briefs exist, and implementation can proceed with deterministic visual-only fixtures and screenshot coverage.

## Agent Brief

Focus on reusable states that page slices can compose when fixture states require loading, empty, denied, error, upload, or calendar variants.

## Update Log

- 2026-05-13: Implemented shared data/auth and upload/calendar state boards at `/__reference__/data-auth-states` and `/__reference__/upload-calendar-states`, with deterministic fixtures in `frontend/src/fixtures/sharedStates.ts` and Playwright coverage in `frontend/tests/e2e/shared-states.spec.ts`. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` (12 passed across all current screenshot specs).
