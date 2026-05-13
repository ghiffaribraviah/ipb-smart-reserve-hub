---
id: ISSUE-0041
type: issue
title: Role shells and mobile drawer
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

# ISSUE-0041: Role shells and mobile drawer

## Parent

PRD-0004

## What to build

Implement student, staff, and Super Admin layout shells plus the shared mobile navigation drawer from their shared references and component briefs.

## Acceptance criteria

- [x] Shells match `Shared - 05 - Layout Shells` at desktop and mobile sizes.
- [x] Mobile drawer matches `Shared - 04 - Mobile Navigation Drawer`.
- [x] Student, staff, and Super Admin nav variants use backend role language internally and Indonesian labels visually.
- [x] Deterministic fixture session/profile/notification states are used; no backend API calls are introduced.
- [x] Playwright screenshots verify shells and drawer at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Header actions, search, nav links, drawer content, profile circles, and footers do not overlap incoherently.

## Blocked By

- ISSUE-0039
- ISSUE-0040

## Implementation Notes

- Super Admin uses the indigo accent; student and staff use green shell patterns.
- `Admin - ...` references map to internal `staff` naming.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0039` and `ISSUE-0040` are done, shell and drawer briefs exist, and the implementation can proceed against `Shared - 05 - Layout Shells` plus `Shared - 04 - Mobile Navigation Drawer` with deterministic fixture state.

## Agent Brief

Make this slice reusable enough that product pages can mount content inside the right role shell.

## Update Log

- 2026-05-13: Implemented reusable role shell and mobile drawer previews with deterministic role/session fixtures in `frontend/src/fixtures/layoutShells.ts`, shell components in `frontend/src/components/layout/`, and reference routes `/__reference__/layout-shells` plus `/__reference__/mobile-drawer`. Added Playwright screenshot coverage in `frontend/tests/e2e/layout-shells.spec.ts`. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` (8 passed across all current screenshot specs).
