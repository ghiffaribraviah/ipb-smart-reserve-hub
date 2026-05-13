---
id: ISSUE-0034
type: issue
title: Add staff private Facility schedule read model
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

# ISSUE-0034: Add staff private Facility schedule read model

## Parent

PRD-0003

## What to build

Add a staff-scoped Facility schedule read model that exposes private operational Reservation data for assigned Facilities. This fills the gap left by the public Facility calendar, which intentionally hides student and workflow details.

## Acceptance criteria

- [x] Staff can fetch schedule entries for an assigned Facility over a requested date range.
- [x] Schedule entries include activity title, Organization Unit, starts/ends, Reservation status, and review type or workflow state where relevant.
- [x] Schedule entries include enough Reservation identity data for the frontend to route to staff reservation detail when appropriate.
- [x] The public Facility calendar remains public and does not start exposing private staff data.
- [x] Staff cannot fetch private schedule data for unassigned Facilities.
- [x] Non-staff users cannot access private staff schedule endpoints.
- [x] Frontend backend gap documentation updates `BG-STAFF-02-01` from `needs-verification` to resolved/implemented when done.

## Blocked By

- ISSUE-0032

## Implementation Notes

- Treat this as staff operational schedule data, not a replacement for Public Facility Calendar.
- Prefer reusing the assigned-reservation query/read-model boundary from ISSUE-0032.

## Triage Notes

2026-05-13: Triaged as a backend/staff-operations enhancement now unblocked by ISSUE-0032. Public Facility calendar exists but intentionally lacks staff operational fields such as Reservation identity/status/workflow state; implement a separate assigned-staff schedule read model.

## Agent Brief

Implement through vertical TDD against the public staff API.

Scope:

- Add `GET /staff/facilities/{facility_id}/schedule` for staff assigned to the Facility.
- Support requested date range with `start` and `end` query parameters.
- Return private operational schedule entries with Reservation identity/code, activity title, Organization Unit, starts/ends, lifecycle status, workflow/review type, and staff detail route data.
- Preserve the public `GET /facilities/{facility_id}/calendar` response shape and visibility rules.
- Enforce assigned-facility scope and staff-only access.
- Update `BG-STAFF-02-01` when implemented.

Suggested first behavior test:

- Assigned staff can fetch schedule entries for an assigned Facility over a date range and receives status/workflow/Reservation routing data.

Evidence to record when closing:

- Targeted API tests for assigned schedule data, unassigned denial/not found, non-staff denial, and public calendar shape preservation.
- Documentation update in `staff-02-facility-schedule.md` and backend gap ledger.

## Update Log

2026-05-13: Implemented and verified staff private Facility schedule read model.

- Code evidence: `app/api/routes/staff_reservation_operation_routes.py` adds `GET /staff/facilities/{facility_id}/schedule`; `app/services/staff_reservation_operations.py` projects private schedule entries with Reservation identity, Organization Unit, lifecycle status, workflow/review state, and detail URL; `app/repositories/staff_reservation_operations_repository.py` enforces assigned Facility scope and date overlap filtering.
- API behavior evidence: `tests/test_staff_reservation_operations.py` verifies assigned Facility schedule data, requested date range filtering, Reservation routing data, unassigned staff not found, and non-staff forbidden behavior.
- Public calendar evidence: `tests/test_facility_browsing.py::test_students_view_public_facility_calendar_without_private_reservation_data` remains green, and the new schedule test asserts the public calendar does not expose `reservation_id`, `status`, or `workflow_type`.
- Documentation evidence: `docs/frontend/per-page-brief/staff-02-facility-schedule.md`, `docs/frontend/backend-gaps.md`, and `README.md` document the implemented private staff schedule contract.
- Test command: `uv run pytest tests/test_staff_reservation_operations.py tests/test_http_application.py tests/test_facility_browsing.py::test_students_view_public_facility_calendar_without_private_reservation_data` passed with 14 tests.
