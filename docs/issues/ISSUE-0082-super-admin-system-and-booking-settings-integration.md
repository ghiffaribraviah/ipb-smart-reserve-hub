---
id: ISSUE-0082
type: issue
title: Super Admin system and Booking Settings integration
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

# ISSUE-0082: Super Admin system and Booking Settings integration

## Parent

PRD-0005

## What to build

Wire Super Admin system status and Booking Settings read/update behavior to backend contracts.

## Acceptance criteria

- [x] System page loads backend, database, storage, application, and worker status from the system status endpoint.
- [x] Booking Settings form loads current settings from the backend.
- [x] Save submits the full supported Booking Settings payload.
- [x] Invalid settings errors map to visible form feedback.
- [x] Save is disabled while unchanged, invalid, or pending.
- [x] Unsupported settings history action is disabled or deferred.
- [x] Vitest/RTL tests cover status render, settings load, successful save, invalid settings, unchanged state, failed status load, and deferred history action.
- [x] Super Admin system screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0078

## Implementation Notes

- Booking Settings are admin-managed Reservation policy values; keep labels clear and Indonesian.
- Do not invent status percentages from simple status checks.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /admin/system-status` | service status list | Render service statuses directly | Uptime/storage percentages if unsupported |
| `GET /admin/settings` | settings form | Populate all supported values | Settings history |
| `PATCH /admin/settings` | save action | Submit complete settings object | Partial unknown setting rows |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate the Super Admin System page with system status and Booking Settings read/update backend contracts.

**Current behavior:**
The `/super-admin/system` page is fixture-backed. It shows service status rows and read-only booking setting fields, while save/history actions are static controls.

**Desired behavior:**
The page should load service checks from `GET /admin/system-status`, load editable Booking Settings from `GET /admin/settings`, and submit the full supported settings object to `PATCH /admin/settings`. Save should be disabled when settings are unchanged, invalid, or pending. Backend validation errors should appear as visible form feedback. Settings history must remain deferred because there is no supported history endpoint.

**Key interfaces:**
- `GET /admin/system-status` returns `backend`, `database`, `storage`, `application`, and `worker` status checks.
- `GET /admin/settings` returns all supported Booking Settings fields.
- `PATCH /admin/settings` accepts and returns the complete Booking Settings object.

**Acceptance criteria:**
- [x] System page loads backend, database, storage, application, and worker status from the system status endpoint.
- [x] Booking Settings form loads current settings from the backend.
- [x] Save submits the full supported Booking Settings payload.
- [x] Invalid settings errors map to visible form feedback.
- [x] Save is disabled while unchanged, invalid, or pending.
- [x] Unsupported settings history action is disabled or deferred.
- [x] Vitest/RTL tests cover status render, settings load, successful save, invalid settings, unchanged state, failed status load, and deferred history action.
- [x] Super Admin system screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Settings history/audit timeline.
- New backend setting fields or route changes unless a verified contract mismatch blocks the integration.

## Update Log

- 2026-05-13: Integrated `/super-admin/system` with `GET /admin/system-status`, `GET /admin/settings`, and `PATCH /admin/settings`; added editable Booking Settings fields, full-payload save, unchanged/invalid/pending save disablement, validation feedback, and recoverable status/settings errors.
- 2026-05-13: Kept settings history deferred because no backend history endpoint is registered.
- 2026-05-13: Verification: `npm test -- --run src/pages/super-admin/SuperAdminDashboardUsersPages.test.tsx`, `npm run typecheck`, and `npx playwright test tests/e2e/super-admin-system.spec.ts` passed. `npm run lint` still fails only in pre-existing auth/student files, with no Super Admin files reported.
