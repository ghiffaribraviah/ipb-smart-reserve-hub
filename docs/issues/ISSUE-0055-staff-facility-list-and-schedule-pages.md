---
id: ISSUE-0055
type: issue
title: Staff Facility list and schedule pages
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

# ISSUE-0055: Staff Facility list and schedule pages

## Parent

PRD-0004

## What to build

Implement staff assigned Facility list and Facility schedule pages.

## Acceptance criteria

- [x] Staff Facility list matches `Admin - 01 - Facility List`.
- [x] Staff Facility schedule matches `Admin - 02 - Facility Schedule`.
- [x] Assigned Facility rows/cards, schedule calendar, blocked Reservation entries, and row actions match references.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Facility rows, mobile cards, schedule entries, and action buttons do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0042
- ISSUE-0043

## Implementation Notes

- Use Assigned Facility Access vocabulary from `CONTEXT.md`.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0041`, `ISSUE-0042`, and `ISSUE-0043` are done, the staff facility list and facility schedule page briefs exist, the staff shell/facility table/mobile card/public calendar component briefs exist, and no `.out-of-scope` entry conflicts with this assigned-facility slice. Proceed with deterministic fixture-backed visual implementation only; backend API wiring is out of scope for this issue.

## Agent Brief

**Category:** enhancement
**Summary:** Build staff assigned Facility browsing and Facility schedule inspection pages from the Admin 01 and Admin 02 references.

**Current behavior:**
The frontend has shared staff shell, state, calendar, and data display primitives, but staff users do not yet have `/staff/facilities` or `/staff/facilities/:facilityId/schedule` pages implemented from the references.

**Desired behavior:**
Staff users should have deterministic fixture-backed pages for assigned Facility browsing and schedule inspection. The Facility list should show assigned Facility rows/cards with active/inactive status, capacity/category/location facts, and actions to inspect schedule or edit details. The schedule page should show a staff schedule calendar plus blocked Reservation entries using the shared calendar anatomy and mobile-safe card/list layouts.

**Key interfaces:**
- Staff shell route/content composition — Facility pages mount inside the existing staff shell with active `Fasilitas` navigation.
- Assigned Facility fixture read model — includes Facility identity, category, location, capacity, operational status, and schedule/edit destinations.
- Staff schedule fixture read model — includes Facility identity, month/period, blocked Reservation entries, organization/activity labels, time ranges, and status/review labels.
- Public calendar/status/mobile card presentation — calendar cells and schedule entries must fit at `390 x 844` without horizontal overflow.

**Acceptance criteria:**
- [x] `/staff/facilities` matches `Admin - 01 - Facility List` at desktop and mobile viewports.
- [x] `/staff/facilities/:facilityId/schedule` matches `Admin - 02 - Facility Schedule` at desktop and mobile viewports.
- [x] Assigned Facility rows/cards, schedule calendar, blocked Reservation entries, and row actions match references.
- [x] No backend API calls are introduced; deterministic fixtures drive the pages.
- [x] Playwright screenshots cover both pages at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] Facility rows, mobile cards, schedule entries, and action buttons do not overlap incoherently.

**Out of scope:**
- Backend API integration for staff assigned Facility or schedule data.
- Staff Facility edit form implementation.
- Staff reservation detail or review decision behavior beyond schedule/list links.

## Update Log

- 2026-05-13: Implemented deterministic fixture-backed staff Facility pages for `/staff/facilities` and `/staff/facilities/:facilityId/schedule`, including assigned Facility cards, filters, active/perawatan badges, schedule/edit links, month calendar, agenda list, Reservation table/card conversion, and staff shell active Facility navigation. Added Playwright screenshot/overflow coverage in `frontend/tests/e2e/staff-facilities-schedule.spec.ts`. Verified with `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` (70 passed).
