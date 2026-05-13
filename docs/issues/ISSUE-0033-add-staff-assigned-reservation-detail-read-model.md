---
id: ISSUE-0033
type: issue
title: Add staff assigned-reservation detail read model
status: done
category: enhancement
agent_mode: AFK
area:
  - backend
  - staff-operations
prd: PRD-0003
blocked_by:
  - ISSUE-0032
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0033: Add staff assigned-reservation detail read model

## Parent

PRD-0003

## What to build

Add a staff assigned-reservation detail contract that returns all operational facts needed by the staff reservation detail page and pairs cleanly with existing document, payment, and cancellation review actions.

## Acceptance criteria

- [x] Staff can fetch detail for a Reservation connected to an assigned Facility.
- [x] Detail response includes student, Organization Unit, Facility, schedule, Reservation status, Reservation code, activity details, participant/contact data, and Reservation Extra Requirements.
- [x] Detail response includes document metadata, document review status, payment requirement, payment receipt metadata, payment review status, cancellation request state, and rejection/cancellation reasons where applicable.
- [x] Missing document and receipt metadata are represented as null values, not synthesized filenames or dates.
- [x] Detail response contains enough identifiers/status data for the existing approve/reject/download endpoints to be used by the frontend.
- [x] Staff cannot fetch detail for unassigned Facility Reservations.
- [x] Non-staff users cannot access the staff reservation detail endpoint.
- [x] Frontend backend gap documentation updates `BG-STAFF-11-01` when implemented.

## Blocked By

- ISSUE-0032

## Implementation Notes

- Reuse the assigned-reservation read-model concepts from ISSUE-0032.
- Do not rebuild document, payment, or cancellation approve/reject routes.
- Keep owner/access denials observable through public API outcomes.

## Triage Notes

2026-05-13: Triaged as a backend/staff-operations enhancement now unblocked by ISSUE-0032. Existing staff review mutation/download routes exist, and ISSUE-0032 added assigned-staff queue/list read models; this issue should add the assigned-reservation detail GET contract without rebuilding review actions.

## Agent Brief

Implement through vertical TDD against the public staff API.

Scope:

- Add `GET /staff/reservations/{reservation_id}` for staff assigned to the Reservation Facility.
- Reuse the assigned-reservation projection language from ISSUE-0032 and extend it with detail facts: student, Organization Unit, Facility, schedule, status/code, activity details, participant/contact data, extra requirements, document/payment/cancellation metadata, review states, and reasons.
- Represent missing signed approval letter and payment receipt metadata as `null`.
- Preserve existing approve/reject/download endpoints as the write/download paths; the detail response should expose reservation ID/status data needed to call them.
- Enforce assigned-facility scope and staff-only access.
- Update `BG-STAFF-11-01` when implemented.

Suggested first behavior test:

- Assigned staff can fetch a pending document review Reservation detail and receives detail fields plus null file metadata when files are absent.

Evidence to record when closing:

- Targeted API tests for assigned detail, missing metadata nulls, unassigned not found/denied behavior, and non-staff denial.
- Documentation update in `staff-11-reservation-details.md` and backend gap ledger.

## Update Log

2026-05-13: Implemented and verified staff assigned-reservation detail read model.

- Code evidence: `app/api/routes/staff_reservation_operation_routes.py` adds `GET /staff/reservations/{reservation_id}`; `app/services/staff_reservation_operations.py` projects detail facts, null missing file metadata, payment receipt metadata, cancellation state, and existing review action URLs; `app/repositories/staff_reservation_operations_repository.py` loads details only for assigned staff.
- API behavior evidence: `tests/test_staff_reservation_operations.py` verifies assigned detail access, student/org/facility/schedule/activity/extra requirement fields, null missing file metadata, payment receipt metadata, unassigned staff not found, and non-staff forbidden behavior.
- Wiring evidence: `tests/test_http_application.py` verifies the detail route is registered through the runtime dependency registry and default app build.
- Documentation evidence: `docs/frontend/per-page-brief/staff-11-reservation-details.md`, `docs/frontend/backend-gaps.md`, and `README.md` document the implemented staff detail contract.
- Test command: `uv run pytest tests/test_staff_reservation_operations.py tests/test_http_application.py` passed with 11 tests.
