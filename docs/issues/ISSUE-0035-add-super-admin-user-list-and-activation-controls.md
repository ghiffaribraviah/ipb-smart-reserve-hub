---
id: ISSUE-0035
type: issue
title: Add Super Admin user list and activation controls
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

# ISSUE-0035: Add Super Admin user list and activation controls

## Parent

PRD-0003

## What to build

Add Super Admin user management read and activation controls: a paginated/filterable user list plus activate/deactivate actions. Role mutation is explicitly out of scope.

## Acceptance criteria

- [x] Super Admin can fetch a paginated user list.
- [x] User list supports useful filters for role, active status, and search by identity fields.
- [x] User list rows include identity, role, active status, and available student/staff profile hints.
- [x] Super Admin can deactivate an active User account.
- [x] Super Admin can activate an inactive User account.
- [x] Inactive User accounts cannot log in or refresh sessions.
- [x] A deactivated current user fails current-user/session validation after deactivation.
- [x] Student and staff users cannot access Super Admin user management endpoints.
- [x] No endpoint allows role mutation as part of this issue.
- [x] Frontend backend gap documentation updates `BG-SUPER-01-01` when implemented.

## Blocked By

None - can start immediately.

## Implementation Notes

- Extend User Account management through a small service API rather than placing account status rules in routes.
- Preserve existing admin-created staff/Super Admin creation behavior.
- Consider audit logging activation changes if the existing audit logging boundary is readily available.

## Triage Notes

2026-05-13: Triaged as an unblocked Super Admin backend enhancement. Account creation and active-session validation already exist; missing work is a filterable/paginated user list plus activation/deactivation mutations without role mutation.

## Agent Brief

Implement through vertical TDD against the public Super Admin API.

Scope:

- Add `GET /admin/users` with pagination and filters for role, active status, and search over identity fields.
- Return identity, role, active status, and available profile hints already owned by account projection (`nim`, `phone`, academic profile for students; null where unavailable).
- Add `POST /admin/users/{user_id}/deactivate` and `POST /admin/users/{user_id}/activate`.
- Preserve existing `POST /admin/users` behavior for staff/Super Admin, allow Super Admin-created student accounts with required NIM/phone, and do not add any role mutation endpoint.
- Ensure inactive users cannot login/refresh and deactivated current tokens fail `/auth/me` through existing active-user resolution.
- Enforce Super Admin-only access.
- Update `BG-SUPER-01-01` when implemented.

Suggested first behavior test:

- Super Admin can fetch a paginated filtered user list with identity, role, active status, and student profile hints.

Evidence to record when closing:

- Targeted API tests for listing/filtering/pagination, activate/deactivate behavior, inactive login/session behavior, non-admin denial, and no role mutation route.
- Documentation update in `super-01-pengguna.md` and backend gap ledger.

## Update Log

2026-05-13: Implemented and verified Super Admin user list and activation controls.

- Code evidence: `backend/app/api/routes/account_routes.py` adds `GET /admin/users`, `POST /admin/users`, `POST /admin/users/{user_id}/deactivate`, and `POST /admin/users/{user_id}/activate`; `backend/app/services/accounts.py` owns pagination, Super Admin-created student identity fields, and status mutation behavior; `backend/app/repositories/user_repository.py` applies role, active-status, and identity search filters.
- API behavior evidence: `backend/tests/test_super_admin_user_management.py` verifies paginated/filterable listing, student profile fields, activation/deactivation, inactive login/refresh rejection, deactivated token `/auth/me` rejection, and student/staff denial.
- Scope evidence: `backend/tests/test_http_application.py` verifies no `/admin/users/{user_id}/role` route exists.
- Documentation evidence: `docs/frontend/per-page-brief/super-01-pengguna.md`, `docs/frontend/backend-gaps.md`, and `README.md` document the implemented user-management contract.
- Test command: `uv run pytest backend/tests/test_super_admin_user_management.py backend/tests/test_http_application.py backend/tests/test_auth_foundation.py::test_inactive_users_cannot_login_or_refresh_sessions` passed with 9 tests.
