---
id: ISSUE-0048
type: issue
title: Student Reservation time and details pages
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0004
blocked_by:
  - ISSUE-0041
  - ISSUE-0042
  - ISSUE-0043
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0048: Student Reservation time and details pages

## Parent

PRD-0004

## What to build

Implement the first two student Reservation creation steps: time selection and detail form.

## Acceptance criteria

- [x] Time form matches `Student - 03 - Reservation Time Form` at desktop and mobile sizes.
- [x] Detail form matches `Student - 04 - Reservation Detail Form` at desktop and mobile sizes.
- [x] Stepper, calendar, time slots, Reservation summary, Organization Unit selection, extra requirements, and policy box match references.
- [x] Continue and back navigation are represented with deterministic fixture state.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Step labels, calendar controls, form rows, checkbox rows, summary cards, and action buttons do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0042
- ISSUE-0043

## Implementation Notes

- Use Reservation Time Selection and Reservation Extra Requirements vocabulary from `CONTEXT.md`.

## Triage Notes

- 2026-05-13: Triaged as `ready-for-agent` / `AFK`. Blockers ISSUE-0041, ISSUE-0042, and ISSUE-0043 are complete, both reservation step page briefs and HTML/screenshot references exist, and the slice is deterministic frontend work with no backend API dependency.

## Agent Brief

This is a tightly coupled two-step slice because the detail page depends on the selected time summary.

## Update Log

- 2026-05-13: Implemented the reservation time and detail routes with deterministic Reservation Time Selection and Reservation Extra Requirements fixtures in `frontend/src/fixtures/studentReservationCreate.ts`, page implementations in `frontend/src/pages/student/StudentReservationCreatePages.tsx`, and route wiring in `frontend/src/App.tsx`. Added Playwright coverage and screenshots in `frontend/tests/e2e/student-reservation-create.spec.ts` for both pages at desktop `1440 x 900` and mobile `390 x 844`, including stepper content, calendar/time fields, summary/policy surfaces, deterministic continue/back links, and mobile horizontal-overflow checks. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` (`34 passed`).
