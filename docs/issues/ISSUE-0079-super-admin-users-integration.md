---
id: ISSUE-0079
type: issue
title: Super Admin users integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
  - ISSUE-0078
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0079: Super Admin users integration

## Parent

PRD-0005

## What to build

Wire Super Admin user listing, filtering, creation, activation, and deactivation to backend User account contracts.

## Acceptance criteria

- [x] Users page loads paginated/filterable User accounts from the backend.
- [x] Filters send supported role, active status, search, page, and page size parameters.
- [x] Create user supports backend-managed Staff and Super Admin account creation only.
- [x] Activate/deactivate actions submit to backend and update/refetch user rows.
- [x] Student rows display supported academic profile fields when present and degrade gracefully when null.
- [x] Unsupported last-activity, review flag, or access-management fields are removed, disabled, or deferred.
- [x] Vitest/RTL tests cover list render, filters, create user success/errors, activate/deactivate, student academic fields, empty state, and error recovery.
- [x] Super Admin users screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0078

## Implementation Notes

- Student self-registration remains separate from admin-managed user creation.
- Keep internal role values as backend role names.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /admin/users.items[]` | user row/card | Use identity, role, active status, NIM/phone/profile | Last activity, review flag |
| `POST /admin/users` | create form | Staff/Super Admin only | Admin-created Student |
| Activate/deactivate endpoints | status action | Refetch or update row after success | Role mutation |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate Super Admin user management with backend account listing, creation, and activation contracts.

**Current behavior:**
The Super Admin Users page is fixture-backed. It shows fixed KPI counts, filter controls, user rows, and action buttons, but it does not load paginated/filterable accounts from the backend, submit supported create-user requests, or activate/deactivate accounts. Some fixture fields imply last activity, profile review flags, or access-management operations that are not part of the current backend contract.

**Desired behavior:**
The Users page should load backend user accounts with supported pagination, search, role, and active-status filters. Rows/cards should display identity, backend role, active state, and supported student fields such as NIM, phone, and academic profile when present, with quiet fallback values when profile fields are null. Admin-managed user creation should support Staff and Super Admin accounts only; student creation must remain self-registration. Activate/deactivate actions should call the backend status endpoints and refresh or update the visible rows. Unsupported last-activity, profile-review, role mutation, or access-management fields should be removed, disabled, or clearly deferred.

**Key interfaces:**
- `GET /admin/users` — source of truth for paginated/filterable user rows; supports `role`, `is_active`, `search`, `page`, and `page_size`.
- `UserListResponse.items[]` — row/card data for identity, role, active status, NIM, phone, and optional academic profile.
- `POST /admin/users` with `AdminCreateUserRequest` — create Staff or Super Admin accounts; student role should not be offered for admin creation.
- `POST /admin/users/:userId/deactivate` and `POST /admin/users/:userId/activate` — status mutations that should update/refetch visible rows.

**Acceptance criteria:**
- [x] Users page loads paginated/filterable User accounts from `GET /admin/users`.
- [x] Filters send supported role, active status, search, page, and page-size parameters.
- [x] Create user supports backend-managed Staff and Super Admin account creation only, with visible success and validation/API error feedback.
- [x] Activate/deactivate actions submit to backend and update/refetch user rows.
- [x] Student rows display supported academic profile fields when present and degrade gracefully when null.
- [x] Unsupported last-activity, review flag, role mutation, or access-management fields are removed, disabled, or clearly deferred.
- [x] Vitest/RTL tests cover list render, filters, create user success/errors, activate/deactivate, student academic fields, empty state, and error recovery.
- [x] Super Admin users screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Admin-created Student accounts.
- Role mutation, password reset, detailed access-management screens, or last-activity analytics.
- Backend route/schema changes unless a verified contract mismatch blocks the integration.

## Update Log

- 2026-05-13: Integrated `SuperAdminUsersPage` with `/admin/users` list/filter, user creation, and activate/deactivate endpoints; removed fixture-only user management fields and added supported feedback/empty/error states.
- 2026-05-13: Added RTL coverage for list rendering, filters, create success/error, status mutations, academic profile display, empty state, and recovery. Updated Playwright mocks and desktop/mobile screenshots for the backend-backed users view.
- 2026-05-13: Verification: `npm test -- --run src/pages/super-admin/SuperAdminDashboardUsersPages.test.tsx`, `npm run typecheck`, and `npx playwright test tests/e2e/super-admin-dashboard-users.spec.ts` passed. `npm run lint` still fails in pre-existing auth/student files, with no Super Admin users files reported.
