---
id: ISSUE-0032
type: issue
title: Add staff assigned-reservation queue and list read models
status: done
category: enhancement
agent_mode: AFK
area:
  - backend
  - staff-operations
prd: PRD-0003
blocked_by: []
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0032: Add staff assigned-reservation queue and list read models

## Parent

PRD-0003

## What to build

Add staff-facing assigned-reservation read models for the verification queue and reservation list. The queue should show actionable document, payment, and cancellation review work. The list should show staff-visible Reservations for assigned Facilities with useful operational filters.

## Acceptance criteria

- [x] Staff can fetch a verification queue containing only actionable document, payment, and cancellation review items for assigned Facilities.
- [x] Queue items include Reservation identity/code, Facility, student, Organization Unit, activity time, workflow type, lifecycle/review status, and due-time fields where applicable.
- [x] Staff can fetch an assigned-reservation list with mixed workflow states for assigned Facilities.
- [x] Reservation list responses expose lifecycle status plus document, payment, and cancellation review states.
- [x] Reservation list supports operational filters for status, Facility, and date range.
- [x] Staff cannot see unassigned Facility Reservations through queue or list endpoints.
- [x] Non-staff users cannot access staff reservation queue/list endpoints.
- [x] Frontend backend gap documentation updates `BG-STAFF-00-01` and `BG-STAFF-10-01` when implemented.

## Blocked By

None - can start immediately.

## Implementation Notes

- Use a small staff reservation operations read-model boundary rather than embedding complex queries in routes.
- Existing staff approve/reject endpoints are dependencies, not part of this issue.
- Preserve Reservation lifecycle language and document/payment/cancellation projections instead of adding UI-only statuses.

## Triage Notes

2026-05-13: Triaged as an unblocked backend/staff-operations enhancement. Staff review mutation/download endpoints and assigned-facility checks exist, but `staff-00-home.md` and `staff-10-reservation-lists.md` still record missing queue/list read models.

## Agent Brief

Implement through vertical TDD against public staff API endpoints.

Scope:

- Add assigned-staff verification queue read model for actionable document, payment, and cancellation review work.
- Add assigned-staff reservation list read model for mixed lifecycle states.
- Include reservation identity/code, facility, student, organization unit, activity time, lifecycle status, document/payment/cancellation projections, workflow type, and due dates where applicable.
- Support list filters for status, facility, and date range.
- Enforce assigned-facility scope and staff-only access.
- Update `BG-STAFF-00-01` and `BG-STAFF-10-01` when implemented.

Suggested first behavior test:

- An assigned staff user can fetch `GET /staff/reservations/verification-queue` and receives only assigned-facility actionable document review items.

Evidence to record when closing:

- Targeted API tests for queue, list filters, assigned-facility scoping, and non-staff denial.
- Documentation updates in the staff home and reservation list page briefs plus backend gap ledger.

## Update Log

2026-05-13: Implemented and verified staff assigned-reservation queue/list read models.

- Code evidence: `app/api/routes/staff_reservation_operation_routes.py` adds `GET /staff/reservations/verification-queue` and `GET /staff/reservations`; `app/services/staff_reservation_operations.py` owns the staff-facing read-model projection; `app/repositories/staff_reservation_operations_repository.py` scopes queries to assigned Facilities and applies list filters.
- API behavior evidence: `tests/test_staff_reservation_operations.py` verifies assigned queue scoping, document/payment/cancellation actionable workflow items, list status/Facility/date filters, lifecycle and review projections, unassigned exclusion, and student denial.
- Wiring evidence: `tests/test_http_application.py` verifies the new route group is registered through the runtime dependency registry and default app build.
- Documentation evidence: `docs/frontend/per-page-brief/staff-00-home.md`, `docs/frontend/per-page-brief/staff-10-reservation-lists.md`, `docs/frontend/backend-gaps.md`, and `README.md` document the implemented queue/list contracts.
- Test command: `uv run pytest tests/test_staff_reservation_operations.py tests/test_http_application.py` passed with 9 tests.
