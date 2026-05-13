---
id: ISSUE-0074
type: issue
title: Staff Reservation queue and list integration
status: done
category: enhancement
agent_mode: AFK
area:
  - frontend
prd: PRD-0005
blocked_by:
  - ISSUE-0061
  - ISSUE-0063
created: 2026-05-13
updated: 2026-05-13
---

# ISSUE-0074: Staff Reservation queue and list integration

## Parent

PRD-0005

## What to build

Wire Staff home verification queue and Staff Reservation list to assigned-facility backend read models.

## Acceptance criteria

- [x] Staff home loads actionable verification queue items.
- [x] Staff Reservation list loads assigned Reservations with status, Facility, and date filters.
- [x] Rows/cards route to Staff Reservation detail using backend Reservation IDs.
- [x] Staff status labels and tones come from a shared Staff operation mapper.
- [x] Empty, loading, and error states preserve operational layout.
- [x] Vitest/RTL tests cover queue rendering, list rendering, filter params, empty state, error retry, and assigned-only assumptions via mocked data.
- [x] Staff home/list screenshots remain green or are updated only for intentional normalization.

## Blocked By

- ISSUE-0061
- ISSUE-0063

## Implementation Notes

- Staff can see operational Reservation details for assigned Facilities only.
- Keep mapper separate from Student Reservation projection mapper.

## Contract Mapping

| Backend field / endpoint | Frontend view model | Mapping rule | Omitted/deferred fields |
| --- | --- | --- | --- |
| `GET /staff/reservations/verification-queue[]` | queue row | Use workflow type and review status | Unassigned Facilities |
| `GET /staff/reservations[]` | reservation list row | Use assigned operation item | Fixture applicant roles if unsupported |
| `workflow_type/review_status` | badge/action | Shared Staff mapper | Page-local status strings |

## Agent Brief

**Category:** enhancement
**Summary:** Integrate the Staff home verification queue and Staff Reservation list with assigned-facility Reservation backend read models.

**Current behavior:**
Staff queue and Reservation list surfaces are implemented from deterministic frontend data. They do not yet load assigned operational Reservation rows from the backend API layer, send supported filter parameters, or share a Staff-specific operation status mapper for workflow labels and badge tones.

**Desired behavior:**
The Staff home should load actionable verification queue items for the signed-in Staff user's assigned Facilities. The Staff Reservation list should load assigned Reservations from the backend with supported status, Facility, and date filtering. Queue/list rows and cards should route to Staff Reservation detail using backend Reservation IDs. Loading, empty, and error states should preserve the approved operational Staff layout and support retry where the existing page pattern provides it.

**Key interfaces:**
- Staff Reservation queue endpoint response — should be mapped to queue rows using backend Reservation IDs, Facility/event/student context, workflow type, review status, and actionable timestamps.
- Staff Reservation list endpoint response — should be mapped to list rows/cards using assigned Reservation data, status, Facility, event date/time, applicant/Organization Unit context, and supported pagination/filter metadata if present.
- Staff Reservation filter model — should send only backend-supported status, Facility, and date parameters and should not preserve fixture-only filtering assumptions.
- Shared Staff operation mapper — should translate Staff workflow/status values into Indonesian labels, tones, and action hints for both Staff home queue items and Staff Reservation list rows.

**Acceptance criteria:**
- [x] Staff home loads actionable verification queue items.
- [x] Staff Reservation list loads assigned Reservations with status, Facility, and date filters.
- [x] Rows/cards route to Staff Reservation detail using backend Reservation IDs.
- [x] Staff status labels and tones come from a shared Staff operation mapper.
- [x] Empty, loading, and error states preserve operational layout.
- [x] Vitest/RTL tests cover queue rendering, list rendering, filter params, empty state, error retry, and assigned-only assumptions via mocked data.
- [x] Staff home/list screenshots remain green or are updated only for intentional normalization.

**Out of scope:**
- Staff Reservation detail loading or review decision actions.
- Staff Facility list, schedule, or edit integration.
- Backend schema changes unless a verified contract mismatch blocks this slice.
- Super Admin or Student Reservation surfaces.

## Update Log

### 2026-05-13

- Completed Staff queue/list backend integration.
  - Added Staff Reservation operation response mapping with shared Staff status label/tone logic in `frontend/src/reservations/staffReservationOperations.ts`.
  - Wired Staff home to `GET /staff/reservations/verification-queue` with loading, empty, error, retry, mapped queue rows, and backend-ID detail links.
  - Wired Staff Reservation list to `GET /staff/reservations` with supported `status`, `facility_id`, `date_from`, and `date_to` query parameters, mapped rows, empty/error/retry states, and backend-ID detail links.
  - Added Vitest/RTL coverage in `frontend/src/pages/staff/StaffReservationOperationsPages.test.tsx` for queue rendering, list rendering, filter params, empty state, error retry, and assigned-only backend assumptions through mocked assigned data.
  - Updated Staff Playwright screenshot coverage in `frontend/tests/e2e/staff-home-reservations.spec.ts` to mock the integrated Staff endpoints and regenerated the Staff home/list desktop and mobile snapshots for intentional backend-data normalization.
- Verification: `npm test -- --run src/pages/staff/StaffReservationOperationsPages.test.tsx`; `npm run typecheck`; `npx playwright test tests/e2e/staff-home-reservations.spec.ts`.
- Note: `npm run lint` was attempted but remains blocked by pre-existing unrelated lint errors in `frontend/src/auth/session.tsx`, student page/test files, and student e2e specs; the new Staff hook warning found during that run was fixed.
