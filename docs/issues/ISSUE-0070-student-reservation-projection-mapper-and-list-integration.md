---
id: ISSUE-0070
type: issue
title: Student Reservation projection mapper and list integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0069
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0070: Student Reservation projection mapper and list integration

## Parent

PRD-0005

## What to build

Create the shared Student Reservation Workflow Projection mapper and wire the Reservation list to real backend data.

## Acceptance criteria

- [x] Shared mapper converts Student Reservation Workflow Projections into canonical labels, badge tones, primary actions, secondary actions, and route targets.
- [x] Reservation list loads the student's Reservations from the backend.
- [x] Cards route to the correct next workflow/detail/review/cancellation page based on the shared mapper.
- [x] Terminal history cards omit cancellation actions.
- [x] Loading, empty, and error states preserve layout stability.
- [x] Mapper tests cover document upload needed, document waiting, document declined, payment upload needed, payment waiting, payment declined, approved, completed without review, completed with review, cancelled, expired, rejected unknown source, and cancellation requested states.
- [x] Reservation list integration tests cover render, route mapping, empty state, and error recovery.
- [x] Reservation list screenshots remain green or are updated only for intentional status normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0069

## Implementation Notes

- This mapper is a dependency for later document, payment, detail, cancellation, and review pages.
- Keep lifecycle status and UI substate mapping centralized.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `status` + `document.review_status` | document route/status | Use shared mapper | Page-local status inference |
| `payment.required/review_status` | payment route/status | Use shared mapper | Payment UI-only enum |
| `rejection.source/reason` | declined route/reason | Document/payment/unknown source handling | New ReservationStatus values |
| `review` | review CTA | Show only when completed and no active review | Duplicate review invite |

## Agent Brief

**Category:** enhancement
**Summary:** Create the shared Student Reservation Workflow Projection mapper and use it to wire `/student/reservations` to `GET /student/reservations`.

**Current behavior:**
`frontend/src/pages/student/StudentReservationListPage.tsx` renders deterministic fixture cards from `frontend/src/fixtures/studentReservationList.ts`. Status labels, badge tones, primary actions, secondary cancellation actions, and route targets are page-local fixture data. There is no shared mapper for later document, payment, detail, review, and cancellation pages to reuse.

**Desired behavior:**
Add a shared frontend mapper that accepts backend `StudentReservationResponse` workflow projections and returns the canonical list/detail workflow view model: status label, badge tone, primary action label/route, optional secondary action label/route, and whether the card belongs in ongoing or history. Then replace the list fixture wiring with a TanStack Query call to `GET /student/reservations`, render mapped cards, and preserve the existing card layout with stable loading, empty, and error states.

**Key interfaces:**
- `GET /student/reservations` returns `StudentReservationResponse[]`.
- Required response fields: `id`, `reservation_code`, `status`, `facility.id/name`, `organization_unit.id/name`, `activity_title`, `starts_at`, `ends_at`, `price_rupiah`, `document.review_status`, `payment.required`, `payment.review_status`, `rejection.source/reason`, `cancellation_reason`, `cancellation_rejection_reason`, and `review`.
- Backend status values include `pending_document_upload`, `pending_document_review`, `pending_payment`, `overdue_verification`, `approved`, `cancellation_requested`, `completed`, `cancelled`, `rejected`, and `expired`.
- Backend document review statuses include `upload_needed`, `waiting_review`, `rejected`, `approved`, and `not_ready`.
- Backend payment review statuses include `not_required`, `upload_needed`, `waiting_review`, `rejected`, `approved`, and `not_ready`.
- Rejection source is `document`, `payment`, or `unknown`.

**Routing expectations:**
- Document upload needed: primary route `/student/reservations/:id/letter`.
- Document waiting: primary route `/student/reservations/:id/verification/waiting`.
- Document declined: primary route `/student/reservations/:id/verification/declined`.
- Payment upload needed: primary route `/student/reservations/:id/payment`.
- Payment waiting: primary route `/student/reservations/:id/payment/waiting`.
- Payment declined: primary route `/student/reservations/:id/payment/declined`.
- Approved: primary route `/student/reservations/:id/accepted`, secondary route `/student/reservations/:id/cancellation`.
- Cancellation requested: primary route `/student/reservations/:id/cancellation-request`.
- Completed without active review: primary route `/student/reservations/:id/review`.
- Completed with review: primary route `/student/reservations/:id`.
- Cancelled, expired, and rejected unknown source: primary route `/student/reservations/:id`; no cancellation action.

**Acceptance criteria:**
- [ ] Shared mapper converts Student Reservation Workflow Projections into canonical labels, badge tones, primary actions, secondary actions, and route targets.
- [ ] Reservation list loads the student's Reservations from the backend.
- [ ] Cards route to the correct next workflow/detail/review/cancellation page based on the shared mapper.
- [ ] Terminal history cards omit cancellation actions.
- [ ] Loading, empty, and error states preserve layout stability.
- [ ] Mapper tests cover document upload needed, document waiting, document declined, payment upload needed, payment waiting, payment declined, approved, completed without review, completed with review, cancelled, expired, rejected unknown source, and cancellation requested states.
- [ ] Reservation list integration tests cover render, route mapping, empty state, and error recovery.
- [ ] Reservation list screenshots remain green or are updated only for intentional status normalization.

**Out of scope:**
- Implementing the downstream document, payment, cancellation, detail, or review page integrations.
- Mutating or cancelling reservations from the list.
- Backend projection changes unless frontend tests expose a contract mismatch.

## Update Log

- 2026-05-13: Triaged to `ready-for-agent`. Verified backend contracts in `app/api/routes/reservation_routes.py`, `app/schemas/reservation_schemas.py`, and `app/services/student_reservation_workflow_projections.py`; current frontend list is fixture-only and lacks a shared mapper.
- 2026-05-13: Implemented and closed. Added `frontend/src/reservations/studentReservationWorkflow.ts` with centralized status/action/route mapping and mapper tests. `frontend/src/pages/student/StudentReservationListPage.tsx` now loads `GET /student/reservations`, maps projections into ongoing/history cards, and renders stable loading, empty, and retry states. Added `frontend/src/pages/student/StudentReservationListPage.test.tsx` and updated `frontend/tests/e2e/student-reservation-list.spec.ts` with backend-shaped fixtures and refreshed intentional screenshots. Verified with `npm test -- --run src/pages/student/StudentReservationListPage.test.tsx src/reservations/studentReservationWorkflow.test.ts`, `npm run typecheck`, `npx playwright test tests/e2e/student-reservation-list.spec.ts --update-snapshots`, and `npx playwright test tests/e2e/student-reservation-list.spec.ts`.
