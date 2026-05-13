---
id: ISSUE-0057
type: issue
title: Staff Reservation detail and decision surfaces
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

# ISSUE-0057: Staff Reservation detail and decision surfaces

## Parent

PRD-0004

## What to build

Implement staff Reservation detail plus review decision dialogs/panels for document, payment, and cancellation review fixtures.

## Acceptance criteria

- [x] Staff Reservation detail matches `Admin - 11 - Reservation Details`.
- [x] Review decision dialogs match `Admin - 12 - Review Decision Dialogs`.
- [x] Detail read model, file rows, review action panel, approve/reject states, rejection reason form, and dialog actions match references.
- [x] No backend API calls are introduced.
- [x] Playwright screenshots verify the page/surfaces at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] File rows, action icons, decision panel, dialog content, rejection text, and button rows do not overlap incoherently.

## Blocked By

- ISSUE-0041
- ISSUE-0042
- ISSUE-0043

## Implementation Notes

- Preserve icon buttons with accessible labels/titles for staff actions.

## Triage Notes

- 2026-05-13: Triaged as an AFK-ready frontend enhancement. `ISSUE-0041`, `ISSUE-0042`, and `ISSUE-0043` are done, the staff reservation detail and review decision dialog page briefs exist, the document status/review decision/reservation summary component briefs exist, and no `.out-of-scope` entry conflicts with this staff review slice. Proceed with deterministic fixture-backed visual implementation only; backend API wiring is out of scope for this issue.

## Agent Brief

**Category:** enhancement
**Summary:** Build staff Reservation detail and review decision surfaces from the Admin 11 and Admin 12 references.

**Current behavior:**
Staff users can reach staff queue/list/schedule pages, but the frontend does not yet provide `/staff/reservations/:reservationId` detail or deterministic visual review decision surfaces for document, payment, and cancellation decisions.

**Desired behavior:**
Staff users should have a deterministic fixture-backed Reservation detail page and decision dialog surface. The detail page should show reservation facts, applicant/facility summary, uploaded file rows, current review status, and approve/reject actions. The decision surface should present a modal/dialog-style rejection flow with summary context, required reason textarea, warning copy, and clear footer actions. Mobile layouts must stack rows/dialog content with full-width actions and no horizontal scrolling.

**Key interfaces:**
- Staff shell route/content composition — detail and dialog surfaces mount inside the staff shell with active `Reservasi` navigation.
- Staff reservation detail fixture read model — includes reservation, facility, applicant, organization/activity, uploaded approval letter/payment evidence, cancellation request, workflow status, and review action labels.
- Document status panel and review decision dialog presentation — long filenames, rejection reason text, badges, and action rows must wrap cleanly on mobile.

**Acceptance criteria:**
- [x] `/staff/reservations/:reservationId` matches `Admin - 11 - Reservation Details` at desktop and mobile viewports.
- [x] Review decision dialog/surface matches `Admin - 12 - Review Decision Dialogs` at desktop and mobile viewports.
- [x] Detail read model, file rows, review action panel, approve/reject states, rejection reason form, and dialog actions match references.
- [x] No backend API calls are introduced; deterministic fixtures drive the page/surface.
- [x] Playwright screenshots cover the page/surfaces at `1440 x 900` and `390 x 844`.
- [x] Mobile `390 x 844` checks show no horizontal overflow.
- [x] File rows, action icons, decision panel, dialog content, rejection text, and button rows do not overlap incoherently.

**Out of scope:**
- Backend API integration for staff detail, file downloads, or review decisions.
- Real modal state persistence beyond deterministic visual routes/states.
- Super Admin escalation or Staff Facility management pages.

## Update Log

- 2026-05-13: Implemented deterministic fixture-backed staff reservation detail and review decision routes at `/staff/reservations/:reservationId` and `/staff/reservations/:reservationId/review-decision`. Added detail read model, file rows, facility/status summary, staff action panel, rejection reason dialog, and desktop/mobile Playwright screenshot coverage. Verified `npm run typecheck`, `npm run lint`, and `npx playwright test` from `frontend/` with 76 passing tests.
