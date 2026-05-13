---
id: ISSUE-0051
type: issue
title: Student Reservation list page
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0041
  - ISSUE-0043
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0051: Student Reservation list page

## Parent

PRD-0004

## What to build

Implement the student Reservation list page with deterministic ongoing, waiting, declined, completed, cancelled, and history fixtures.

## Acceptance criteria

- [x] Page matches `Student - 10 - Reservation List` at desktop and mobile sizes.
- [x] Reservation cards show realistic mixed statuses and correct fixture actions.
- [x] Ongoing, pending, terminal, and history sections match the reference.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify the page at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Long status badges, images, metadata, and action buttons do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0043

## Implementation Notes

- Use Facility Reservation Lifecycle and Student Reservation Workflow Projections vocabulary from `CONTEXT.md`.

## Triage Notes

- 2026-05-13: Triaged as `ready-for-agent` / `AFK`. Blockers ISSUE-0041 and ISSUE-0043 are complete; the student reservation list page brief, HTML reference, and desktop/mobile screenshots exist; backend gap BG-STUDENT-10-01 is resolved; and this slice is deterministic frontend work with no backend API dependency.

## Agent Brief

This page can be implemented independently once shared list/card components exist.

## Update Log

- 2026-05-13: Implemented deterministic `/student/reservations` page with ongoing and history tabs, mixed lifecycle statuses, terminal history cards without cancellation actions, and fixture-only routing. Added `frontend/src/fixtures/studentReservationList.ts`, `frontend/src/pages/student/StudentReservationListPage.tsx`, route wiring in `frontend/src/App.tsx`, and Playwright coverage in `frontend/tests/e2e/student-reservation-list.spec.ts` with desktop/mobile screenshots and mobile overflow assertions. Verified with `npm run typecheck`, `npm run lint`, targeted `npx playwright test tests/e2e/student-reservation-list.spec.ts --update-snapshots`, and full `npx playwright test` (`52 passed`).
