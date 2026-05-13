---
id: ISSUE-0054
type: issue
title: Staff home and Reservation list pages
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

# ISSUE-0054: Staff home and Reservation list pages

## Parent

PRD-0004

## What to build

Implement staff home and staff Reservation list pages with deterministic queue, status, Facility, student, document, payment, and cancellation review fixtures.

## Acceptance criteria

- [x] Staff home matches `Admin - 00 - Home`.
- [x] Staff Reservation list matches `Admin - 10 - Reservation Lists`.
- [x] Staff shell, review queue cards/tables, filters, mobile card conversion, status badges, and detail actions match references.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Dense rows, filters, mobile cards, badges, and action controls do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0043

## Implementation Notes

- Use Staff Reservation Review Access vocabulary from `CONTEXT.md`.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0041` and `ISSUE-0043` are done, the staff home and reservation list page briefs exist, the staff shell/review table/mobile card/status badge component briefs exist, and no `.out-of-scope` entry conflicts with this staff operations slice. Proceed with deterministic fixture-backed visual implementation only; backend API wiring is out of scope for this issue.

## Agent Brief

**Category:** enhancement
**Summary:** Build staff home and reservation list pages from the Admin 00 and Admin 10 references.

**Current behavior:**
The frontend has shared role shell and data display primitives, but staff users do not yet have the `/staff` verification queue page or `/staff/reservations` reservation list page implemented from the references.

**Desired behavior:**
Staff users should have deterministic fixture-backed operational pages for their review queue and assigned-facility reservation list. The pages should preserve the visual `Admin - ...` reference copy while using internal staff route and role language. Desktop should use dense staff operational layouts, and mobile should convert table-like content into readable cards without horizontal scrolling.

**Key interfaces:**
- Staff shell route/content composition — pages mount inside the existing staff shell with active navigation for home or reservations.
- Staff reservation review read model fixtures — include reservation, facility, student or organization, date/time, workflow/status, and action labels for document, payment, and cancellation review states.
- Status badge and mobile card list presentation — long Indonesian lifecycle/status labels must wrap cleanly and remain text-visible.

**Acceptance criteria:**
- [x] `/staff` matches `Admin - 00 - Home` at desktop and mobile viewports.
- [x] `/staff/reservations` matches `Admin - 10 - Reservation Lists` at desktop and mobile viewports.
- [x] Staff shell, review queue cards/tables, filters, mobile card conversion, status badges, and detail actions match the references.
- [x] No backend API calls are introduced; deterministic fixtures drive the pages.
- [x] Playwright screenshots cover both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Dense rows, filters, mobile cards, badges, and action controls do not overlap incoherently.

**Out of scope:**
- Backend API integration for staff queue or reservation list data.
- Staff reservation detail, facility management, and review decision dialog implementation.
- Auth guard or role redirect behavior beyond mounting the visual staff routes.

## Update Log

- 2026-05-13: Implemented deterministic fixture-backed staff operations pages for `/staff` and `/staff/reservations`, including the compact staff shell, verification queue actions, reservation filters, dense desktop tables, mobile card conversion, status badges, pagination copy, and detail links. Added Playwright screenshot/overflow coverage in `frontend/tests/e2e/staff-home-reservations.spec.ts`. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` (66 passed).
