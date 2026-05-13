---
id: ISSUE-0043
type: issue
title: Shared workflow and data display boards
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

# ISSUE-0043: Shared workflow and data display boards

## Parent

PRD-0004

## What to build

Implement shared Reservation workflow components and data display components from their reference boards.

## Acceptance criteria

- [x] Reservation workflow components match `Shared - 07 - Reservation Workflow Components`.
- [x] Data display components match `Shared - 08 - Data Display Components`.
- [x] Stepper, Reservation summary, document/payment panels, status panel, Facility card, category shortcut, filter bar, mobile card list, KPI card, governance row, activity log item, and profile card variants are represented.
- [x] Deterministic fixtures are used; no backend API calls are introduced.
- [x] Playwright screenshots verify the boards at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Long filenames, status labels, table-to-card conversions, action rows, and summary rows do not overlap incoherently.

## Blocked By

- ISSUE-0039
- ISSUE-0040

## Implementation Notes

- Use domain terms from `CONTEXT.md` for component prop naming where practical.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0039` and `ISSUE-0040` are done, the workflow/data-display references and component briefs exist, and this can proceed as deterministic visual reference boards with no backend calls.

## Agent Brief

This issue owns shared domain components before product pages use them.

## Update Log

- 2026-05-13: Implemented shared reservation workflow and data display reference boards at `/__reference__/reservation-workflow-components` and `/__reference__/data-display-components`. Added Playwright coverage in `frontend/tests/e2e/workflow-data-display.spec.ts` and verified all represented workflow/data-display variants with deterministic local content. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` (16 passed across all current screenshot specs).
