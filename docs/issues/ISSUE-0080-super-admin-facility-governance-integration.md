---
id: ISSUE-0080
type: issue
title: Super Admin Facility governance integration
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

# ISSUE-0080: Super Admin Facility governance integration

## Parent

PRD-0005

## What to build

Wire Super Admin Facility governance to backend governance rows and staff assignment actions.

## Acceptance criteria

- [x] Facility governance page loads backend Facility governance rows.
- [x] Rows/cards display active state, assignment coverage, active assigned staff counts, and issue flags.
- [x] Assignment PUT/DELETE actions use backend Facility/staff IDs where represented.
- [x] Facility create/import actions are disabled or deferred unless separately scoped.
- [x] Loading, empty, and error states preserve layout.
- [x] Vitest/RTL tests cover governance render, issue flags, assignment action success/error, deferred actions, and error recovery.
- [x] Super Admin Facility screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063
- ISSUE-0078

## Implementation Notes

- Do not implement Facility creation/import in this slice.
- Use backend issue flags directly instead of deriving unsupported warnings.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /admin/facilities/governance[]` | governance card/row | Render coverage, counts, flags | Fixture thumbnails if unsupported |
| `assigned_staff_count` | staff count label | Display backend count | Staff names unless available elsewhere |
| Assignment mutation endpoints | assign/unassign actions | Use backend IDs | Facility create/import |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate the Super Admin Facility governance page with backend governance rows and supported staff assignment mutations.

**Current behavior:**
The `/super-admin/facilities` page is fixture-backed. It renders facility KPI cards, facility rows, and a latest-assignment panel from static frontend data, while import/create actions are already visually deferred.

**Desired behavior:**
The page should load governance rows from `GET /admin/facilities/governance`, render backend active state, assignment coverage, assigned staff counts, active assigned staff counts, and `issue_flags` directly. Unsupported facility create/import flows must remain disabled/deferred. Assignment actions should call the existing backend staff assignment endpoints only when the UI has both a facility ID and a staff ID to act on; otherwise those controls should remain deferred or absent. Loading, empty, and error states should preserve the page structure and offer retry for recoverable failures.

**Key interfaces:**
- `GET /admin/facilities/governance` returns `FacilityGovernanceResponse[]`.
- Governance fields: `id`, `name`, `category`, `location`, `capacity`, `is_active`, `assigned_staff_count`, `active_assigned_staff_count`, `assignment_coverage`, and `issue_flags`.
- `PUT /admin/facilities/:facilityId/staff-assignments/:staffId` assigns staff.
- `DELETE /admin/facilities/:facilityId/staff-assignments/:staffId` unassigns staff.

**Acceptance criteria:**
- [x] Facility governance page loads backend rows from `GET /admin/facilities/governance`.
- [x] Rows/cards display active state, assignment coverage, active assigned staff counts, and backend issue flags.
- [x] Assignment PUT/DELETE actions use backend Facility/staff IDs when represented.
- [x] Facility create/import actions are disabled or deferred unless separately scoped.
- [x] Loading, empty, and error states preserve layout and include recoverable retry where appropriate.
- [x] Vitest/RTL tests cover governance render, issue flags, assignment action success/error, deferred actions, empty state, and error recovery.
- [x] Super Admin Facility screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Facility creation/import implementation.
- Staff search or staff directory UX beyond acting on an explicitly supplied staff ID.
- Backend route/schema changes unless a verified contract mismatch blocks the integration.

## Update Log

- 2026-05-13: Integrated `/super-admin/facilities` with `GET /admin/facilities/governance`, rendering backend active state, assignment coverage, assigned/active staff counts, and issue flags. Added per-facility staff-ID assignment controls that call the existing PUT/DELETE staff assignment endpoints.
- 2026-05-13: Preserved create/import as deferred actions and added loading, empty, API error, retry, success, and mutation error feedback.
- 2026-05-13: Verification: `npm test -- --run src/pages/super-admin/SuperAdminDashboardUsersPages.test.tsx`, `npm run typecheck`, and `npx playwright test tests/e2e/super-admin-facilities-reports.spec.ts` passed. `npm run lint` still fails only in pre-existing auth/student files, with no Super Admin files reported.
