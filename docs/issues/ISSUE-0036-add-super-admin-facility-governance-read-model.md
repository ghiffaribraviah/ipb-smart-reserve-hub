---
id: ISSUE-0036
type: issue
title: Add Super Admin Facility governance read model
status: done
category: enhancement
agent_mode: AFK
area:
  - backend
  - super-admin
prd: PRD-0003
blocked_by: []
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0036: Add Super Admin Facility governance read model

## Parent

PRD-0003

## What to build

Add a Super Admin Facility governance read model for monitoring active, inactive, assigned, and unassigned Facilities. Existing staff assignment mutations should remain the write path for assignment changes.

## Acceptance criteria

- [x] Super Admin can fetch a Facility governance list.
- [x] Governance rows include Facility identity, category/unit context where available, location, capacity, active state, assigned staff count, and assignment coverage.
- [x] Governance rows expose issue flags such as needing staff when a Facility has no active staff assignment.
- [x] Governance data includes active and inactive Facilities needed for administrative oversight.
- [x] Existing Super Admin assign/unassign staff endpoints continue to work and are not duplicated.
- [x] Student and staff users cannot access Super Admin Facility governance endpoints.
- [x] Bulk facility import behavior is not added.
- [x] Frontend backend gap documentation updates `BG-SUPER-02-01` when implemented.

## Blocked By

None - can start immediately.

## Implementation Notes

- Keep this as a governance read model, not a broad Facility administration workflow.
- Reuse Facility Management and assignment domain language where possible.

## Triage Notes

2026-05-13: Triaged as an unblocked Super Admin backend enhancement. Existing assignment mutation endpoints are the write path; this issue should add only a governance read model for active/inactive Facility coverage and assignment issue flags.

## Agent Brief

Implement through vertical TDD against the public Super Admin API.

Scope:

- Add a Super Admin Facility governance list endpoint.
- Include Facility identity, category context, location, capacity, active state, assigned staff count, active assigned staff count, assignment coverage, and issue flags such as `needs_staff`.
- Include both active and inactive Facilities.
- Preserve existing assign/unassign endpoints as the only assignment write path.
- Do not add bulk Facility import behavior.
- Enforce Super Admin-only access.
- Update `BG-SUPER-02-01` when implemented.

Suggested first behavior test:

- Super Admin can fetch governance rows containing active and inactive Facilities, assignment counts, and `needs_staff` issue flags.

Evidence to record when closing:

- Targeted API tests for governance rows, active/inactive inclusion, assignment coverage, non-admin denial, single-facility creation, and no import route.
- Documentation update in `super-02-fasilitas.md` and backend gap ledger.

## Update Log

2026-05-13: Implemented and verified Super Admin Facility governance read model.

- Code evidence: `backend/app/api/routes/facility_management_routes.py` adds `GET /admin/facilities/governance` and `POST /admin/facilities`; `backend/app/services/facility_management.py` creates single Facilities and projects governance rows with active/inactive state, assigned staff counts, active assigned staff counts, coverage, and issue flags; `backend/app/repositories/facility_management_repository.py` loads all Facilities with staff assignments.
- API behavior evidence: `backend/tests/test_super_admin_facility_governance.py` verifies active/inactive Facility rows, assignment coverage, `needs_staff` issue flags, and student/staff denial.
- Scope evidence: `backend/tests/test_http_application.py` verifies existing assign/unassign routes remain registered, `POST /admin/facilities` is registered, and no `/admin/facilities/import` route exists.
- Documentation evidence: `docs/frontend/per-page-brief/super-02-fasilitas.md`, `docs/frontend/backend-gaps.md`, and `README.md` document the implemented governance contract.
- Test command: `uv run pytest backend/tests/test_super_admin_facility_governance.py backend/tests/test_http_application.py` passed with 7 tests.
